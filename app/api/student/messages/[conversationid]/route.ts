// app/api/student/messages/[conversationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
    getConversationForStudent,
    getConversationMessages,
    markMessagesRead,
    toClientMessages,
} from '@/lib/data/studentMessage';
import { getActiveSubscription } from '@/lib/subscription/access';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationid: string }> }
) {
    const { conversationid } = await params;

    const { data } = await auth.getSession();
    if (!data?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Same ownership check as the page — stops a student polling/refetching
    // a conversation that isn't theirs by guessing an ID.
    const conversation = await getConversationForStudent(conversationid, user.id);
    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const active = await getActiveSubscription(user.id);
    const hasActiveSub = !!active;

    const messages = await getConversationMessages(conversationid);

    // Only mark messages read once the student can actually see them, so
    // a refetch triggered by a socket event while unsubscribed never
    // silently "consumes" the lock.
    if (hasActiveSub) {
        await markMessagesRead(conversationid, user.id);
    }

    const payload = toClientMessages(messages, user.id, hasActiveSub);

    return NextResponse.json({ messages: payload, hasActiveSub });
}