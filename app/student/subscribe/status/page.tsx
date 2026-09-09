// app/student/subscribe/status/page.tsx
import Link from 'next/link';
import { verifyAndActivateSubscription } from '@/lib/subscription/verify';
import { PLAN_CONFIG } from '@/lib/subscription/plan';
import StatusPoller from '@/components/student/statusPoller';

export const dynamic = 'force-dynamic';

export default async function SubscriptionStatusPage({
                                                         searchParams,
                                                     }: {
    searchParams: Promise<{ tx_ref?: string }>;
}) {
    const { tx_ref } = await searchParams;

    if (!tx_ref) {
        return (
            <div className="max-w-md py-16 text-center">
                <p className="text-sm text-[#6B6B78]">Missing transaction reference.</p>
            </div>
        );
    }

    const result = await verifyAndActivateSubscription(tx_ref);

    return (
        <div className="max-w-md py-16 text-center space-y-4">
            {result.status === 'ACTIVE' && (
                <>
                    <div className="text-4xl">✅</div>
                    <h1 className="font-serif text-xl text-[#1A1A1E]">Subscription activated!</h1>
                    <p className="text-sm text-[#6B6B78]">
                        Your {PLAN_CONFIG[result.plan!]?.label} plan is now active.
                    </p>
                    <Link
                        href="/student/hostels"
                        className="inline-block bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a]"
                    >
                        Browse hostels →
                    </Link>
                </>
            )}

            {result.status === 'FAILED' && (
                <>
                    <div className="text-4xl">❌</div>
                    <h1 className="font-serif text-xl text-[#1A1A1E]">Payment failed</h1>
                    <p className="text-sm text-[#6B6B78]">Your payment could not be confirmed. Please try again.</p>
                    <Link
                        href="/student/subscribe"
                        className="inline-block bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a]"
                    >
                        Try again
                    </Link>
                </>
            )}

            {result.status === 'PENDING' && (
                <>
                    <div className="text-4xl">⏳</div>
                    <h1 className="font-serif text-xl text-[#1A1A1E]">Confirming your payment...</h1>
                    <p className="text-sm text-[#6B6B78]">This usually takes a few seconds. This page will update automatically.</p>
                    <StatusPoller txRef={tx_ref} />
                </>
            )}

            {result.status === 'NOT_FOUND' && (
                <>
                    <div className="text-4xl">⚠️</div>
                    <h1 className="font-serif text-xl text-[#1A1A1E]">Transaction not found</h1>
                    <p className="text-sm text-[#6B6B78]">
                        We couldn&#39;t find this transaction. Contact support if you were charged.
                    </p>
                </>
            )}
        </div>
    );
}