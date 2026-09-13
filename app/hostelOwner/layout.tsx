import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { OwnerShell } from '@/components/owner/ownerShell';
import { signOutAction } from '@/app/auth/actions';

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

    if (!ownerVerified) {
        // Double check: if they somehow bypassed the sign-in check (e.g. they were already logged in)
        // we should probably still block them if they aren't verified.
        // However, the issue specifically mentioned redirecting them during login.
        // To be safe and satisfy "should not be redirecting him to the hostelOwner homepage",
        // we can also handle it here.
        // But throwing an error in layout might be harsh if they need to see something.
        // The prompt says: "we should be throwinfg an error saying that you cant access the system . not verifed by an admin. wait untill verifed or call customer support"
        
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-lg text-gray-700 max-w-md">
                    You can&#39;t access the system. Not verified by an admin. Wait until verified or call customer support.
                </p>
                <div className="mt-8">
                    <form action={signOutAction}>
                        <button type="submit" className="text-blue-600 hover:underline">
                            Sign out
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const [{ count: pendingCount }] = await sql`
        SELECT COUNT(*) FROM bookings b
                               JOIN room_spaces rs ON b.space_id = rs.id
                               JOIN rooms r ON rs.room_id = r.id
                               JOIN hostels h ON r.hostel_id = h.id
        WHERE h.owner_id = ${user.id} AND b.status = 'PENDING'
    `;

    const [{ count: unreadMsgs }] = await sql`
        SELECT COUNT(*) FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE c.owner_id = ${user.id} AND m.sender_id != ${user.id} AND m.is_read = FALSE
    `;

    const unreadNotifs = 0;

    return (
        <OwnerShell
            user={data.user}
            ownerVerified={ownerVerified}
            pendingCount={Number(pendingCount)}
            unreadMsgs={Number(unreadMsgs)}
            unreadNotifs={unreadNotifs}
        >
            {children}
        </OwnerShell>
    );
}