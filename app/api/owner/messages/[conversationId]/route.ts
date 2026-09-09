// app/api/owner/messages/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
    getConversationMessages,
} from '@/lib/data/studentMessage';
import {
    getConversationForOwner,
    markMessagesReadForOwner,
} from '@/lib/data/ownerMessage';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const { conversationId } = await params;

    const { data } = await auth.getSession();
    if (!data?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const conversation = await getConversationForOwner(conversationId, user.id);
    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const messages = await getConversationMessages(conversationId);

    // Owners can always see messages, no subscription check needed.
    await markMessagesReadForOwner(conversationId, user.id);

    // Format for client. For owners, locked is always false.
    const payload = messages.map((m) => ({
        id: m.id,
        isMine: m.sender_id === user.id,
        locked: false,
        message: m.message,
        created_at: m.created_at,
    }));

    return NextResponse.json({ messages: payload });
}
