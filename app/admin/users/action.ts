'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

interface UserRoleRow {
    id: string;
    role: string;
}

interface UserAuthRow {
    id: string;
    role: string;
    auth_id: string | null;
}

interface ImageRow {
    image_url: string;
}

interface BookingIdRow {
    id: string;
}

async function currentAdminId(): Promise<string> {
    const { data } = await auth.getSession();
    if (!data?.user) throw new Error('Not authenticated');
    const [admin] = (await sql`
        SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1
    `) as UserRoleRow[];
    if (!admin || admin.role !== 'ADMIN') throw new Error('Admin access required');
    return admin.id;
}

// UploadThing serves files at .../f/<key> (or https://<app>.ufs.sh/f/<key>
// on newer accounts) — either way the key is the final path segment. Safer
// than relying on hostel_images.caption, which only stores the key on the
// create-listing path, not on the edit-listing path.
function keyFromUploadThingUrl(url: string): string | null {
    try {
        const { pathname } = new URL(url);
        const segments = pathname.split('/').filter(Boolean);
        return segments.length > 0 ? segments[segments.length - 1] : null;
    } catch {
        return null;
    }
}

// Neon Auth's `neon_auth.users_sync` table is a synced mirror of the auth
// provider, not a table we own — deleting the row directly isn't reliable
// (the next sync can reintroduce it, and it leaves the actual auth account
// alive, so the person could still exist as a login with no `users` row
// behind it). The supported way to remove them is Neon's Auth Management
// API, which deletes the underlying auth user and lets that removal sync
// down to `users_sync` on its own.
// Docs: https://neon.com/docs/neon-auth/api
async function deleteNeonAuthUser(authId: string): Promise<void> {
    const apiKey = process.env.NEON_API_KEY;
    const projectId = process.env.NEON_PROJECT_ID;
    if (!apiKey || !projectId) {
        console.error(
            `Skipped Neon Auth deletion for auth_id ${authId}: NEON_API_KEY / NEON_PROJECT_ID not configured`
        );
        return;
    }

    const res = await fetch(
        `https://console.neon.tech/api/v2/projects/${projectId}/auth/users/${authId}`,
        {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiKey}` },
        }
    );

    // 404 means it's already gone (e.g. a retry after a partial failure) —
    // treat that as success rather than an error.
    if (!res.ok && res.status !== 404) {
        const body = await res.text().catch(() => '');
        throw new Error(`Neon Auth delete failed (${res.status}): ${body}`);
    }
}

export async function deleteUserCompletely(userId: string) {
    const adminId = await currentAdminId();

    if (userId === adminId) {
        throw new Error("You can't delete your own account from here.");
    }

    const [target] = (await sql`
        SELECT id, role, auth_id FROM users WHERE id = ${userId} LIMIT 1
    `) as UserAuthRow[];
    if (!target) throw new Error('User not found');
    if (target.role === 'ADMIN') {
        throw new Error('Admin accounts cannot be deleted from this panel.');
    }

    // --- Collect every UploadThing file this user's data references,
    // BEFORE anything below cascade-deletes the rows that reference them.
    const hostelImages = (await sql`
        SELECT hi.image_url
        FROM hostel_images hi
                 JOIN hostels h ON h.id = hi.hostel_id
        WHERE h.owner_id = ${userId}
    `) as ImageRow[];
    const roomImages = (await sql`
        SELECT ri.image_url
        FROM room_images ri
                 JOIN rooms r ON r.id = ri.room_id
                 JOIN hostels h ON h.id = r.hostel_id
        WHERE h.owner_id = ${userId}
    `) as ImageRow[];
    const fileKeys = [...hostelImages, ...roomImages]
        .map((row) => keyFromUploadThingUrl(row.image_url))
        .filter((k): k is string => Boolean(k));

    // --- Bookings this user made as a STUDENT, plus bookings against any
    // of their hostels if they're an OWNER. Read OUTSIDE the transaction:
    // the neon HTTP driver's transaction() only takes a fixed batch of
    // queries decided up front — it can't branch on a result from a query
    // earlier in the same transaction, so the decision of *which* deletes
    // to run has to be made before the batch is built.
    const bookings = (await sql`
        SELECT b.id FROM bookings b
        WHERE b.student_id = ${userId}
           OR b.space_id IN (
            SELECT rs.id FROM room_spaces rs
                                  JOIN rooms r ON r.id = rs.room_id
                                  JOIN hostels h ON h.id = r.hostel_id
            WHERE h.owner_id = ${userId}
        )
    `) as BookingIdRow[];
    const bookingIds = bookings.map((b) => b.id);

    // --- One transaction: either the whole cleanup succeeds, or none of
    // it does. Order matters — every query below exists to satisfy an
    // ON DELETE RESTRICT constraint that would otherwise block the next one.
    // sql.transaction() sends this whole batch to run sequentially inside
    // a single server-side transaction — that's what gives us the ordering
    // and atomicity .begin() would have, on the HTTP driver.
    await sql.transaction((tx) => {
        const queries = [];

        if (bookingIds.length > 0) {
            // reviews.booking_id and payments.booking_id are both
            // ON DELETE RESTRICT — must clear before the bookings themselves.
            queries.push(tx`DELETE FROM reviews WHERE booking_id = ANY(${bookingIds})`);
            queries.push(tx`DELETE FROM payments WHERE booking_id = ANY(${bookingIds})`);
            queries.push(tx`DELETE FROM bookings WHERE id = ANY(${bookingIds})`);
        }

        // Conversations this user is party to, as either student or owner —
        // cascades messages and messaging_payments automatically.
        queries.push(tx`DELETE FROM conversations WHERE student_id = ${userId} OR owner_id = ${userId}`);

        // Reports filed by or about this user. reporter_id is NOT NULL +
        // RESTRICT, so these rows can't survive with the reporter gone.
        queries.push(tx`DELETE FROM reports WHERE reporter_id = ${userId} OR reported_user_id = ${userId}`);

        // Hostels owned by this user — cascades rooms, room_spaces,
        // hostel_images, room_images, hostel_amenities, room_amenities.
        // Safe now: every booking against their room_spaces was removed above.
        queries.push(tx`DELETE FROM hostels WHERE owner_id = ${userId}`);

        // Everything else — student_profiles, owner_profiles,
        // owner_verifications, notifications, subscriptions — is already
        // ON DELETE CASCADE straight off users.id.
        queries.push(tx`DELETE FROM users WHERE id = ${userId}`);

        return queries;
    });

    // --- Auth cleanup also runs after the DB transaction commits. The
    // `users` row is already gone at this point regardless of whether this
    // succeeds, so a failed call here leaves an orphaned Neon Auth account
    // (not a half-deleted user) — a cleanup task, same as a failed
    // UploadThing delete below.
    if (target.auth_id) {
        try {
            await deleteNeonAuthUser(target.auth_id);
        } catch (err) {
            console.error(`Failed to delete Neon Auth user for ${userId} (auth_id=${target.auth_id}):`, err);
        }
    }

    // --- Storage cleanup runs after the DB transaction commits, so a
    // failed UploadThing call never blocks or rolls back the user deletion.
    if (fileKeys.length > 0) {
        try {
            await utapi.deleteFiles(fileKeys);
        } catch (err) {
            console.error(`Failed to delete UploadThing files for user ${userId}:`, fileKeys, err);
            // Not re-thrown — the user record is already gone. An orphaned
            // file left in storage is a cleanup task, not a reason to have
            // left the user half-deleted.
        }
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin');

    return { success: true, deletedFileCount: fileKeys.length };
}