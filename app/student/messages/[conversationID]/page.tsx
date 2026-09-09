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
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    if (!user) return notFound();

    const conversation = await getConversationForStudent(conversationId, user.id);
    if (!conversation) return notFound();

    const active = await getActiveSubscription(user.id);
    const hasActiveSub = !!active;

    // Fetch messages BEFORE marking anything as read, so we can tell which
    // ones were genuinely already opened vs brand new — that distinction is
    // what drives the paywall blur below.
    const messages = await getConversationMessages(conversationId);

    // Only mark messages as read once the student can actually see them.
    // If they're not subscribed, leave unread messages unread so they stay
    // locked until the student subscribes and genuinely opens them.
    if (hasActiveSub) {
        await markMessagesRead(conversationId, user.id);
    }

    // Same locked/message computation the live GET route uses — computed
    // once here, shared, so SSR and the socket-driven refetch can never
    // drift out of sync with each other.
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