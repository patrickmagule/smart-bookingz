import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { OwnerShell } from '@/components/owner/ownerShell';

export const dynamic = 'force-dynamic';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
    const { data } = await auth.getSession();

    if (!data?.user) {
        redirect('/auth/sign-in');
    }

    const [user] = await sql`
        SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1
    `;

    if (!user || user.role !== 'OWNER') {
        if (user?.role === 'STUDENT') redirect('/student');
        if (user?.role === 'ADMIN') redirect('/admin');
        redirect('/');
    }

    // Verification lives in owner_verifications, not on users.
    // Take the most recent submission for this owner.
    const [verification] = await sql`
        SELECT status FROM owner_verifications
        WHERE owner_id = ${user.id}
        ORDER BY submitted_at DESC
        LIMIT 1
    `;

    const ownerVerified = verification?.status === 'VERIFIED';

    const [{ count: pendingCount }] = await sql`
        SELECT COUNT(*) FROM bookings b
                               JOIN room_spaces rs ON b.space_id = rs.id
                               JOIN rooms r ON rs.room_id = r.id
                               JOIN hostels h ON r.hostel_id = h.id
        WHERE h.owner_id = ${user.id} AND b.status = 'PENDING'
    `;

    // TODO: wire these up to real notifications table (unread messages table doesn't exist yet — messages.is_read + conversations.owner_id)
    const unreadMsgs = 0;
    const unreadNotifs = 0;

    return (
        <OwnerShell
            user={data.user}
            ownerVerified={ownerVerified}
            pendingCount={Number(pendingCount)}
            unreadMsgs={unreadMsgs}
            unreadNotifs={unreadNotifs}
        >
            {children}
        </OwnerShell>
    );
}