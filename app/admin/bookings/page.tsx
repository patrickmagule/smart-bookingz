import { sql } from '@/lib/db';

function statusStyle(status: string) {
    switch (status) {
        case 'CONFIRMED':
        case 'COMPLETED':
            return 'border-green-300 text-green-700';
        case 'PENDING':
            return 'border-amber-300 text-amber-600';
        case 'REJECTED':
        case 'CANCELLED':
        case 'EXPIRED':
            return 'border-red-300 text-red-600';
        default:
            return 'border-slate-300 text-slate-500';
    }
}

export default async function AdminBookingsPage() {
    const bookings = await sql`
        SELECT
            b.id, b.status, b.start_date, b.end_date, b.created_at,
            su.first_name AS student_first, su.last_name AS student_last,
            h.name AS hostel_name, r.room_number
        FROM bookings b
        JOIN room_spaces rs ON b.space_id = rs.id
        JOIN rooms r ON rs.room_id = r.id
        JOIN hostels h ON r.hostel_id = h.id
        JOIN users su ON su.id = b.student_id
        ORDER BY b.created_at DESC
        LIMIT 200
    `;

    return (
        <div className="p-4 lg:p-6 space-y-4 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">Bookings</h1>
                <p className="text-sm text-slate-500 mt-0.5">{bookings.length} most recent, across all hostels.</p>
            </div>

            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {bookings.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No bookings yet.</p>
                ) : (
                    bookings.map((b: any) => (
                        <div key={b.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-navy">
                                    {b.student_first} {b.student_last}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {b.hostel_name}{b.room_number ? ` · Room ${b.room_number}` : ''}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {new Date(b.start_date).toLocaleDateString()}
                                    {b.end_date ? ` → ${new Date(b.end_date).toLocaleDateString()}` : ' → open-ended'}
                                </p>
                            </div>
                            <span className={`self-start rounded-full border px-2 py-0.5 text-[10px] font-medium sm:self-auto ${statusStyle(b.status)}`}>
                                {b.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
