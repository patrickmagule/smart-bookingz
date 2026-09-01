'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function approveListing(hostelId: string, ownerId: string) {
    await sql`UPDATE hostels SET status = 'PUBLISHED' WHERE id = ${hostelId}`;
    await sql`
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
        VALUES (
            ${ownerId},
            'Listing approved',
            'Your hostel listing has been approved and is now live.',
            'LISTING_APPROVED',
            ${hostelId}
        )
    `;
    revalidatePath('/admin/listings');
    revalidatePath('/admin');
}

export async function rejectListing(hostelId: string, ownerId: string, reason: string) {
    await sql`UPDATE hostels SET status = 'REJECTED' WHERE id = ${hostelId}`;
    await sql`
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
        VALUES (
            ${ownerId},
            'Listing rejected',
            ${reason || 'Your listing was rejected.'},
            'LISTING_REJECTED',
            ${hostelId}
        )
    `;
    revalidatePath('/admin/listings');
    revalidatePath('/admin');
}

// "Remove" for an already-published listing that breaks policy. This sets
// status to REJECTED rather than issuing a hard DELETE: bookings.space_id
// references room_spaces with ON DELETE RESTRICT, so any hostel that has
// ever had a booking cannot be hard-deleted — Postgres will block it to
// protect booking/payment history. Setting status = REJECTED hides it from
// search immediately without that risk, and keeps the record for appeals
// or audits.
export async function removeListing(hostelId: string, ownerId: string, reason: string) {
    await sql`UPDATE hostels SET status = 'REJECTED' WHERE id = ${hostelId}`;
    await sql`
        INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
        VALUES (
            ${ownerId},
            'Listing removed',
            ${reason || 'Your listing was removed for violating platform policy.'},
            'LISTING_REMOVED',
            ${hostelId}
        )
    `;
    revalidatePath('/admin/listings');
    revalidatePath('/admin');
}
