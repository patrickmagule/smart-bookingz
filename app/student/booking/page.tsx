// app/student/bookings/page.tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { getStudentBookings } from '@/lib/data/studentBooking';

export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<string, string> = {
    PENDING: 'bg-amber-50 text-[#C49A2A]',
    CONFIRMED: 'bg-green-50 text-green-600',
    REJECTED: 'bg-red-50 text-red-600',
    CANCELLED: 'bg-red-50 text-red-600',
    COMPLETED: 'bg-slate-100 text-slate-500',
    EXPIRED: 'bg-slate-100 text-slate-500',
};

export default async function StudentBookingsPage() {
    const { data } = await auth.getSession();
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    if (!user) return <div>User not found</div>;

    const bookings = await getStudentBookings(user.id);

    return (
        <div className="max-w-3xl space-y-4">
            <div>
                <h1 className="font-serif text-2xl text-[#1A1A1E]">My Bookings</h1>
                <p className="text-sm text-[#6B6B78] mt-0.5">Track the status of your booking requests</p>
            </div>

            {bookings.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#6B6B78]">
                    No bookings yet.{' '}
                    <Link href="/student/hostels" className="text-[#1E3A5F] font-medium hover:underline">
                        Browse hostels →
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-[#E0D9CF] border border-[#E0D9CF] rounded-sm bg-white">
                    {bookings.map((b) => (
                        <div
                            key={b.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/student/hostels/${b.hostel_id}`}
                                        className="text-sm font-semibold text-[#1A1A1E] hover:underline"
                                    >
                                        {b.hostel_name}
                                    </Link>
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                                            STATUS_STYLE[b.status] ?? 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {b.status}
                                    </span>
                                </div>
                                <p className="text-xs text-[#6B6B78] mt-0.5">
                                    Room {b.room_number ?? 'N/A'} · Bed {b.space_number ?? 'N/A'} · K
                                    {b.monthly_price.toLocaleString()}/mo
                                </p>
                                <p className="text-xs text-[#6B6B78]">
                                    {format(new Date(b.start_date), 'yyyy-MM-dd')} →{' '}
                                    {b.end_date ? format(new Date(b.end_date), 'yyyy-MM-dd') : 'Open'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}