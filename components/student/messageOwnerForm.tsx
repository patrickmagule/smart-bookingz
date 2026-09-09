'use client';

import { useState } from 'react';
import { messageOwner } from '@/app/student/hostels/[id]/action';

export default function MessageOwnerForm({ hostelId, ownerId }: { hostelId: string; ownerId: string }) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    async function handleSend() {
        if (!message.trim()) return;
        setLoading(true);
        setFeedback(null);
        const result = await messageOwner(hostelId, ownerId, message);
        setLoading(false);

        if (result?.error) {
            setFeedback({ type: 'error', text: result.error });
        } else {
            setFeedback({ type: 'success', text: 'Message sent — check your Messages tab for replies.' });
            setMessage('');
        }
    }

    return (
        <div className="border border-[#E0D9CF] rounded-sm p-4 space-y-3">
            <h4 className="text-sm font-semibold text-[#1A1A1E]">Message the owner</h4>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about availability, viewing times, house rules..."
                rows={3}
                className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2 text-sm outline-none focus:border-[#1E3A5F]"
            />
            {feedback && (
                <p className={`text-xs ${feedback.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {feedback.text}
                </p>
            )}
            <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50"
            >
                {loading ? 'Sending…' : 'Send message'}
            </button>
        </div>
    );
}