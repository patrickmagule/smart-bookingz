import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { StudentShell } from '@/components/student/studentShell';
import { getUnreadMessageCount, getUnreadNotificationsCount } from '@/lib/data/studentDashboard';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const { data } = await auth.getSession();

    if (!data?.user) {
        redirect('/auth/sign-in');
    }

    const [user] = await sql`SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;

    if (!user || user.role !== 'STUDENT') {
        if (user?.role === 'OWNER') redirect('/hostelOwner');
        if (user?.role === 'ADMIN') redirect('/admin');
        redirect('/');
    }

    const [unreadMsgs, unreadNotifs] = await Promise.all([
        getUnreadMessageCount(user.id),
        getUnreadNotificationsCount(user.id),
    ]);

    return (
        <StudentShell user={data.user} unreadMsgs={unreadMsgs} unreadNotifs={unreadNotifs}>
            {children}
        </StudentShell>
    );
}