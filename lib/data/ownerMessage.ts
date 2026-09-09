// lib/data/ownerMessage.ts
import { sql } from '@/lib/db';

export interface OwnerConversationSummary {
    id: string;
    student_id: string;
    student_first_name: string;
    student_last_name: string;
    hostel_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

interface OwnerConversationSummaryRow {
    id: string;
    student_id: string;
    student_first_name: string;
    student_last_name: string;
    hostel_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: string | number;
}

export async function getOwnerConversations(ownerId: string): Promise<OwnerConversationSummary[]> {
    const rows = (await sql`
        SELECT c.id, c.student_id, h.name AS hostel_name,
               u.first_name AS student_first_name, u.last_name AS student_last_name,
               (SELECT m.message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
               (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ${ownerId} AND m.is_read = FALSE) AS unread_count
        FROM conversations c
            JOIN hostels h ON h.id = c.hostel_id
            JOIN users u ON u.id = c.student_id
        WHERE c.owner_id = ${ownerId}
        ORDER BY last_message_at DESC NULLS LAST, c.created_at DESC
    `) as OwnerConversationSummaryRow[];

    return rows.map((r) => ({ ...r, unread_count: Number(r.unread_count) }));
}

export interface OwnerConversationDetail {
    id: string;
    student_id: string;
    student_first_name: string;
    student_last_name: string;
    hostel_name: string;
}

export async function getConversationForOwner(
    conversationId: string,
    ownerId: string
): Promise<OwnerConversationDetail | null> {
    const rows = (await sql`
        SELECT c.id, c.student_id, h.name AS hostel_name,
               u.first_name AS student_first_name, u.last_name AS student_last_name
        FROM conversations c
                 JOIN hostels h ON h.id = c.hostel_id
                 JOIN users u ON u.id = c.student_id
        WHERE c.id = ${conversationId} AND c.owner_id = ${ownerId}
            LIMIT 1
    `) as OwnerConversationDetail[];

    return rows[0] ?? null;
}

export async function markMessagesReadForOwner(conversationId: string, ownerId: string): Promise<void> {
    await sql`
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = ${conversationId} AND sender_id != ${ownerId} AND is_read = FALSE
    `;
}
