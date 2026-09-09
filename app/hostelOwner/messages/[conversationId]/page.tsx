// app/hostelOwner/messages/[conversationId]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
    getConversationForOwner,
} from '@/lib/data/ownerMessage';
import {
    getConversationMessages,
} from '@/lib/data/studentMessage';
import OwnerMessageThread from '@/components/owner/messageThread';
import OwnerReplyForm from '@/components/owner/replyForm';

export const dynamic = 'force-dynamic';

export default async function OwnerConversationThreadPage({
                                                         params,
                                                     }: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;

    const { data } = await auth.getSession();
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    if (!user) return notFound();

    const conversation = await getConversationForOwner(conversationId, user.id);
    if (!conversation) return notFound();

    const messages = await getConversationMessages(conversationId);

    // Format initial messages for the thread
    const initialMessages = messages.map((m) => ({
        id: m.id,
        isMine: m.sender_id === user.id,
        locked: false,
        message: m.message,
        created_at: m.created_at,
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4">
            <Link href="/hostelOwner/messages" className="text-xs text-[#6B6B78] hover:underline">
                ← Back to messages
            </Link>

            <div>
                <h1 className="text-lg font-semibold text-[#1A1A1E]">
                    {conversation.student_first_name} {conversation.student_last_name}
                </h1>
                <p className="text-xs text-[#6B6B78]">{conversation.hostel_name}</p>
            </div>

            <OwnerMessageThread conversationId={conversationId} initialMessages={initialMessages} />

            <OwnerReplyForm conversationId={conversationId} />
        </div>
    );
}
