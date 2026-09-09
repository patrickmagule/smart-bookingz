'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { replyToConversation } from '@/lib/action/conversation';

export default function ReplyForm({ conversationId }: { conversationId: string }) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSend() {
        if (!message.trim()) return;
        setLoading(true);
        setError(null);
        const result = await replyToConversation(conversationId, message);
        setLoading(false);
        if (result?.error) {
            setError(result.error);
        } else {
            setMessage('');
            router.refresh();
        }
    }

    return (
        <div className="space-y-2">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 border border-[#E0D9CF] rounded-sm px-3 py-2 text-sm outline-none focus:border-[#1E3A5F]"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}