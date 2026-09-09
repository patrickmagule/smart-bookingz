// hooks/useConversationSocket.ts
'use client';
import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher/client';

export function useConversationSocket(conversationId: string, onNewMessage: () => void) {
    useEffect(() => {
        const channel = pusherClient.subscribe(`private-conversation-${conversationId}`);
        channel.bind('new-message', onNewMessage);

        return () => {
            channel.unbind('new-message', onNewMessage);
            pusherClient.unsubscribe(`private-conversation-${conversationId}`);
        };
    }, [conversationId, onNewMessage]);
}