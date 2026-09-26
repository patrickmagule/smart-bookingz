import { sql } from '@/lib/db';
import Link from 'next/link';
import { getGreeting } from '@/lib/utils/greeting';
import { auth } from '@/lib/auth/server';

export default async function AdminDashboardPage() {
    const { data } = await auth.getSession();
    const authUser = data?.user;

    const [{ count: totalUsers }] = await sql`SELECT COUNT(*) FROM users`;
    const [{ count: totalOwners }] = await sql`SELECT COUNT(*) FROM users WHERE role = 'OWNER'`;
    const [{ count: totalStudents }] = await sql`SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`;
    const [{ count: totalHostels }] = await sql`SELECT COUNT(*) FROM hostels`;
    const [{ count: totalBookings }] = await sql`SELECT COUNT(*) FROM bookings`;
    const [{ count: pendingOwners }] = await sql`SELECT COUNT(*) FROM owner_verifications WHERE status = 'PENDING'`;
    const [{ count: pendingListings }] = await sql`SELECT COUNT(*) FROM hostels WHERE status = 'PENDING_APPROVAL'`;

    const stats = [
        { label: 'Total Users', value: totalUsers },
        { label: 'Hostel Owners', value: totalOwners },
        { label: 'Students', value: totalStudents },
        { label: 'Hostels Listed', value: totalHostels },
        { label: 'Total Bookings', value: totalBookings },
    ];

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">
                    {getGreeting(authUser?.name?.split(' ')[0])} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Platform-wide stats and pending actions.</p>
            </div>

            {(Number(pendingOwners) > 0 || Number(pendingListings) > 0) && (
                <div className="border border-amber-300 bg-amber-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Action needed</p>
                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm">
                        {Number(pendingOwners) > 0 && (
                            <Link href="/admin/owners" className="text-amber-800 underline underline-offset-2">
                                {pendingOwners} owner{Number(pendingOwners) !== 1 ? 's' : ''} awaiting verification
                            </Link>
                        )}
                        {Number(pendingListings) > 0 && (
                            <Link href="/admin/listings" className="text-amber-800 underline underline-offset-2">
                                {pendingListings} listing{Number(pendingListings) !== 1 ? 's' : ''} awaiting verification
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-slate-200 divide-x divide-y sm:divide-y-0 divide-slate-200 rounded-lg overflow-hidden">
                {stats.map((s) => (
                    <div key={s.label} className="p-4">
                        <p className="text-2xl font-semibold text-navy">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/admin/owners" className="border border-slate-200 rounded-lg p-4 block hover:border-navy transition-colors">
                    <p className="text-sm font-semibold text-navy">Verify hostel owners</p>
                    <p className="text-xs text-slate-500 mt-1">Review new owner accounts and approve or reject them.</p>
                </Link>
                <Link href="/admin/listings" className="border border-slate-200 rounded-lg p-4 block hover:border-navy transition-colors">
                    <p className="text-sm font-semibold text-navy">Verify listings</p>
                    <p className="text-xs text-slate-500 mt-1">Approve, reject, or remove listings that don&#39;t follow policy.</p>
                </Link>
            </div>
        </div>
    );
}
