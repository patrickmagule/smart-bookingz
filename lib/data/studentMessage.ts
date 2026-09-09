// lib/data/studentMessages.ts
import { sql } from '@/lib/db';

export interface ConversationSummary {
    id: string;
    hostel_id: string;
    hostel_name: string;
    owner_first_name: string;
    owner_last_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

// Raw shape as it comes back from Postgres, before we coerce unread_count
// from a numeric-as-string/bigint into a real number.
interface ConversationSummaryRow {
    id: string;
    hostel_id: string;
    hostel_name: string;
    owner_first_name: string;
    owner_last_name: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: string | number;
}

export async function getStudentConversations(studentId: string): Promise<ConversationSummary[]> {
    const rows = (await sql`
        SELECT c.id, c.hostel_id, h.name AS hostel_name,
               u.first_name AS owner_first_name, u.last_name AS owner_last_name,
               (SELECT m.message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
               (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
               (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ${studentId} AND m.is_read = FALSE) AS unread_count
        FROM conversations c
            JOIN hostels h ON h.id = c.hostel_id
            JOIN users u ON u.id = c.owner_id
        WHERE c.student_id = ${studentId}
        ORDER BY last_message_at DESC NULLS LAST, c.created_at DESC
    `) as ConversationSummaryRow[];

    return rows.map((r) => ({ ...r, unread_count: Number(r.unread_count) }));
}

export interface ConversationDetail {
    id: string;
    hostel_id: string;
    hostel_name: string;
    owner_id: string;
    owner_first_name: string;
    owner_last_name: string;
}

// Scoped to the requesting student — this is what stops one student from
// reading another student's conversation by guessing/changing the URL.
export async function getConversationForStudent(
    conversationId: string,
    studentId: string
): Promise<ConversationDetail | null> {
    const rows = (await sql`
        SELECT c.id, c.hostel_id, h.name AS hostel_name,
               c.owner_id, u.first_name AS owner_first_name, u.last_name AS owner_last_name
        FROM conversations c
                 JOIN hostels h ON h.id = c.hostel_id
                 JOIN users u ON u.id = c.owner_id
        WHERE c.id = ${conversationId} AND c.student_id = ${studentId}
            LIMIT 1
    `) as ConversationDetail[];

    return rows[0] ?? null;
}

export interface MessageRow {
    id: string;
    sender_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export async function getConversationMessages(conversationId: string): Promise<MessageRow[]> {
    return (await sql`
        SELECT id, sender_id, message, is_read, created_at
        FROM messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
    `) as MessageRow[];
}

export async function markMessagesRead(conversationId: string, studentId: string): Promise<void> {
    await sql`
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = ${conversationId} AND sender_id != ${studentId} AND is_read = FALSE
    `;
}

// lib/data/studentMessage.ts — add this export
export interface ClientMessage {
    id: string;
    isMine: boolean;
    locked: boolean;
    message: string | null;
    created_at: string;
}

export function toClientMessages(
    messages: MessageRow[],
    userId: string,
    hasActiveSub: boolean
): ClientMessage[] {
    return messages.map((m) => {
        const isMine = m.sender_id === userId;
        const locked = !isMine && !m.is_read && !hasActiveSub;
        return {
            id: m.id,
            isMine,
            locked,
            message: locked ? null : m.message,
            created_at: m.created_at,
        };
    });
}