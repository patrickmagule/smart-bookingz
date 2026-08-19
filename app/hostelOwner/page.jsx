import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
  BedDouble,
  CheckCircle2,
  CircleDot,
  Wallet,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default async function HostelOwnerPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  // Fetch some summary stats
  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  const [{ count: hostelCount }] = await sql`SELECT COUNT(*) FROM hostels WHERE owner_id = ${userId}`;
  const [{ count: bookingCount }] = await sql`
    SELECT COUNT(*) FROM bookings b
                           JOIN room_spaces rs ON b.space_id = rs.id
                           JOIN rooms r ON rs.room_id = r.id
                           JOIN hostels h ON r.hostel_id = h.id
    WHERE h.owner_id = ${userId} AND b.status = 'PENDING'
  `;

  const stats = [
    {
      label: 'Total beds',
      value: '13',
      sub: `Across ${hostelCount} hostels`,
      icon: BedDouble,
    },
    {
      label: 'Occupied',
      value: '5',
      sub: '38% occupancy',
      icon: CheckCircle2,
    },
    {
      label: 'Available',
      value: '6',
      sub: 'Ready to book',
      icon: CircleDot,
    },
    {
      label: 'Monthly income',
      value: 'MK 78k',
      sub: 'Confirmed bookings',
      icon: Wallet,
      accent: true,
    },
  ];

  return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-navy">Good morning, {authUser?.name?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-mist">Here&#39;s what&#39;s happening across your properties today.</p>
          </div>
          <Link
              href="/hostelOwner/hostels/new"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-bold text-navy transition-all hover:bg-gold-dark active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Hostel
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2 p-5">
                <stat.icon
                    size={18}
                    className={stat.accent ? 'text-gold' : 'text-slate-400'}
                    strokeWidth={1.75}
                />
                <div>
                  <p className={`text-2xl font-semibold tracking-tight ${stat.accent ? 'text-gold' : 'text-navy'}`}>
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-navy">{stat.label}</p>
                  <p className="text-[11px] text-mist">{stat.sub}</p>
                </div>
              </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-serif text-lg font-bold text-navy">Pending booking requests</h2>
            <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold">2 new</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-white shrink-0">KM</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-navy">Kondwani Mbewe</h3>
                    <div className="flex gap-2 shrink-0">
                      <button className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-bold text-white">Accept</button>
                      <button className="rounded-md border border-red-200 bg-white px-3 py-1 text-[10px] font-bold text-red-500">Decline</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-mist mt-0.5">Room 201 • Bed C • MK 14,000/mo</p>
                  <p className="text-[10px] text-mist">2025-08-01 → 2026-01-31 (6 months)</p>

                  <div className="mt-3 rounded-lg bg-gold/5 border border-gold/10 p-3 italic text-[10px] text-gold-dark">
                    &#34;Student wants to move in early. Requested a meeting to view the room first.&#34;
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-white shrink-0">DM</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-navy">Dalitso Mvula</h3>
                    <div className="flex gap-2 shrink-0">
                      <button className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-bold text-white">Accept</button>
                      <button className="rounded-md border border-red-200 bg-white px-3 py-1 text-[10px] font-bold text-red-500">Decline</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-mist mt-0.5">Room 201 • Bed D • MK 14,000/mo</p>
                  <p className="text-[10px] text-mist">2025-08-15 → 2026-02-14 (6 months)</p>
                </div>
              </div>
            </div>
          </div>

          <Link href="/hostelOwner/bookings" className="block text-center py-4 border-t border-slate-100 text-xs font-bold text-navy hover:bg-slate-50 transition-colors">
            View all bookings →
          </Link>
        </div>
      </div>
  );
}