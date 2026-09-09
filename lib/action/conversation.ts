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

export async function replyToConversation(conversationId: string, message: string) {
    const studentId = await getCurrentStudentId();
    // Consistent with messageOwner: an active subscriptions is required to
    // send any message, not just to start the conversation.
    await requireActiveSubscription(studentId);

    const trimmed = message.trim();
    if (!trimmed) return { error: 'Message cannot be empty.' };

    const [conversation] = await sql`
        SELECT id FROM conversations WHERE id = ${conversationId} AND student_id = ${studentId} LIMIT 1
    `;
    if (!conversation) return { error: 'Conversation not found.' };

    await sql`
        INSERT INTO messages (conversation_id, sender_id, message)
        VALUES (${conversationId}, ${studentId}, ${trimmed})
    `;

    revalidatePath(`/student/messages/${conversationId}`);
    revalidatePath('/student/messages');
    return { success: true };
}