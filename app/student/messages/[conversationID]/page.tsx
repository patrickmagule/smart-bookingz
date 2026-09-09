// app/student/messages/[conversationId]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import {
    getConversationForStudent,
    getConversationMessages,
    markMessagesRead,
} from '@/lib/data/studentMessage';
import ReplyForm from '@/components/student/replyForm';

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

    await markMessagesRead(conversationId, user.id);
    const messages = await getConversationMessages(conversationId);

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

            <div className="border border-[#E0D9CF] rounded-sm bg-white p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="text-sm text-[#6B6B78] text-center py-8">No messages yet.</p>
                ) : (
                    messages.map((m) => {
                        const isMine = m.sender_id === user.id;
                        return (
                            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-sm px-3 py-2 text-sm ${
                                        isMine ? 'bg-[#1E3A5F] text-white' : 'bg-[#F9F8F6] text-[#1A1A1E]'
                                    }`}
                                >
                                    <p>{m.message}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-[#6B6B78]'}`}>
                                        {format(new Date(m.created_at), 'MMM d, HH:mm')}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <ReplyForm conversationId={conversationId} />
        </div>
    );
}