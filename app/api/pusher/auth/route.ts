// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { pusherServer } from '@/lib/pusher/server';

export async function POST(req: NextRequest) {
    const { data } = await auth.getSession();
    if (!data?.user) return new NextResponse('Unauthorized', { status: 401 });

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const form = await req.formData();
    const socketId = form.get('socket_id') as string;
    const channelName = form.get('channel_name') as string;
    const conversationId = channelName.replace('private-conversation-', '');

    // Membership check covers BOTH sides of the conversation — student or
    // owner — unlike getConversationForStudent, which only checks student_id.
    const [conversation] = await sql`
        SELECT id FROM conversations
        WHERE id = ${conversationId} AND (student_id = ${user.id} OR owner_id = ${user.id})
        LIMIT 1
    `;
    if (!conversation) return new NextResponse('Forbidden', { status: 403 });

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
}