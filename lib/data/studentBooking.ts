// lib/data/studentBookings.ts
import { sql } from '@/lib/db';

export interface StudentBookingRow {
    id: string;
    status: string;
    start_date: string;
    end_date: string | null;
    monthly_price: number;
    created_at: string;
    hostel_id: string;
    hostel_name: string;
    area: string | null;
    city: string | null;
    room_number: string | null;
    space_number: string | null;
}

export async function getStudentBookings(studentId: string): Promise<StudentBookingRow[]> {
    const rows = await sql`
        SELECT b.id, b.status, b.start_date, b.end_date, b.monthly_price, b.created_at,
               h.id AS hostel_id, h.name AS hostel_name, h.area, h.city,
               r.room_number, rs.space_number
        FROM bookings b
        JOIN room_spaces rs ON rs.id = b.space_id
        JOIN rooms r ON r.id = rs.room_id
        JOIN hostels h ON h.id = r.hostel_id
        WHERE b.student_id = ${studentId}
        ORDER BY b.created_at DESC
    `;
    return rows.map((r: any) => ({
        ...r,
        monthly_price: Number(r.monthly_price),
    })) as StudentBookingRow[];
}