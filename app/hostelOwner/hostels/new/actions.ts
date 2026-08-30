'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------
// Types coming from the client form
// ---------------------------------------------------------------------

type BedInput = {
  label: string;
};

type RoomInput = {
  name: string;         // -> rooms.room_number
  type: string;         // -> rooms.room_type
  description: string;  // -> rooms.description
  amenities: string[];  // -> room_amenities
  price: string;        // -> rooms.price_per_month (ONE price for the whole room)
  beds: BedInput[];     // -> room_spaces (no price column — beds share the room price)
};

type PhotoInput = {
  url: string;       // UploadThing URL — never raw file data
  isPrimary: boolean;
  key: string;
};

type CreateListingInput = {
  hostelName: string;
  address: string;
  location: string;   // area / neighbourhood
  distance: string;   // km from MUBAS, stored as a real number
  gender: 'mixed' | 'male' | 'female';
  description: string;
  contactPhone: string;
  facilities: string[];
  rooms: RoomInput[];
  photos: PhotoInput[];
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

async function requireOwnerId() {
  const { data } = await auth.getSession();
  if (!data?.user) throw new Error('Not authenticated');

  const [user] = await sql`
        SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1
    `;
  if (!user) throw new Error('User not found');
  if (user.role !== 'OWNER') throw new Error('Only owners can create listings');
  return user.id as string;
}

/**
 * Looks up (or creates) amenity rows by name and returns their ids.
 * Shared by both hostel-level facilities and room-level amenities —
 * they live in the same `amenities` table.
 */
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

// ---------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------

export async function createHostelListing(input: CreateListingInput) {
  const ownerId = await requireOwnerId();

  // --- validation (mirrors the client-side checks, but never trust the client) ---
  if (!input.hostelName.trim()) throw new Error('Hostel name is required');
  if (!input.address.trim()) throw new Error('Address is required');
  if (!input.location.trim()) throw new Error('Area/neighbourhood is required');
  if (!input.contactPhone.trim()) throw new Error('Contact phone is required');
  if (!input.description.trim()) throw new Error('Description is required');
  if (input.rooms.length === 0) throw new Error('Add at least one room');

  for (const room of input.rooms) {
    if (!room.name.trim()) throw new Error('Every room needs a name');
    if (room.beds.length === 0) throw new Error(`${room.name} must have at least one bed`);
    if (!room.price || Number(room.price) <= 0) {
      throw new Error(`${room.name} needs a valid monthly price`);
    }
  }

  const distanceKm = input.distance.trim() ? Number(input.distance) : null;
  if (distanceKm !== null && (Number.isNaN(distanceKm) || distanceKm < 0)) {
    throw new Error('Distance from MUBAS must be a valid, non-negative number');
  }

  // --- hostel row ---
  const [hostel] = await sql`
        INSERT INTO hostels (
            owner_id, name, description, address, area, city, contact_phone,
            distance_from_campus_km, gender_preference, status
        ) VALUES (
            ${ownerId}, ${input.hostelName}, ${input.description}, ${input.address},
            ${input.location}, 'Blantyre', ${input.contactPhone}, ${distanceKm}, ${input.gender},
            'PENDING_APPROVAL'
        )
        RETURNING id
    `;
  const hostelId = hostel.id as string;

  // --- hostel facilities ---
  if (input.facilities.length > 0) {
    const facilityIds = await upsertAmenityIds(input.facilities);
    for (const amenityId of facilityIds) {
      await sql`
                INSERT INTO hostel_amenities (hostel_id, amenity_id)
                VALUES (${hostelId}, ${amenityId})
                ON CONFLICT DO NOTHING
            `;
    }
  }

  // --- hostel photos — URLs only, files already live on UploadThing ---
  for (let i = 0; i < input.photos.length; i++) {
    const photo = input.photos[i];
    await sql`
            INSERT INTO hostel_images (hostel_id, image_url, caption, is_primary, display_order)
            VALUES (${hostelId}, ${photo.url}, ${photo.key}, ${photo.isPrimary}, ${i})
        `;
  }

  // --- rooms + beds ---
  // Price lives on the ROOM. Every bed (room_space) in a room shares
  // room.price_per_month — room_spaces has no price column by design,
  // and the booking_price_snapshot trigger already reads price via
  // room_spaces -> rooms, so this stays consistent with bookings.
  for (const room of input.rooms) {
    const [createdRoom] = await sql`
            INSERT INTO rooms (hostel_id, room_number, description, price_per_month, room_type, status)
            VALUES (
                ${hostelId}, ${room.name}, ${room.description || null},
                ${parseFloat(room.price)}, ${room.type}, 'ACTIVE'
            )
            RETURNING id
        `;
    const roomId = createdRoom.id as string;

    if (room.amenities.length > 0) {
      const amenityIds = await upsertAmenityIds(room.amenities);
      for (const amenityId of amenityIds) {
        await sql`
                    INSERT INTO room_amenities (room_id, amenity_id)
                    VALUES (${roomId}, ${amenityId})
                    ON CONFLICT DO NOTHING
                `;
      }
    }

    for (const bed of room.beds) {
      await sql`
                INSERT INTO room_spaces (room_id, space_number, status)
                VALUES (${roomId}, ${bed.label}, 'ACTIVE')
            `;
    }
  }

  revalidatePath('/hostelOwner');

  return { hostelId };
}