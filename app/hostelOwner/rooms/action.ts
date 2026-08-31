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

async function assertOwnsRoom(ownerId: string, roomId: string) {
    const [row] = await sql`
        SELECT r.id FROM rooms r JOIN hostels h ON h.id = r.hostel_id
        WHERE r.id = ${roomId} AND h.owner_id = ${ownerId}
    `;
    if (!row) throw new Error('Room not found, or not owned by this account');
}

type AddRoomInput = {
    hostelId: string;
    name: string;
    type: string;
    bedCount: number;
    price: string; // "price per bed" as shown to the owner — stored on the room, shared by every bed in it
};

export async function addRoom(input: AddRoomInput) {
    const ownerId = await requireOwnerId();
    await assertOwnsHostel(ownerId, input.hostelId);

    if (!input.name.trim()) throw new Error('Room name is required');
    if (!Number.isFinite(input.bedCount) || input.bedCount < 1) throw new Error('A room needs at least one bed');
    if (input.bedCount > 16) throw new Error('A room can have at most 16 beds');
    if (!input.price || Number(input.price) <= 0) throw new Error('Enter a valid price per bed');

    const [room] = await sql`
        INSERT INTO rooms (hostel_id, room_number, room_type, price_per_month, status)
        VALUES (${input.hostelId}, ${input.name}, ${input.type}, ${Number(input.price)}, 'ACTIVE')
        RETURNING id
    `;

    const labels = 'ABCDEFGHIJKLMNOP'.split('');
    for (let i = 0; i < input.bedCount; i++) {
        const label = `Bed ${labels[i] ?? i + 1}`;
        await sql`
            INSERT INTO room_spaces (room_id, space_number, status)
            VALUES (${room.id}, ${label}, 'ACTIVE')
        `;
    }

    revalidatePath('/hostelOwner/rooms');
    revalidatePath('/hostelOwner/hostels');
    revalidatePath('/hostelOwner');
}

/** Flips a room between ACTIVE and INACTIVE. Doesn't touch existing bookings. */
export async function toggleRoomStatus(roomId: string) {
    const ownerId = await requireOwnerId();
    await assertOwnsRoom(ownerId, roomId);

    const [room] = await sql`SELECT status FROM rooms WHERE id = ${roomId}`;
    const nextStatus = room.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await sql`UPDATE rooms SET status = ${nextStatus}, updated_at = now() WHERE id = ${roomId}`;

    revalidatePath('/hostelOwner/rooms');
    revalidatePath('/hostelOwner/hostels');
}

/** Flips a single bed between ACTIVE and INACTIVE. Refuses if it's currently booked. */
export async function toggleBedStatus(spaceId: string) {
    const ownerId = await requireOwnerId();

    const [row] = await sql`
        SELECT rs.id, rs.status,
            EXISTS (
                SELECT 1 FROM bookings b WHERE b.space_id = rs.id AND b.status = 'CONFIRMED'
            ) AS occupied
        FROM room_spaces rs
        JOIN rooms r ON r.id = rs.room_id
        JOIN hostels h ON h.id = r.hostel_id
        WHERE rs.id = ${spaceId} AND h.owner_id = ${ownerId}
    `;
    if (!row) throw new Error('Bed not found, or not owned by this account');
    if (row.occupied) throw new Error('This bed is currently booked and can\'t be disabled');

    const nextStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await sql`UPDATE room_spaces SET status = ${nextStatus}, updated_at = now() WHERE id = ${spaceId}`;

    revalidatePath('/hostelOwner/rooms');
}