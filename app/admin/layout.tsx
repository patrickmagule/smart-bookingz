import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { AdminShell } from '@/components/admin/adminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data } = await auth.getSession();

    if (!data?.user) {
        redirect('/auth/sign-in');
    }

    const [user] = await sql`SELECT role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;

    if (!user || user.role !== 'ADMIN') {
        if (user?.role === 'STUDENT') redirect('/student');
        if (user?.role === 'OWNER') redirect('/hostelOwner');
        redirect('/');
    }

    const [{ count: pendingOwners }] = await sql`
        SELECT COUNT(*) FROM owner_verifications WHERE status = 'PENDING'
    `;
    const [{ count: pendingListings }] = await sql`
        SELECT COUNT(*) FROM hostels WHERE status = 'PENDING_APPROVAL'
    `;

    return (
        <AdminShell
            user={data.user}
            pendingOwners={Number(pendingOwners)}
            pendingListings={Number(pendingListings)}
        >
            {children}
        </AdminShell>
    );
}
