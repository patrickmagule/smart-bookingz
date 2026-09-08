import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { 
  CalendarCheck, 
  User, 
  Building2, 
  MapPin, 
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  const bookings = await sql`
    SELECT 
      b.id, b.status, b.start_date, b.created_at, b.student_message,
      u.first_name, u.last_name, u.email,
      h.name as hostel_name,
      r.room_number,
      rs.space_number
    FROM bookings b
    JOIN users u ON b.student_id = u.id
    JOIN room_spaces rs ON b.space_id = rs.id
    JOIN rooms r ON rs.room_id = r.id
    JOIN hostels h ON r.hostel_id = h.id
    WHERE h.owner_id = ${userId}
    ORDER BY b.created_at DESC
  `;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Booking Requests</h1>
        <p className="text-mist">Manage and review booking requests from students.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 text-center border border-slate-100">
          <div className="rounded-full bg-slate-50 p-4 text-slate-300">
            <CalendarCheck size={48} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-navy">No bookings yet</h3>
          <p className="mt-2 text-mist max-w-sm">
            When students book a space in one of your hostels, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Hostel / Room</th>
                  <th className="px-6 py-4">Date Requested</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-navy/5 flex items-center justify-center text-navy">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">{booking.first_name} {booking.last_name}</p>
                          <p className="text-xs text-mist">{booking.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-navy font-medium">
                        <Building2 size={14} className="text-slate-400" />
                        {booking.hostel_name}
                      </div>
                      <p className="text-xs text-mist ml-5">Room {booking.room_number}, Space {booking.space_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                        booking.status === 'CONFIRMED' ? "bg-green-50 text-green-700 border-green-200" :
                        booking.status === 'PENDING' ? "bg-gold/10 text-gold border-gold/20" :
                        booking.status === 'REJECTED' ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                            <XCircle size={20} />
                          </button>
                          <button className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors" title="Confirm">
                            <CheckCircle2 size={20} />
                          </button>
                        </div>
                      ) : (
                        <Link 
                          href={`/hostelOwner/bookings/${booking.id}`}
                          className="text-xs font-bold text-navy hover:text-gold transition-colors"
                        >
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
