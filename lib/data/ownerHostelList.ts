import { sql } from '@/lib/db';

export type OwnerHostelSummary = {
    id: string;
    name: string;
    address: string | null;
    area: string | null;
    status: string;
    distance_from_campus_km: number | null;
    gender_preference: string | null;
    facilities: string[];
    images: string[];
    rooms_count: number;
    total_beds: number;
    available_beds: number;
    rating: number | null;
    review_count: number;
};

// ---------------------------------------------------------------------
// Row shapes returned directly from `sql` (raw db rows, pre-normalization).
// Numeric/decimal/bigint columns commonly come back as strings from
// postgres.js, hence the `number | string` unions below.
// ---------------------------------------------------------------------

type HostelListRow = {
    id: string;
    name: string;
    address: string | null;
    area: string | null;
    status: string;
    distance_from_campus_km: number | string | null;
    gender_preference: string | null;
};

type FacilityRow = { hostel_id: string; name: string };
type ImageRow = { hostel_id: string; image_url: string };
type RoomStatRow = {
    hostel_id: string;
    rooms_count: number | string;
    total_beds: number | string;
    available_beds: number | string;
};
type ReviewAggRow = {
    hostel_id: string;
    rating: number | string | null;
    review_count: number | string;
};

/**
 * Everything the "My Hostels" page needs, in four queries instead of
 * N+1 per hostel. If your `sql` client doesn't support `= ANY(${array})`
 * the way postgres.js does, swap those four queries for a per-hostel loop.
 */
export async function getOwnerHostels(ownerId: string): Promise<OwnerHostelSummary[]> {
    const hostels = (await sql`
        SELECT id, name, address, area, status, distance_from_campus_km, gender_preference
        FROM hostels
        WHERE owner_id = ${ownerId}
        ORDER BY created_at DESC
    `) as HostelListRow[];

    if (hostels.length === 0) return [];

    const hostelIds = hostels.map((h) => h.id);

    const [facilityRows, imageRows, roomStatRows, reviewRows] = (await Promise.all([
        sql`
            SELECT ha.hostel_id, a.name
            FROM hostel_amenities ha
                     JOIN amenities a ON a.id = ha.amenity_id
            WHERE ha.hostel_id = ANY(${hostelIds}::uuid[])
        `,
        sql`
            SELECT hostel_id, image_url
            FROM hostel_images
            WHERE hostel_id = ANY(${hostelIds}::uuid[])
            ORDER BY is_primary DESC, display_order ASC
        `,
        sql`
            SELECT
                r.hostel_id,
                COUNT(DISTINCT r.id) AS rooms_count,
                COUNT(rs.id) AS total_beds,
                COUNT(rs.id) FILTER (
                WHERE rs.status = 'ACTIVE'
                    AND NOT EXISTS (
                        SELECT 1 FROM bookings b WHERE b.space_id = rs.id AND b.status = 'CONFIRMED'
                    )
            ) AS available_beds
            FROM rooms r
                     LEFT JOIN room_spaces rs ON rs.room_id = r.id
            WHERE r.hostel_id = ANY(${hostelIds}::uuid[])
            GROUP BY r.hostel_id
        `,
        sql`
            SELECT hostel_id, AVG(rating)::numeric(3,2) AS rating, COUNT(*) AS review_count
            FROM reviews
            WHERE hostel_id = ANY(${hostelIds}::uuid[])
            GROUP BY hostel_id
        `,
    ])) as [FacilityRow[], ImageRow[], RoomStatRow[], ReviewAggRow[]];

    return hostels.map((h) => {
        const facilities = facilityRows.filter((f) => f.hostel_id === h.id).map((f) => f.name);
        const images = imageRows.filter((i) => i.hostel_id === h.id).map((i) => i.image_url);
        const stats = roomStatRows.find((s) => s.hostel_id === h.id);
        const review = reviewRows.find((r) => r.hostel_id === h.id);

        return {
            id: h.id,
            name: h.name,
            address: h.address,
            area: h.area,
            status: h.status,
            distance_from_campus_km:
                h.distance_from_campus_km !== null ? Number(h.distance_from_campus_km) : null,
            gender_preference: h.gender_preference,
            facilities,
            images,
            rooms_count: Number(stats?.rooms_count ?? 0),
            total_beds: Number(stats?.total_beds ?? 0),
            available_beds: Number(stats?.available_beds ?? 0),
            rating: review?.rating != null ? Number(review.rating) : null,
            review_count: Number(review?.review_count ?? 0),
        };
    });
}

export type HostelForEdit = {
    hostel: {
        id: string;
        name: string | null;
        address: string | null;
        area: string | null;
        distance_from_campus_km: number | string | null;
        gender_preference: 'mixed' | 'male' | 'female' | null;
        description: string | null;
        contact_phone: string | null;
        status: string;
    };
    facilities: string[];
    images: { id: string; image_url: string; is_primary: boolean }[];
};

