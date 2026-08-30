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

async function assertOwnsBooking(ownerId: string, bookingId: string) {
    const [row] = await sql`
    SELECT b.id
    FROM bookings b
    JOIN room_spaces rs ON b.space_id = rs.id
    JOIN rooms r ON rs.room_id = r.id
    JOIN hostels h ON r.hostel_id = h.id
    WHERE b.id = ${bookingId} AND h.owner_id = ${ownerId}
  `;
    if (!row) throw new Error('Booking not found, or not owned by this account');
}

export async function acceptBooking(bookingId: string) {
    const ownerId = await requireOwnerId();
    await assertOwnsBooking(ownerId, bookingId);

    await sql`
    UPDATE bookings SET status = 'CONFIRMED', updated_at = now()
    WHERE id = ${bookingId} AND status = 'PENDING'
  `;

    await sql`
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by)
    VALUES (${bookingId}, 'PENDING', 'CONFIRMED', ${ownerId})
  `;

    revalidatePath('/hostelOwner');
    revalidatePath('/hostelOwner/bookings');
}

export async function declineBooking(bookingId: string, reason?: string) {
    const ownerId = await requireOwnerId();
    await assertOwnsBooking(ownerId, bookingId);

    await sql`
    UPDATE bookings SET status = 'REJECTED', updated_at = now()
    WHERE id = ${bookingId} AND status = 'PENDING'
  `;

    await sql`
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, reason)
    VALUES (${bookingId}, 'PENDING', 'REJECTED', ${ownerId}, ${reason ?? null})
  `;

    revalidatePath('/hostelOwner');
    revalidatePath('/hostelOwner/bookings');
}