// app/student/messages/[conversationId]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
    getConversationForStudent,
    getConversationMessages,
    markMessagesRead,
    toClientMessages,
} from '@/lib/data/studentMessage';
import { getActiveSubscription } from '@/lib/subscription/access';
import ReplyForm from '@/components/student/replyForm';
import MessageThread from "@/components/student/messageThread";

export const dynamic = 'force-dynamic';

export default async function ConversationThreadPage({
                                                         params,
                                                     }: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;

    const { data } = await auth.getSession();
    console.log('[conversation-thread] authUserId:', data?.user?.id, 'conversationId:', conversationId);

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    console.log('[conversation-thread] resolved app user:', user);
    if (!user) {
        console.log('[conversation-thread] 404 reason: no matching users row for this auth_id');
        return notFound();
    }

    const conversation = await getConversationForStudent(conversationId, user.id);
    console.log('[conversation-thread] conversation lookup result:', conversation);
    if (!conversation) {
        // Extra diagnostic: does the conversation row exist at all, regardless
        // of student_id/join matches? This tells us whether it's a mismatch
        // (row exists, wrong owner) or a genuinely missing/broken row.
        const [rawRow] = await sql`SELECT id, student_id, owner_id, hostel_id FROM conversations WHERE id = ${conversationId}`;
        console.log('[conversation-thread] raw conversations row (no joins, no student filter):', rawRow);
        console.log('[conversation-thread] 404 reason: getConversationForStudent returned null — see raw row above for why');
        return notFound();
    }

    const active = await getActiveSubscription(user.id);
    const hasActiveSub = !!active;

    const messages = await getConversationMessages(conversationId);

    if (hasActiveSub) {
        await markMessagesRead(conversationId, user.id);
    }

    const initialMessages = toClientMessages(messages, user.id, hasActiveSub);

    return (
        <div className="max-w-2xl space-y-4">
            <Link href="/student/messages" className="text-xs text-[#6B6B78] hover:underline">
                ← Back to messages
            </Link>

            <div>
                <h1 className="text-lg font-semibold text-[#1A1A1E]">
                    {conversation.owner_first_name} {conversation.owner_last_name}
                </h1>
                <p className="text-xs text-[#6B6B78]">{conversation.hostel_name}</p>
            </div>

            <MessageThread conversationId={conversationId} initialMessages={initialMessages} />

            {hasActiveSub ? (
                <ReplyForm conversationId={conversationId} />
            ) : (
                <div className="border border-[#E0D9CF] rounded-sm bg-[#F9F8F6] p-4 text-center space-y-2">
                    <p className="text-sm text-[#1A1A1E]">
                        Subscribe to read new messages and reply to {conversation.owner_first_name}.
                    </p>
                    <Link
                        href="/student/subscribe"
                        className="inline-block bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-xs font-medium hover:bg-[#162d4a] transition-colors"
                    >
                        View subscription plans
                    </Link>
                </div>
            )}
        </div>
    );
}