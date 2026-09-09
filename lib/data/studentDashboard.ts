// lib/data/studentDashboard.ts
import { sql } from '@/lib/db';

export interface StudentBookingStats {
    pending: number;
    confirmed: number;
    completed: number;
}

export interface ActiveBookingRow {
    id: string;
    hostel_name: string;
    room_number: string | null;
    space_number: string | null;
    status: string;
    start_date: string;
    end_date: string | null;
    monthly_price: string;
}

export interface ActivityRow {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface HostelListRow {
    id: string;
    name: string;
    image_url: string | null;
    avg_rating: number | null;
    area: string | null;
    distance_from_campus_km: number | null;
    amenities: string[];
    min_price: number | null;
}

export async function getStudentBookingStats(studentId: string): Promise<StudentBookingStats> {
    const [row] = await sql`
        SELECT
            COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
            COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS confirmed,
            COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed
        FROM bookings
        WHERE student_id = ${studentId}
    `;
    return row as unknown as StudentBookingStats;
}

export async function getActiveBooking(studentId: string): Promise<ActiveBookingRow | null> {
    const [row] = await sql`
        SELECT
            b.id, b.status, b.start_date, b.end_date, b.monthly_price,
            h.name AS hostel_name, r.room_number, rs.space_number
        FROM bookings b
                 JOIN room_spaces rs ON b.space_id = rs.id
                 JOIN rooms r ON rs.room_id = r.id
                 JOIN hostels h ON r.hostel_id = h.id
        WHERE b.student_id = ${studentId}
          AND b.status IN ('PENDING', 'CONFIRMED')
        ORDER BY b.created_at DESC
            LIMIT 1
    `;
    return (row as unknown as ActiveBookingRow) ?? null;
}

export async function getUnreadMessageCount(studentId: string): Promise<number> {
    const [row] = await sql`
        SELECT COUNT(*)::int AS count
        FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
        WHERE c.student_id = ${studentId}
          AND m.sender_id != ${studentId}
          AND m.is_read = FALSE
    `;
    return row.count as number;
}

export async function getUnreadNotificationsCount(studentId: string): Promise<number> {
    const [row] = await sql`
        SELECT COUNT(*)::int AS count
        FROM notifications
        WHERE user_id = ${studentId}
          AND is_read = FALSE
    `;
    return row.count as number;
}

export async function getStudentRecentActivity(studentId: string, limit = 5): Promise<ActivityRow[]> {
    const rows = await sql`
        SELECT id, message, is_read, created_at
        FROM notifications
        WHERE user_id = ${studentId}
        ORDER BY created_at DESC
            LIMIT ${limit}
    `;
    return rows as unknown as ActivityRow[];
}

export async function getPublishedHostels(): Promise<HostelListRow[]> {
    const rows = await sql`
        SELECT
            h.id,
            h.name,
            (SELECT image_url FROM hostel_images WHERE hostel_id = h.id AND is_primary = TRUE LIMIT 1) as image_url,
            (SELECT AVG(rating)::float FROM reviews WHERE hostel_id = h.id) as avg_rating,
            h.area, 
            h.distance_from_campus_km,
            (
                SELECT COALESCE(array_agg(a.name), '{}')
                FROM hostel_amenities ha
                JOIN amenities a ON ha.amenity_id = a.id
                WHERE ha.hostel_id = h.id
            ) as amenities,
            (SELECT MIN(price_per_month)::float FROM rooms WHERE hostel_id = h.id AND status = 'ACTIVE') as min_price
        FROM hostels h
        WHERE h.status = 'PUBLISHED'
        ORDER BY h.created_at DESC
    `;
    return rows as unknown as HostelListRow[];
}