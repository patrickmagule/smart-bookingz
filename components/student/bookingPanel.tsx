'use client';

import { useState } from 'react';
import { bookSpace } from '@/app/student/hostels/[id]/action';
import type { RoomWithSpaces } from '@/lib/data/hostelDetails';

interface SelectedSpace {
    spaceId: string;
    label: string;
}

export default function BookingPanel({ hostelId, rooms }: { hostelId: string; rooms: RoomWithSpaces[] }) {
    const [selected, setSelected] = useState<SelectedSpace | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    async function handleConfirm() {
        if (!selected || !startDate) {
            setFeedback({ type: 'error', text: 'Please pick a bed and a move-in date.' });
            return;
        }
        setLoading(true);
        setFeedback(null);
        const result = await bookSpace(hostelId, selected.spaceId, startDate, endDate || null, note);
        setLoading(false);

        if (result?.error) {
            setFeedback({ type: 'error', text: result.error });
        } else {
            setFeedback({ type: 'success', text: 'Booking request sent — the owner will confirm shortly.' });
            setSelected(null);
            setStartDate('');
            setEndDate('');
            setNote('');
        }
    }

    return (
        <div className="space-y-4">
            {rooms.map((room) => (
                <div key={room.room_id} className="border border-[#E0D9CF] rounded-sm p-4">
                    <div className="flex justify-between items-baseline mb-2">
                        <h4 className="text-sm font-semibold text-[#1A1A1E]">
                            Room {room.room_number}
                            {room.room_type ? ` · ${room.room_type}` : ''}
                        </h4>
                        <span className="text-sm font-semibold text-[#1E3A5F]">
                            K{room.price_per_month.toLocaleString()}/mo
                        </span>
                    </div>
                    {room.description && <p className="text-xs text-[#6B6B78] mb-3">{room.description}</p>}
                    <div className="flex flex-wrap gap-2">
                        {room.spaces.map((space) => {
                            const label = `Bed ${space.space_number ?? space.space_id.slice(0, 4)}`;
                            const isSelected = selected?.spaceId === space.space_id;
                            return (
                                <button
                                    key={space.space_id}
                                    disabled={space.is_occupied}
                                    onClick={() =>
                                        setSelected({
                                            spaceId: space.space_id,
                                            label: `Room ${room.room_number} · ${label}`,
                                        })
                                    }
                                    className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                                        space.is_occupied
                                            ? 'border-[#E0D9CF] text-[#B8B2A6] bg-[#F9F8F6] cursor-not-allowed line-through'
                                            : isSelected
                                                ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white'
                                                : 'border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#EEE9E0]'
                                    }`}
                                >
                                    {label}
                                    {space.is_occupied && ' · Taken'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {selected && (
                <div className="border border-[#1E3A5F] rounded-sm p-4 bg-[#F9F8F6] space-y-3">
                    <p className="text-sm font-medium text-[#1A1A1E]">Booking: {selected.label}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-[#6B6B78] block mb-1">Move-in date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-[#E0D9CF] rounded-sm px-2 py-1.5 text-sm outline-none focus:border-[#1E3A5F]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-[#6B6B78] block mb-1">Move-out date (optional)</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-[#E0D9CF] rounded-sm px-2 py-1.5 text-sm outline-none focus:border-[#1E3A5F]"
                            />
                        </div>
                    </div>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Anything the owner should know? (optional)"
                        rows={2}
                        className="w-full border border-[#E0D9CF] rounded-sm px-2 py-1.5 text-sm outline-none focus:border-[#1E3A5F]"
                    />
                    {feedback && (
                        <p className={`text-xs ${feedback.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                            {feedback.text}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a] disabled:opacity-50"
                        >
                            {loading ? 'Sending…' : 'Confirm booking request'}
                        </button>
                        <button
                            onClick={() => setSelected(null)}
                            className="border border-[#E0D9CF] px-4 py-2 rounded-sm text-sm text-[#6B6B78] hover:bg-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}