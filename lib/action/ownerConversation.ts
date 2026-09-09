// lib/action/ownerConversation.ts
'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher/server';

async function getCurrentOwnerId(): Promise<string> {
    const { data } = await auth.getSession();
    if (!data?.user) throw new Error('NOT_AUTHENTICATED');
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) throw new Error('USER_NOT_FOUND');
    return user.id as string;
}

export async function ownerReplyToConversation(conversationId: string, message: string) {
    const ownerId = await getCurrentOwnerId();

    const trimmed = message.trim();
    if (!trimmed) return { error: 'Message cannot be empty.' };

    const [conversation] = await sql`
        SELECT id FROM conversations WHERE id = ${conversationId} AND owner_id = ${ownerId} LIMIT 1
    `;
    if (!conversation) return { error: 'Conversation not found.' };

    await sql`
        INSERT INTO messages (conversation_id, sender_id, message)
        VALUES (${conversationId}, ${ownerId}, ${trimmed})
    `;

    await pusherServer.trigger(`private-conversation-${conversationId}`, 'new-message', {});

    revalidatePath(`/hostelOwner/messages/${conversationId}`);
    revalidatePath('/hostelOwner/messages');
    return { success: true };
}
