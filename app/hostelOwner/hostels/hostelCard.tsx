'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleHostelActive } from './action';

export function HostelCardActions({ hostelId, status }: { hostelId: string; status: string }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const canToggle = status === 'PUBLISHED' || status === 'SUSPENDED';
    const isActive = status === 'PUBLISHED';

    const handleToggle = () => {
        setError(null);
        if (isActive && !confirm('Deactivate this hostel? It will be hidden from students until you reactivate it.')) {
            return;
        }
        startTransition(async () => {
            try {
                await toggleHostelActive(hostelId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        });
    };

    return (
        <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex gap-2">
                <Link
                    href={`/hostelOwner/hostels/new/${hostelId}/edit`}
                    className="border border-[#1E3A5F] text-[#1E3A5F] text-sm px-4 py-1.5 rounded-sm hover:bg-[#EEE9E0] transition-colors"
                >
                    Edit
                </Link>
                {canToggle && (
                    <button
                        onClick={handleToggle}
                        disabled={isPending}
                        className="border border-red-300 text-red-500 text-sm px-4 py-1.5 rounded-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? '…' : isActive ? 'Deactivate' : 'Activate'}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 max-w-[220px] text-right">{error}</p>}
        </div>
    );
}