'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function requireOwnerId() {
    const { data } = await auth.getSession();
    if (!data?.user) throw new Error('Not authenticated');

    const [user] = await sql`
        SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1
    `;
    if (!user) throw new Error('User not found');
    return user.id as string;
}

async function assertOwnsHostel(ownerId: string, hostelId: string) {
    const [row] = await sql`SELECT id FROM hostels WHERE id = ${hostelId} AND owner_id = ${ownerId}`;
    if (!row) throw new Error('Hostel not found, or not owned by this account');
}

async function upsertAmenityIds(names: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const raw of names) {
        const name = raw.trim();
        if (!name) continue;

        const [existing] = await sql`SELECT id FROM amenities WHERE name = ${name} LIMIT 1`;
        if (existing) {
            ids.push(existing.id as string);
            continue;
        }

        const [created] = await sql`
            INSERT INTO amenities (name) VALUES (${name})
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        `;
        ids.push(created.id as string);
    }
    return ids;
}

type UpdateHostelInput = {
    hostelName: string;
    address: string;
    location: string;
    distance: string;
    gender: 'mixed' | 'male' | 'female';
    description: string;
    contactPhone: string;
    facilities: string[];
    keepImageIds: string[];        // existing hostel_images.id the owner kept
    newPhotos: { url: string }[];
    latitude: number | null;
    longitude: number | null;// freshly uploaded UploadThing urls
};
const MUBAS_LNG = 35.02838775495957;
const MUBAS_LAT = -15.801346118270276;

export async function updateHostelBasicInfo(hostelId: string, input: UpdateHostelInput) {
    const ownerId = await requireOwnerId();
    await assertOwnsHostel(ownerId, hostelId);

    if (!input.hostelName.trim()) throw new Error('Hostel name is required');
    if (!input.address.trim()) throw new Error('Address is required');
    if (!input.location.trim()) throw new Error('Area/neighbourhood is required');
    if (!input.contactPhone.trim()) throw new Error('Contact phone is required');
    if (!input.description.trim()) throw new Error('Description is required');

    // replaced

    const hasCoords = input.latitude != null && input.longitude != null;

    let distanceKm: number | null = null;
    if (hasCoords) {
        const [{ km }] = await sql`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${MUBAS_LNG}, ${MUBAS_LAT}), 4326)::geography
      ) / 1000.0 AS km
    `;
        distanceKm = Math.round(Number(km) * 10) / 10;
    } else if (input.distance.trim()) {
        distanceKm = Number(input.distance);
        if (Number.isNaN(distanceKm) || distanceKm < 0) {
            throw new Error('Distance from MUBAS must be a valid, non-negative number');
        }
    }

    const locationExpr = hasCoords
        ? sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography`
        : sql`NULL`;


    await sql`
        UPDATE hostels SET
                           name = ${input.hostelName},
                           address = ${input.address},
                           area = ${input.location},
                           contact_phone = ${input.contactPhone},
                           distance_from_campus_km = ${distanceKm},
                           location = ${hasCoords ? locationExpr : sql`location`},
                           gender_preference = ${input.gender},
                           description = ${input.description},
                           updated_at = now()
        WHERE id = ${hostelId}
    `;

    // Facilities: simplest correct approach is replace-all rather than diff.
    await sql`DELETE FROM hostel_amenities WHERE hostel_id = ${hostelId}`;
    if (input.facilities.length > 0) {
        const amenityIds = await upsertAmenityIds(input.facilities);
        for (const amenityId of amenityIds) {
            await sql`
                INSERT INTO hostel_amenities (hostel_id, amenity_id)
                VALUES (${hostelId}, ${amenityId})
                ON CONFLICT DO NOTHING
            `;
        }
    }

    // Photos: remove any existing image not in keepImageIds, then append new ones.
    if (input.keepImageIds.length > 0) {
        await sql`
            DELETE FROM hostel_images
            WHERE hostel_id = ${hostelId} AND id != ALL(${input.keepImageIds})
        `;
    } else {
        await sql`DELETE FROM hostel_images WHERE hostel_id = ${hostelId}`;
    }

    if (input.newPhotos.length > 0) {
        const [{ max_order }] = await sql`
            SELECT COALESCE(MAX(display_order), -1) AS max_order
            FROM hostel_images WHERE hostel_id = ${hostelId}
        `;
        for (let i = 0; i < input.newPhotos.length; i++) {
            await sql`
                INSERT INTO hostel_images (hostel_id, image_url, is_primary, display_order)
                VALUES (${hostelId}, ${input.newPhotos[i].url}, false, ${Number(max_order) + 1 + i})
            `;
        }
    }

    // Make sure exactly one image is marked primary if any exist.
    const [{ primary_count }] = await sql`
        SELECT COUNT(*) AS primary_count FROM hostel_images WHERE hostel_id = ${hostelId} AND is_primary = true
    `;
    if (Number(primary_count) === 0) {
        await sql`
            UPDATE hostel_images SET is_primary = true
            WHERE id = (
                SELECT id FROM hostel_images WHERE hostel_id = ${hostelId} ORDER BY display_order ASC LIMIT 1
            )
        `;
    }

    revalidatePath('/hostelOwner/hostels');
    revalidatePath(`/hostelOwner/hostels/${hostelId}/edit`);
    revalidatePath('/hostelOwner');
}