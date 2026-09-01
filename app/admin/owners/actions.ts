'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/server';

async function currentAdminId(): Promise<string | null> {
    const { data } = await auth.getSession();
    if (!data?.user) return null;
    const [admin] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    return admin?.id ?? null;
}

// owner_verifications.status must go PENDING -> VERIFIED|REJECTED, and a
// trigger (trg_validate_owner_verification) requires reviewed_at to be set
// whenever status is VERIFIED/REJECTED — both are set together below.
export async function approveOwner(verificationId: string, ownerId: string) {
    const adminId = await currentAdminId();
    await sql`
        UPDATE owner_verifications
        SET status = 'VERIFIED', reviewed_at = now(), reviewed_by = ${adminId}
        WHERE id = ${verificationId}
    `;
    await sql`
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
        VALUES (
            ${ownerId},
            'Verification approved',
            'Your hostel owner account has been verified. You can now publish listings.',
            'OWNER_VERIFIED',
            ${verificationId}
        )
    `;
    revalidatePath('/admin/owners');
    revalidatePath('/admin');
}

export async function rejectOwner(verificationId: string, ownerId: string, reason: string) {
    const adminId = await currentAdminId();
    await sql`
        UPDATE owner_verifications
        SET status = 'REJECTED', reviewed_at = now(), reviewed_by = ${adminId}, review_notes = ${reason}
        WHERE id = ${verificationId}
    `;
    await sql`
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
        VALUES (
            ${ownerId},
            'Verification rejected',
            ${reason || 'Your verification was rejected.'},
            'OWNER_REJECTED',
            ${verificationId}
        )
    `;
    revalidatePath('/admin/owners');
    revalidatePath('/admin');
}

// Deactivating an owner: users.status -> SUSPENDED, and their currently
// published hostels are hidden by setting hostels.status -> SUSPENDED too.
// Reactivating restores PUBLISHED on hostels that were suspended this way.
// Note: this can't distinguish "suspended because the owner was suspended"
// from "suspended individually for another reason" — if you need that,
// it'd take an extra column (e.g. hostels.suspended_reason).
export async function setOwnerStatus(ownerId: string, status: 'ACTIVE' | 'SUSPENDED') {
    await sql`UPDATE users SET status = ${status} WHERE id = ${ownerId}`;
    if (status === 'SUSPENDED') {
        await sql`UPDATE hostels SET status = 'SUSPENDED' WHERE owner_id = ${ownerId} AND status = 'PUBLISHED'`;
    } else {
        await sql`UPDATE hostels SET status = 'PUBLISHED' WHERE owner_id = ${ownerId} AND status = 'SUSPENDED'`;
    }
    revalidatePath('/admin/owners');
    revalidatePath('/admin/listings');
}
