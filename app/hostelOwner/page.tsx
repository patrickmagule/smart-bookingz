import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faCircleCheck, faCircleDot, faPlus, faMessage, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { getBedStats, getHostelCount, getOccupancyByHostel, getPendingBookings, getRecentActivity } from '@/lib/data/onwerDashboard';
import { BookingRequestActions } from '@/components/owner/bookRequest';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function HostelOwnerPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  if (!userId) {
    return <div>User not found</div>;
  }

  const [hostelCount, bedStats, pendingBookings, occupancy, recentActivity] = await Promise.all([
    getHostelCount(userId),
    getBedStats(userId),
    getPendingBookings(userId),
    getOccupancyByHostel(userId),
    getRecentActivity(userId),
  ]);

  const stats = [
    {
      label: 'Total beds',
      value: (bedStats.total_beds || 0).toString(),
      sub: `Across ${hostelCount} hostels`,
      icon: faBed,
      href: '/hostelOwner/rooms'
    },
    {
      label: 'Occupied',
      value: (bedStats.occupied_beds || 0).toString(),
      sub: `${bedStats.total_beds > 0 ? Math.round(((bedStats.occupied_beds || 0) / bedStats.total_beds) * 100) : 0}% occupancy`,
      icon: faCircleCheck,
      href: '/hostelOwner/rooms'
    },
    {
      label: 'Available',
      value: (bedStats.available_beds || 0).toString(),
      sub: 'Ready to book',
      icon: faCircleDot,
      href: '/hostelOwner/rooms'
    },
  ];

  const quickActions = [
    { label: 'Add New Hostel Listing', href: '/hostelOwner/hostels/new', icon: faPlus },
    { label: 'Manage Rooms & Beds', href: '/hostelOwner/rooms', icon: faBed },
    { label: 'Messages', href: '/hostelOwner/messages', icon: faMessage },

  ];

  return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="font-serif text-2xl text-[#1A1A1E]">Good morning, {authUser?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-[#6B6B78] mt-0.5">Here&#39;s what&#39;s happening across your properties today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="bg-white border border-[#E0D9CF] rounded-sm p-4 hover:bg-[#F9F8F6] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <FontAwesomeIcon icon={stat.icon} className="h-4 w-4 text-[#6B6B78]" />
                  <span className="text-2xl font-bold text-[#1E3A5F]">{stat.value}</span>
                </div>
                <p className="text-xs font-medium text-[#1A1A1E]">{stat.label}</p>
                <p className="text-[10px] text-[#6B6B78] mt-0.5">{stat.sub}</p>
              </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Pending Requests */}
          <div className="lg:col-span-2 bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E0D9CF] px-5 py-3.5">
              <h2 className="font-serif text-lg text-[#1A1A1E]">Pending booking requests</h2>
              {pendingBookings.length > 0 && (
                  <span className="rounded-sm bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-[#C49A2A]">
                  {pendingBookings.length} new
                </span>
              )}
            </div>

            <div className="divide-y divide-[#E0D9CF]">
              {pendingBookings.length === 0 ? (
                  <div className="p-10 text-center text-sm text-[#6B6B78]">
                    No pending booking requests.
                  </div>
              ) : (
                  pendingBookings.map((booking) => (
                      <div key={booking.id} className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {booking.first_name[0]}{booking.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-sm font-semibold text-[#1A1A1E]">{booking.first_name} {booking.last_name}</h3>
                              <BookingRequestActions bookingId={booking.id} />
                            </div>
                            <p className="text-xs text-[#6B6B78] mt-0.5">
                              {booking.hostel_name} · {booking.room_number ?? 'Room N/A'} · {booking.space_number ?? 'Bed N/A'} · MK {Number(booking.monthly_price).toLocaleString()}/mo
                            </p>
                            <p className="text-xs text-[#6B6B78]">
                              {format(new Date(booking.start_date), 'yyyy-MM-dd')} → {booking.end_date ? format(new Date(booking.end_date), 'yyyy-MM-dd') : 'Open'}
                            </p>
                            {booking.student_message && (
                                <div className="mt-2 rounded-sm bg-amber-50 border border-amber-200 p-3 italic text-xs text-amber-700">
                                  &#34;{booking.student_message}&#34;
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                  ))
              )}
            </div>

            <Link href="/hostelOwner/bookings" className="block text-center py-3.5 border-t border-[#E0D9CF] text-xs font-medium text-[#1E3A5F] hover:bg-[#F9F8F6] transition-colors">
              View all bookings →
            </Link>
          </div>

          {/* Right column */}
          <div className="space-y-4">
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

            <div className="bg-white border border-[#E0D9CF] rounded-sm p-4">
              <h3 className="font-semibold text-sm text-[#1A1A1E] mb-3">Occupancy</h3>
              {occupancy.length === 0 ? (
                  <p className="text-xs text-[#6B6B78]">Add a hostel to see occupancy here.</p>
              ) : (
                  occupancy.map((h) => {
                    const pct = h.total > 0 ? Math.round((h.occupied / h.total) * 100) : 0;
                    return (
                        <Link key={h.id} href="/hostelOwner/rooms" className="block mb-3 last:mb-0 group">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#1A1A1E] font-medium group-hover:text-[#1E3A5F]">{h.name}</span>
                            <span className="text-[#6B6B78]">{h.occupied}/{h.total} beds</span>
                          </div>
                          <div className="h-2 bg-[#EEE9E0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1E3A5F] rounded-full transition-all group-hover:bg-[#C49A2A]" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-[#6B6B78] mt-0.5">{pct}% occupied</p>
                        </Link>
                    );
                  })
              )}
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