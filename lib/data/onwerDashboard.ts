import { sql } from '@/lib/db';

interface BedStatsRow {
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
}

interface PendingBookingRow {
    id: string;
    start_date: string;
    end_date: string | null;
    monthly_price: string;
    student_message: string | null;
    first_name: string;
    last_name: string;
    room_number: string | null;
    space_number: string | null;
    hostel_name: string;
}

interface OccupancyRow {
    id: string;
    name: string;
    total: number;
    occupied: number;
}

interface ActivityRow {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export async function getBedStats(ownerId: string): Promise<BedStatsRow> {
    const [row] = await sql`
        WITH owner_spaces AS (
            SELECT rs.id, rs.status
            FROM room_spaces rs
                     JOIN rooms r ON r.id = rs.room_id
                     JOIN hostels h ON h.id = r.hostel_id
            WHERE h.owner_id = ${ownerId}
        ),
             current_bookings AS (
                 SELECT DISTINCT space_id
                 FROM bookings
                 WHERE status = 'CONFIRMED'
                   AND start_date <= CURRENT_DATE
                   AND (end_date IS NULL OR end_date >= CURRENT_DATE)
             )
        SELECT
            COUNT(*)::int AS total_beds,
            COUNT(*) FILTER (WHERE cb.space_id IS NOT NULL)::int AS occupied_beds,
            COUNT(*) FILTER (WHERE cb.space_id IS NULL AND os.status = 'ACTIVE')::int AS available_beds
        FROM owner_spaces os
                 LEFT JOIN current_bookings cb ON cb.space_id = os.id
    `;
    return row as unknown as BedStatsRow;
}

export async function getHostelCount(ownerId: string): Promise<number> {
    const [row] = await sql`
        SELECT COUNT(*) AS count FROM hostels WHERE owner_id = ${ownerId}
    `;
    return Number(row.count);
}

export async function getPendingBookings(
    ownerId: string,
    limit = 5
): Promise<PendingBookingRow[]> {
    const rows = await sql`
    SELECT
      b.id,
      b.start_date,
      b.end_date,
      b.monthly_price,
      b.student_message,
      u.first_name,
      u.last_name,
      r.room_number,
      rs.space_number,
      h.name AS hostel_name
    FROM bookings b
    JOIN room_spaces rs ON b.space_id = rs.id
    JOIN rooms r ON rs.room_id = r.id
    JOIN hostels h ON r.hostel_id = h.id
    JOIN users u ON b.student_id = u.id
    WHERE h.owner_id = ${ownerId} AND b.status = 'PENDING'
    ORDER BY b.created_at DESC
    LIMIT ${limit}
  `;
    return rows as unknown as PendingBookingRow[];
}

export async function getOccupancyByHostel(ownerId: string): Promise<OccupancyRow[]> {
    const rows = await sql`
    WITH current_bookings AS (
      SELECT DISTINCT space_id
      FROM bookings
      WHERE status = 'CONFIRMED'
        AND start_date <= CURRENT_DATE
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    )
    SELECT
      h.id,
      h.name,
      COUNT(rs.id)::int AS total,
      COUNT(*) FILTER (WHERE cb.space_id IS NOT NULL)::int AS occupied
    FROM hostels h
    LEFT JOIN rooms r ON r.hostel_id = h.id
    LEFT JOIN room_spaces rs ON rs.room_id = r.id
    LEFT JOIN current_bookings cb ON cb.space_id = rs.id
    WHERE h.owner_id = ${ownerId}
    GROUP BY h.id, h.name
    ORDER BY h.name
  `;
    return rows as unknown as OccupancyRow[];
}

export async function getRecentActivity(
    ownerId: string,
    limit = 5
): Promise<ActivityRow[]> {
    const rows = await sql`
    SELECT id, message, is_read, created_at
    FROM notifications
    WHERE user_id = ${ownerId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
    return rows as unknown as ActivityRow[];
}