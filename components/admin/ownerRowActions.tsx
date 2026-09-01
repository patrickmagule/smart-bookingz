'use client';

import { useState, useTransition } from 'react';
import { approveOwner, rejectOwner, setOwnerStatus } from '@/app/admin/owners/actions';

export function PendingOwnerActions({ verificationId, ownerId }: { verificationId: string; ownerId: string }) {
    const [isPending, startTransition] = useTransition();
    const [showReject, setShowReject] = useState(false);
    const [reason, setReason] = useState('');

    return (
        <div className="flex items-center gap-2">
            <button
                disabled={isPending}
                onClick={() => startTransition(() => approveOwner(verificationId, ownerId))}
                className="rounded-md border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 disabled:opacity-50"
            >
                Approve
            </button>
            <button
                disabled={isPending}
                onClick={() => setShowReject(true)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
            >
                Reject
            </button>

            {showReject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setShowReject(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="mb-2 text-sm font-semibold text-navy">Reject this owner?</p>
                        <p className="mb-3 text-xs text-slate-500">The reason is sent to the applicant as a notification.</p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Submitted details do not match the account name"
                            className="mb-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-navy"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowReject(false)}
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isPending}
                                onClick={() =>
                                    startTransition(async () => {
                                        await rejectOwner(verificationId, ownerId, reason);
                                        setShowReject(false);
                                    })
                                }
                                className="rounded-md border border-red-600 bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                                Confirm reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function OwnerActiveToggle({ ownerId, isSuspended }: { ownerId: string; isSuspended: boolean }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            disabled={isPending}
            onClick={() => startTransition(() => setOwnerStatus(ownerId, isSuspended ? 'ACTIVE' : 'SUSPENDED'))}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                isSuspended ? 'border-green-600 text-green-700' : 'border-red-300 text-red-600'
            }`}
        >
            {isSuspended ? 'Reactivate' : 'Deactivate'}
        </button>
    );
}
