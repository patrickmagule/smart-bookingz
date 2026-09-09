// components/student/MessageThread.tsx
'use client';

import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useConversationSocket } from '@/lib/hooks/useConversationSocket';
import type { ClientMessage } from '@/lib/data/studentMessage';

export default function MessageThread({
                                          conversationId,
                                          initialMessages,
                                      }: {
    conversationId: string;
    initialMessages: ClientMessage[];
}) {
    const [messages, setMessages] = useState(initialMessages);

    const refetch = useCallback(async () => {
        const res = await fetch(`/api/student/messages/${conversationId}`);
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
                            {m.locked ? (
                                <>
                                    <p className="blur-[3px] select-none">•••••• ••• •••••••• ••• ••••••</p>
                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#6B6B78]">
                                        <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5 shrink-0" />
                                        <span>Subscribe to view</span>
                                    </div>
                                </>
                            ) : (
                                <p>{m.message}</p>
                            )}
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