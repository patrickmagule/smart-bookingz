// components/owner/messageThread.tsx
'use client';

import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { useConversationSocket } from '@/lib/hooks/useConversationSocket';
import type { ClientMessage } from '@/lib/data/studentMessage';

export default function OwnerMessageThread({
                                          conversationId,
                                          initialMessages,
                                      }: {
    conversationId: string;
    initialMessages: ClientMessage[];
}) {
    const [messages, setMessages] = useState(initialMessages);

    const refetch = useCallback(async () => {
        const res = await fetch(`/api/owner/messages/${conversationId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
    }, [conversationId]);

    useConversationSocket(conversationId, refetch);

    return (
        <div className="border border-[#E0D9CF] rounded-sm bg-white p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
                <p className="text-sm text-[#6B6B78] text-center py-8">No messages yet.</p>
            ) : (
                messages.map((m) => (
                    <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] rounded-sm px-3 py-2 text-sm ${
                                m.isMine ? 'bg-[#1E3A5F] text-white' : 'bg-[#F9F8F6] text-[#1A1A1E]'
                            }`}
                        >
                            <p>{m.message}</p>
                            <p className={`text-[10px] mt-1 ${m.isMine ? 'text-white/70' : 'text-[#6B6B78]'}`}>
                                {format(new Date(m.created_at), 'MMM d, HH:mm')}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
