import { sql } from '@/lib/db';

// ---------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------

export interface HostelDetailOwner {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
}

export interface HostelDetail {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    area: string | null;
    city: string | null;
    contact_phone: string | null;
    deposit_amount: number | null;
    other_fees: string | null;
    gender_preference: string | null;
    distance_from_campus_km: number | null;
    latitude: number | null;
    longitude: number | null;
    status: string;
    owner: HostelDetailOwner;
}

export interface HostelImage {
    id: string;
    image_url: string;
    caption: string | null;
    is_primary: boolean;
}

export interface HostelAmenity {
    id: string;
    name: string;
}

export interface RoomSpaceRow {
    space_id: string;
    space_number: string | null;
    is_occupied: boolean;
}

export interface RoomWithSpaces {
    room_id: string;
    room_number: string | null;
    room_type: string | null;
    description: string | null;
    price_per_month: number;
    spaces: RoomSpaceRow[];
}

// ---------------------------------------------------------------------
// Row shapes returned directly from `sql` (raw db rows, pre-normalization).
// Numeric/decimal/bigint columns commonly come back as strings from
// postgres.js, hence the `number | string` unions — same pattern as
// ownerHostelList.ts / publicHostelList.ts.
// ---------------------------------------------------------------------

type HostelDetailRow = {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    area: string | null;
    city: string | null;
    contact_phone: string | null;
    deposit_amount: number | string | null;
    other_fees: string | null;
    gender_preference: string | null;
    distance_from_campus_km: number | string | null;
    latitude: number | string | null;
    longitude: number | string | null;
    status: string;
    owner_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
};

export async function getHostelDetail(hostelId: string): Promise<HostelDetail | null> {
    const [row] = (await sql`
        SELECT h.id, h.name, h.description, h.address, h.area, h.city,
               h.contact_phone, h.deposit_amount, h.other_fees,
               h.gender_preference, h.distance_from_campus_km, h.status,
               ST_Y(h.location::geometry) AS latitude,
               ST_X(h.location::geometry) AS longitude,
               u.id AS owner_id, u.first_name, u.last_name, u.email, u.phone
        FROM hostels h
                 JOIN users u ON u.id = h.owner_id
        WHERE h.id = ${hostelId} AND h.status = 'PUBLISHED'
            LIMIT 1
    `) as HostelDetailRow[];

    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        description: row.description,
        address: row.address,
        area: row.area,
        city: row.city,
        contact_phone: row.contact_phone,
        deposit_amount: row.deposit_amount != null ? Number(row.deposit_amount) : null,
        other_fees: row.other_fees,
        gender_preference: row.gender_preference,
        distance_from_campus_km:
            row.distance_from_campus_km != null ? Number(row.distance_from_campus_km) : null,
        latitude: row.latitude != null ? Number(row.latitude) : null,
        longitude: row.longitude != null ? Number(row.longitude) : null,
        status: row.status,
        owner: {
            id: row.owner_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
        },
    };
}

type HostelImageRow = { id: string; image_url: string; caption: string | null; is_primary: boolean };

export async function getHostelImages(hostelId: string): Promise<HostelImage[]> {
    return (await sql`
        SELECT id, image_url, caption, is_primary
        FROM hostel_images
        WHERE hostel_id = ${hostelId}
        ORDER BY is_primary DESC, display_order ASC
    `) as HostelImageRow[];
}

type AmenityRow = { id: string; name: string };

export async function getHostelAmenities(hostelId: string): Promise<HostelAmenity[]> {
    return (await sql`
        SELECT a.id, a.name
        FROM hostel_amenities ha
                 JOIN amenities a ON a.id = ha.amenity_id
        WHERE ha.hostel_id = ${hostelId}
        ORDER BY a.name
    `) as AmenityRow[];
}

// Raw row: one row per room, with its beds pre-aggregated into a JSON array
// via json_agg — same pattern as getOwnerRooms in ownerHostelList.ts, so one
// query returns everything instead of a room query plus N space queries.
type RoomWithSpacesRow = {
    room_id: string;
    room_number: string | null;
    room_type: string | null;
    description: string | null;
    price_per_month: number | string;
    spaces: RoomSpaceRow[] | string;
};

export async function getHostelRoomsWithSpaces(hostelId: string): Promise<RoomWithSpaces[]> {
    const rows = (await sql`
        SELECT
            r.id AS room_id, r.room_number, r.room_type, r.description, r.price_per_month,
            COALESCE(
                    (
                        SELECT json_agg(
                                       json_build_object(
                                               'space_id', rs.id,
                                               'space_number', rs.space_number,
                                               'is_occupied', EXISTS (
                                           SELECT 1 FROM bookings b
                                           WHERE b.space_id = rs.id
                                             AND b.status IN ('PENDING', 'CONFIRMED')
                                             AND (b.end_date IS NULL OR b.end_date > CURRENT_DATE)
                                       )
                                       ) ORDER BY rs.space_number
                               )
                        FROM room_spaces rs
                        WHERE rs.room_id = r.id AND rs.status = 'ACTIVE'
                    ), '[]'::json
            ) AS spaces
        FROM rooms r
        WHERE r.hostel_id = ${hostelId} AND r.status = 'ACTIVE'
        ORDER BY r.room_number
    `) as RoomWithSpacesRow[];

    return rows
        .map((r) => ({
            room_id: r.room_id,
            room_number: r.room_number,
            room_type: r.room_type,
            description: r.description,
            price_per_month: Number(r.price_per_month),
            spaces: typeof r.spaces === 'string' ? (JSON.parse(r.spaces) as RoomSpaceRow[]) : r.spaces,
        }))
        // A room with zero ACTIVE spaces comes back as spaces: [] — drop it
        // so students aren't shown a room with nothing bookable in it.
        .filter((r) => r.spaces.length > 0);
}