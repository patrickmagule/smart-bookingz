'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { requireActiveSubscription } from '@/lib/subscription/access';
import { revalidatePath } from 'next/cache';

async function getCurrentStudentId(): Promise<string> {
    const { data } = await auth.getSession();
    if (!data?.user) throw new Error('NOT_AUTHENTICATED');

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) throw new Error('USER_NOT_FOUND');

    return user.id as string;
}

export async function bookSpace(
    hostelId: string,
    spaceId: string,
    startDate: string,
    endDate: string | null,
    studentMessage: string
) {
    const studentId = await getCurrentStudentId();
    await requireActiveSubscription(studentId); // throws SUBSCRIPTION_REQUIRED if not active

    // Defense in depth: confirm this space genuinely belongs to this hostel and
    // is currently ACTIVE, even though the UI already filtered for this. Never
    // trust IDs the client sends — they're just form data, freely editable.
    const [space] = await sql`
        SELECT rs.id, rs.status
        FROM room_spaces rs
        JOIN rooms r ON r.id = rs.room_id
        WHERE rs.id = ${spaceId} AND r.hostel_id = ${hostelId}
        LIMIT 1
    `;
    if (!space) return { error: 'This bed could not be found for this hostel.' };
    if (space.status !== 'ACTIVE') return { error: 'This bed is not currently available.' };

    try {
        await sql`
            INSERT INTO bookings (student_id, space_id, start_date, end_date, monthly_price, student_message)
            SELECT ${studentId}, ${spaceId}, ${startDate}, ${endDate},
                   r.price_per_month, ${studentMessage || null}
            FROM room_spaces rs
            JOIN rooms r ON r.id = rs.room_id
            WHERE rs.id = ${spaceId}
        `;
    } catch (err: any) {
        // Postgres raises exclusion_violation (23P01) when the DB's EXCLUDE
        // constraint on bookings catches an overlap — i.e. someone booked this
        // exact bed for an overlapping date range moments before this request.
        if (err?.code === '23P01') {
            return { error: 'This bed was just booked by someone else. Please pick another.' };
        }
        throw err;
    }

    revalidatePath(`/student/hostels/${hostelId}`);
    revalidatePath('/student/bookings');
    return { success: true };
}

export async function messageOwner(hostelId: string, ownerId: string, message: string) {
    const studentId = await getCurrentStudentId();
    await requireActiveSubscription(studentId);

    const trimmed = message.trim();
    if (!trimmed) return { error: 'Message cannot be empty.' };

    // Find or create the conversation for this (student, owner, hostel) triple.
    let [conversation] = await sql`
        SELECT id, is_unlocked FROM conversations
        WHERE student_id = ${studentId} AND owner_id = ${ownerId} AND hostel_id = ${hostelId}
        LIMIT 1
    `;

    if (!conversation) {
        // New conversation for a subscriber: unlock it immediately, skipping
        // the separate K500 messaging_payments flow entirely.
        [conversation] = await sql`
            INSERT INTO conversations (student_id, owner_id, hostel_id, is_unlocked, unlocked_at)
            VALUES (${studentId}, ${ownerId}, ${hostelId}, TRUE, now())
            RETURNING id, is_unlocked
        `;
    } else if (!conversation.is_unlocked) {
        await sql`UPDATE conversations SET is_unlocked = TRUE, unlocked_at = now() WHERE id = ${conversation.id}`;
    }

    await sql`
        INSERT INTO messages (conversation_id, sender_id, message)
        VALUES (${conversation.id}, ${studentId}, ${trimmed})
    `;

    revalidatePath('/student/messages');
    return { success: true, conversationId: conversation.id };
}