import { cache } from 'react';
import { sql } from '@/lib/db';

export const getOwnerUser = cache(async (authId: string) => {
    const [user] = await sql`
    SELECT id, role, first_name, last_name, email
    FROM users
    WHERE auth_id = ${authId}
    LIMIT 1
  `;
    return user as
        | { id: string; role: string; first_name: string; last_name: string; email: string }
        | undefined;
});

export const getOwnerVerification = cache(async (ownerId: string) => {
    const [verification] = await sql`
    SELECT status
    FROM owner_verifications
    WHERE owner_id = ${ownerId}
    ORDER BY submitted_at DESC
    LIMIT 1
  `;
    return verification as { status: string } | undefined;
});

export const getOwnerCounts = cache(async (ownerId: string) => {
    const [{ count: pendingCount }] = await sql`
    SELECT COUNT(*) FROM bookings b
    JOIN room_spaces rs ON b.space_id = rs.id
    JOIN rooms r ON rs.room_id = r.id
    JOIN hostels h ON r.hostel_id = h.id
    WHERE h.owner_id = ${ownerId} AND b.status = 'PENDING'
  `;

    const [{ count: unreadMsgs }] = await sql`
    SELECT COUNT(*) FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.owner_id = ${ownerId}
      AND m.is_read = FALSE
      AND m.sender_id != ${ownerId}
  `;

    const [{ count: unreadNotifs }] = await sql`
    SELECT COUNT(*) FROM notifications
    WHERE user_id = ${ownerId} AND is_read = FALSE
  `;

    return {
        pendingCount: Number(pendingCount),
        unreadMsgs: Number(unreadMsgs),
        unreadNotifs: Number(unreadNotifs),
    };
});