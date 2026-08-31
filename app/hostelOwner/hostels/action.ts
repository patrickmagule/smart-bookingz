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

/**
 * Toggles a hostel between PUBLISHED and SUSPENDED. Deliberately refuses
 * to touch DRAFT / PENDING_APPROVAL / REJECTED hostels — those states are
 * controlled by admin review, not by the owner's Deactivate button.
 */
export async function toggleHostelActive(hostelId: string) {
    const ownerId = await requireOwnerId();

    const [hostel] = await sql`
        SELECT status FROM hostels WHERE id = ${hostelId} AND owner_id = ${ownerId}
    `;
    if (!hostel) throw new Error('Hostel not found, or not owned by this account');

    if (hostel.status === 'PUBLISHED') {
        await sql`UPDATE hostels SET status = 'SUSPENDED', updated_at = now() WHERE id = ${hostelId}`;
    } else if (hostel.status === 'SUSPENDED') {
        await sql`UPDATE hostels SET status = 'PUBLISHED', updated_at = now() WHERE id = ${hostelId}`;
    } else {
        throw new Error('This listing is awaiting admin review and can\'t be toggled yet.');
    }

    revalidatePath('/hostelOwner/hostels');
    revalidatePath('/hostelOwner');
}