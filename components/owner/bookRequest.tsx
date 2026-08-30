'use client';

import { useTransition } from 'react';
import { acceptBooking, declineBooking } from '../../app/hostelOwner/action';

export function BookingRequestActions({ bookingId }: { bookingId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex gap-2 shrink-0">
            <button
                disabled={isPending}
                onClick={() => startTransition(() => acceptBooking(bookingId))}
                className="rounded-sm bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
                {isPending ? '...' : 'Accept'}
            </button>
            <button
                disabled={isPending}
                onClick={() => startTransition(() => declineBooking(bookingId))}
                className="rounded-sm border border-red-300 bg-white px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
                Decline
            </button>
        </div>
    );
}