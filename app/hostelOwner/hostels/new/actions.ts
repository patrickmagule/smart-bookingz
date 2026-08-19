'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

type Bed = { label: string; price?: string | number };
type Room = { name: string; description?: string; beds?: Bed[] };
type Image = { url: string; isPrimary?: boolean };

type CreateHostelPayload = {
  name: string;
  description: string;
  address: string;
  area: string;
  city: string;
  genderPolicy: string;
  facilities?: string[];
  images?: Image[];
  rooms?: Room[];
};

export async function createHostel(payload: CreateHostelPayload) {
  const { data } = await auth.getSession();
  if (!data?.user) throw new Error("Unauthorized");

  const [user] = await sql`SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
  if (!user || user.role !== 'OWNER') throw new Error("Forbidden");

  const {
    name,
    description,
    address,
    area,
    city,
    genderPolicy,
    facilities = [],
    images = [],
    rooms = []
  } = payload;

  // Run everything inside a transaction to ensure clean rolls back on error
  try {
    // 1. Insert Hostel
    const [hostel] = await sql`
      INSERT INTO hostels (
        owner_id, name, description, address, area, city, gender_preference, status
      )
      VALUES (
        ${user.id}, ${name}, ${description}, ${address}, ${area}, ${city}, ${genderPolicy}, 'DRAFT'
      )
      RETURNING id
    `;

    // 2. Insert Images
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      await sql`
        INSERT INTO hostel_images (hostel_id, image_url, is_primary, display_order)
        VALUES (${hostel.id}, ${img.url}, ${img.isPrimary || i === 0}, ${i})
      `;
    }

    // 3. Handle Amenities / Facilities
    for (const facilityName of facilities) {
      // Find or insert the amenity dynamically
      const [amenity] = await sql`
        INSERT INTO amenities (name)
        VALUES (${facilityName})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;

      await sql`
        INSERT INTO hostel_amenities (hostel_id, amenity_id)
        VALUES (${hostel.id}, ${amenity.id})
        ON CONFLICT DO NOTHING
      `;
    }

    // 4. Insert Rooms and Beds (room_spaces)
    for (const room of rooms) {
      // Calculate average or baseline room price from beds
      const basePrice = room.beds?.[0]?.price ? Number(room.beds[0].price) : 0;

      const [insertedRoom] = await sql`
        INSERT INTO rooms (hostel_id, room_number, description, price_per_month)
        VALUES (${hostel.id}, ${room.name}, ${room.description || null}, ${basePrice})
        RETURNING id
      `;

      // Insert individual bookable spaces (beds)
      if (room.beds && room.beds.length > 0) {
        for (const bed of room.beds) {
          await sql`
            INSERT INTO room_spaces (room_id, space_number, status)
            VALUES (${insertedRoom.id}, ${bed.label}, 'ACTIVE')
          `;
        }
      }
    }

    revalidatePath('/hostelOwner/hostels');
    return { success: true, hostelId: hostel.id };
  } catch (error: unknown) {
    console.error("Failed to create hostel:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create hostel listing");
    }
    throw new Error("Failed to create hostel listing");
  }
}