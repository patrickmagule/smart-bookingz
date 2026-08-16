import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Home,
  Menu,
  CheckCircle2,
  Clock,
  Circle
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Good morning, {authUser?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-mist">Here's what's happening across your properties today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <span className="text-lg">🛏️</span>
            </div>
            <span className="text-2xl font-bold text-navy">13</span>
          </div>
          <div>
            <p className="text-xs font-bold text-navy">Total Beds</p>
            <p className="text-[10px] text-mist">Across {hostelCount} hostels</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">5</span>
          </div>
          <div>
            <p className="text-xs font-bold text-navy">Occupied</p>
            <p className="text-[10px] text-mist">38% occupancy</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Circle size={18} className="text-blue-600 fill-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">6</span>
          </div>
          <div>
            <p className="text-xs font-bold text-navy">Available</p>
            <p className="text-[10px] text-mist">Ready to book</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <span className="text-2xl font-bold text-gold">MK 78k</span>
          </div>
          <div>
            <p className="text-xs font-bold text-navy">Monthly Income</p>
            <p className="text-[10px] text-mist">Confirmed bookings</p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
          <h2 className="font-serif text-lg font-bold text-navy">Pending Booking Requests</h2>
          <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold">2 new</span>
        </div>

        <div className="divide-y divide-slate-50">
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-white">KM</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy">Kondwani Mbewe</h3>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-bold text-white">Accept</button>
                    <button className="rounded-md border border-red-200 bg-white px-3 py-1 text-[10px] font-bold text-red-500">Decline</button>
                  </div>
                </div>
                <p className="text-[10px] text-mist mt-0.5">Room 201 • Bed C • MK 14,000/mo</p>
                <p className="text-[10px] text-mist">2025-08-01 → 2026-01-31 (6 months)</p>
                
                <div className="mt-3 rounded-lg bg-gold/5 border border-gold/10 p-3 italic text-[10px] text-gold-dark">
                  "Student wants to move in early. Requested a meeting to view the room first."
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-navy flex items-center justify-center text-xs font-bold text-white">DM</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-navy">Dalitso Mvula</h3>
                  <div className="flex gap-2">
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

        <Link href="/hostelOwner/bookings" className="block text-center py-4 border-t border-slate-50 text-xs font-bold text-navy hover:bg-slate-50 transition-colors">
          View all bookings →
        </Link>
      </div>
    </div>
  );
}