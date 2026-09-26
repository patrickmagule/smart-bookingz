'use client';

import { useState, useTransition } from 'react';
import { deleteUserCompletely } from '@/app/admin/users/action';

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const canConfirm = confirmText.trim().toLowerCase() === userName.trim().toLowerCase();

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            try {
                await deleteUserCompletely(userId);
                setOpen(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        });
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="rounded-md border border-red-300 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
            >
                Delete
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
                <h3 className="text-sm font-semibold text-red-600 mb-2">Permanently delete {userName}?</h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    This deletes the account and everything tied to it — hostels, rooms, bookings, messages,
                    payments, reviews, and reports — plus any uploaded photos in storage. This cannot be undone.
                </p>
                <p className="text-xs text-slate-600 mb-1.5">Type <strong>{userName}</strong> to confirm.</p>
                <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-red-400 mb-3"
                />
                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => { setOpen(false); setConfirmText(''); setError(null); }}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!canConfirm || isPending}
                        className="rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        {isPending ? 'Deleting…' : 'Delete permanently'}
                    </button>
                </div>
            </div>
        </div>
    );
}