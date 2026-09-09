'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-runs the server component every few seconds while status is PENDING, so
// the page updates itself the moment verifyAndActivateSubscription confirms
// the payment — without the user having to manually reload.
export default function StatusPoller({ txRef }: { txRef: string }) {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 3000);
        // Stop after 30s so we don't poll forever if something's genuinely stuck.
        const timeout = setTimeout(() => clearInterval(interval), 30000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router, txRef]);

    return null;
}