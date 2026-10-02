import { sql } from '@/lib/db';

/**
 * ASSUMPTIONS (adjust if your schema differs):
 * - `reviews` table has columns: hostel_id, rating
 * - `bookings` table has columns: space_id, status ('CONFIRMED' means occupied)
 * - `hostels` has a `created_at` timestamp column (you already use `updated_at`
 *   elsewhere, so this is likely already there)
 */

export type PublicHostelCard = {
    id: string;
    name: string;
    address: string;
    area: string;
    gender_preference: string | null;
    cover_image: string | null;
    facilities: string[];
    lowest_price: number | null;
    available_beds: number;
    rating: number;
    review_count: number;
};

export async function getFeaturedHostels(limit = 3): Promise<PublicHostelCard[]> {
    const rows = await sql`
    SELECT
      h.id,
      h.name,
      h.address,
      h.area,
      h.gender_preference,
      (
        SELECT image_url FROM hostel_images
        WHERE hostel_id = h.id
        ORDER BY is_primary DESC, display_order ASC
        LIMIT 1
      ) as cover_image,
      COALESCE(
        (
          SELECT array_agg(a.name)
          FROM hostel_amenities ha
          JOIN amenities a ON a.id = ha.amenity_id
          WHERE ha.hostel_id = h.id
        ),
        '{}'
      ) as facilities,
      (SELECT MIN(r.price_per_month) FROM rooms r WHERE r.hostel_id = h.id) as lowest_price,
      COALESCE((
        SELECT COUNT(*)::int FROM room_spaces rs
        JOIN rooms r ON r.id = rs.room_id
        WHERE r.hostel_id = h.id
          AND rs.status = 'ACTIVE'
          AND rs.id NOT IN (
            SELECT space_id FROM bookings WHERE status = 'CONFIRMED'
          )
      ), 0) as available_beds,
      COALESCE((SELECT AVG(rating) FROM reviews WHERE hostel_id = h.id), 0)::float as rating,
      COALESCE((SELECT COUNT(*)::int FROM reviews WHERE hostel_id = h.id), 0) as review_count
    FROM hostels h
    WHERE h.status = 'PUBLISHED'
    ORDER BY rating DESC, review_count DESC, h.created_at DESC
    LIMIT ${limit}
  `;

    return rows.map((r: any) => ({
        ...r,
        lowest_price: r.lowest_price !== null ? Number(r.lowest_price) : null,
        available_beds: Number(r.available_beds),
        rating: Number(r.rating),
        review_count: Number(r.review_count),
        facilities: r.facilities ?? [],
    })) as PublicHostelCard[];
}

export type PlatformStats = {
    hostelCount: number;
    studentCount: number;
    avgRating: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
    const [row] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM hostels WHERE status = 'PUBLISHED') as hostel_count,
      (SELECT COUNT(*)::int FROM users WHERE role = 'STUDENT') as student_count,
      COALESCE((SELECT AVG(rating) FROM reviews), 0)::float as avg_rating
  `;

    return {
        hostelCount: Number(row?.hostel_count ?? 0),
        studentCount: Number(row?.student_count ?? 0),
        avgRating: Number(row?.avg_rating ?? 0),
    };
}