// app/student/page.tsx
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCalendarCheck, faMessage, faClock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    getStudentBookingStats,
    getActiveBooking,
    getUnreadMessageCount,
    getStudentRecentActivity,
} from '@/lib/data/studentDashboard';

export const dynamic = 'force-dynamic';

export default async function StudentHomePage() {
    const { data } = await auth.getSession();
    const authUser = data?.user;

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
    const userId = user?.id;

    if (!userId) {
        return <div>User not found</div>;
    }

    const [stats, activeBooking, unreadMsgs, recentActivity] = await Promise.all([
        getStudentBookingStats(userId),
        getActiveBooking(userId),
        getUnreadMessageCount(userId),
        getStudentRecentActivity(userId),
    ]);

    const quickActions = [
        { label: 'Find Hostels', href: '/student/hostels', icon: faMagnifyingGlass },
        { label: 'My Bookings', href: '/student/bookings', icon: faCalendarCheck },
        { label: 'Messages', href: '/student/messages', icon: faMessage },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl text-[#1A1A1E]">
                    Welcome back, {authUser?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-[#6B6B78] mt-0.5">Here&#39;s what&#39;s happening with your bookings.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Link href="/student/bookings" className="bg-white border border-[#E0D9CF] rounded-sm p-4 hover:bg-[#F9F8F6] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-[#6B6B78]" />
                        <span className="text-2xl font-bold text-[#1E3A5F]">{stats.pending}</span>
                    </div>
                    <p className="text-xs font-medium text-[#1A1A1E]">Pending requests</p>
                    <p className="text-[10px] text-[#6B6B78] mt-0.5">Awaiting owner response</p>
                </Link>

                <Link href="/student/bookings" className="bg-white border border-[#E0D9CF] rounded-sm p-4 hover:bg-[#F9F8F6] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4 text-[#6B6B78]" />
                        <span className="text-2xl font-bold text-[#1E3A5F]">{stats.confirmed}</span>
                    </div>
                    <p className="text-xs font-medium text-[#1A1A1E]">Confirmed</p>
                    <p className="text-[10px] text-[#6B6B78] mt-0.5">Active bookings</p>
                </Link>

                <Link href="/student/messages" className="bg-white border border-[#E0D9CF] rounded-sm p-4 hover:bg-[#F9F8F6] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faMessage} className="h-4 w-4 text-[#6B6B78]" />
                        <span className="text-2xl font-bold text-[#1E3A5F]">{unreadMsgs}</span>
                    </div>
                    <p className="text-xs font-medium text-[#1A1A1E]">Unread messages</p>
                    <p className="text-[10px] text-[#6B6B78] mt-0.5">From hostel owners</p>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* Active bookings */}
                <div className="lg:col-span-2 bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
                    <div className="border-b border-[#E0D9CF] px-5 py-3.5">
                        <h2 className="font-serif text-lg text-[#1A1A1E]">Your booking</h2>
                    </div>
                    {!activeBooking ? (
                        <div className="p-10 text-center">
                            <p className="text-sm text-[#6B6B78] mb-3">You don&#39;t have an active booking yet.</p>
                            <Link href="/student/hostels" className="text-sm font-medium text-[#1E3A5F] hover:underline">
                                Browse hostels →
                            </Link>
                        </div>
                    ) : (
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-[#1A1A1E]">{activeBooking.hostel_name}</h3>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${
                                        activeBooking.status === 'CONFIRMED'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-amber-50 text-[#C49A2A]'
                                    }`}
                                >
                                    {activeBooking.status}
                                </span>
                            </div>
                            <p className="text-xs text-[#6B6B78] mb-1">
                                {activeBooking.room_number ?? 'Room N/A'} · {activeBooking.space_number ?? 'Bed N/A'} · MK{' '}
                                {Number(activeBooking.monthly_price).toLocaleString()}/mo
                            </p>
                            <p className="text-xs text-[#6B6B78]">
                                {format(new Date(activeBooking.start_date), 'yyyy-MM-dd')} →{' '}
                                {activeBooking.end_date ? format(new Date(activeBooking.end_date), 'yyyy-MM-dd') : 'Open'}
                            </p>
                        </div>
                    )}
                    <Link href="/student/bookings" className="block text-center py-3.5 border-t border-[#E0D9CF] text-xs font-medium text-[#1E3A5F] hover:bg-[#F9F8F6] transition-colors">
                        View all bookings →
                    </Link>
                </div>

                {/* Quick actions */}
                <div className="bg-white border border-[#E0D9CF] rounded-sm p-4">
                    <h3 className="font-semibold text-sm text-[#1A1A1E] mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        {quickActions.map((a) => (
                            <Link
                                key={a.label}
                                href={a.href}
                                className="w-full flex items-center gap-2.5 rounded-sm border border-[#E0D9CF] px-3 py-2 text-sm text-[#1A1A1E] transition-colors hover:bg-[#F9F8F6]"
                            >
                                <FontAwesomeIcon icon={a.icon} className="h-3.5 w-3.5 text-[#C49A2A]" />
                                <span>{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E0D9CF]">
                    <h3 className="font-semibold text-sm text-[#1A1A1E]">Recent Activity</h3>
                </div>
                {recentActivity.length === 0 ? (
                    <p className="px-5 py-6 text-xs text-[#6B6B78]">No recent activity yet.</p>
                ) : (
                    <div className="divide-y divide-[#E0D9CF]">
                        {recentActivity.map((n) => (
                            <div key={n.id} className="px-5 py-3 flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#C49A2A]" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#1A1A1E]">{n.message}</p>
                                    <p className="text-[10px] text-[#6B6B78] mt-0.5">{format(new Date(n.created_at), 'MMM d, HH:mm')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}