type HostelEditRow = {
    id: string;
    name: string | null;
    address: string | null;
    area: string | null;
    distance_from_campus_km: number | string | null;
    gender_preference: string | null;
    description: string | null;
    contact_phone: string | null;
    status: string;
};

type FacilityNameRow = { name: string };
type HostelImageRow = { id: string; image_url: string; is_primary: boolean };

export async function getHostelForEdit(
    hostelId: string,
    ownerId: string
): Promise<HostelForEdit | null> {
    const [hostel] = (await sql`
        SELECT
            id,
            name,
            address,
            area,
            distance_from_campus_km,
            gender_preference,
            description,
            contact_phone,
            status
        FROM hostels
        WHERE id = ${hostelId}
          AND owner_id = ${ownerId}
    `) as HostelEditRow[];

    if (!hostel) return null;

    const [facilityRows, imageRows] = (await Promise.all([
        sql`
            SELECT a.name
            FROM hostel_amenities ha
                     JOIN amenities a ON a.id = ha.amenity_id
            WHERE ha.hostel_id = ${hostelId}
        `,
        sql`
            SELECT id, image_url, is_primary
            FROM hostel_images
            WHERE hostel_id = ${hostelId}
            ORDER BY is_primary DESC, display_order ASC
        `,
    ])) as [FacilityNameRow[], HostelImageRow[]];

    return {
        hostel: {
            id: String(hostel.id),
            name: hostel.name != null ? String(hostel.name) : null,
            address: hostel.address != null ? String(hostel.address) : null,
            area: hostel.area != null ? String(hostel.area) : null,
            distance_from_campus_km:
                hostel.distance_from_campus_km != null
                    ? Number(hostel.distance_from_campus_km)
                    : null,
            gender_preference:
                hostel.gender_preference === 'male' ||
                hostel.gender_preference === 'female' ||
                hostel.gender_preference === 'mixed'
                    ? hostel.gender_preference
                    : null,
            description:
                hostel.description != null
                    ? String(hostel.description)
                    : null,
            contact_phone:
                hostel.contact_phone != null
                    ? String(hostel.contact_phone)
                    : null,
            status: String(hostel.status),
        },

        facilities: facilityRows.map((f) => String(f.name)),

        images: imageRows.map((i) => ({
            id: String(i.id),
            image_url: String(i.image_url),
            is_primary: Boolean(i.is_primary),
        })),
    };
}

// ---------------------------------------------------------------------
// Rooms & Beds page
// ---------------------------------------------------------------------

export type OwnerRoomBed = {
    id: string;
    label: string;
    status: string;
    occupied: boolean;
};

export type OwnerRoom = {
    id: string;
    hostel_id: string;
    name: string;
    type: string | null;
    price: number;
    status: string;
    thumbnail: string | null;
    beds: OwnerRoomBed[];
};

type HostelTabRow = { id: string; name: string };

type OwnerRoomRow = {
    id: string;
    hostel_id: string;
    name: string;
    type: string | null;
    price: number | string;
    status: string;
    thumbnail: string | null;
    beds: OwnerRoomBed[] | string;
};

export async function getOwnerHostelTabs(ownerId: string): Promise<HostelTabRow[]> {
    const rows = (await sql`
        SELECT id, name FROM hostels WHERE owner_id = ${ownerId} ORDER BY created_at ASC
    `) as HostelTabRow[];
    return rows;
}

export async function getOwnerRooms(ownerId: string): Promise<OwnerRoom[]> {
    const rows = (await sql`
        SELECT
            r.id, r.hostel_id, r.room_number AS name, r.room_type AS type,
            r.price_per_month AS price, r.status,
            (
                SELECT image_url FROM room_images
                WHERE room_id = r.id
                ORDER BY is_primary DESC, display_order ASC
                LIMIT 1
            ) AS thumbnail,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', rs.id,
                            'label', rs.space_number,
                            'status', rs.status,
                            'occupied', EXISTS (
                                SELECT 1 FROM bookings b
                                WHERE b.space_id = rs.id AND b.status = 'CONFIRMED'
                            )
                        ) ORDER BY rs.space_number
                    )
                    FROM room_spaces rs
                    WHERE rs.room_id = r.id
                ), '[]'::json
            ) AS beds
        FROM rooms r
        JOIN hostels h ON h.id = r.hostel_id
        WHERE h.owner_id = ${ownerId}
        ORDER BY r.room_number ASC
    `) as OwnerRoomRow[];

    return rows.map((r) => ({
        id: r.id,
        hostel_id: r.hostel_id,
        name: r.name,
        type: r.type,
        price: Number(r.price),
        status: r.status,
        thumbnail: r.thumbnail,
        beds: typeof r.beds === 'string' ? (JSON.parse(r.beds) as OwnerRoomBed[]) : r.beds,
    }));
}