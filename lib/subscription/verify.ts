// lib/subscriptions/verify.ts
import { sql } from '@/lib/db';
import { PLAN_CONFIG, type SubscriptionPlan } from '@/lib/subscription/plan';

export interface VerifyResult {
    status: 'ACTIVE' | 'FAILED' | 'PENDING' | 'NOT_FOUND';
    plan?: SubscriptionPlan;
    expiresAt?: string;
}

// Shared by the webhook route and the subscribe/status return page — both
// need to ask "did this tx_ref actually succeed?" and activate if so.
export async function verifyAndActivateSubscription(txRef: string): Promise<VerifyResult> {
    const [sub] = await sql`
        SELECT plan, amount, status, expires_at FROM subscriptions WHERE tx_ref = ${txRef}
    `;
    if (!sub) return { status: 'NOT_FOUND' };

    // Already activated (e.g. the webhook beat us to it) — nothing to redo.
    if (sub.status === 'ACTIVE') {
        return { status: 'ACTIVE', plan: sub.plan, expiresAt: sub.expires_at };
    }

    const verifyRes = await fetch(`https://api.paychangu.com/verify-payment/${txRef}`, {
        headers: { Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}` },
        cache: 'no-store',
    });
    const verified = await verifyRes.json();

    const transactionStatus: string | undefined = verified?.data?.status;
    const amountMatches =
        verified?.data?.amount != null && Number(verified.data.amount) === Number(sub.amount);

    if (transactionStatus === 'success' && amountMatches) {
        const days = PLAN_CONFIG[sub.plan as SubscriptionPlan].days;
        const [updated] = await sql`
            UPDATE subscriptions
            SET status = 'ACTIVE', starts_at = now(), expires_at = now() + (${days} * interval '1 day')
            WHERE tx_ref = ${txRef}
            RETURNING plan, expires_at
        `;
        return { status: 'ACTIVE', plan: updated.plan, expiresAt: updated.expires_at };
    }

    if (transactionStatus === 'failed' || transactionStatus === 'cancelled') {
        await sql`UPDATE subscriptions SET status = 'FAILED' WHERE tx_ref = ${txRef}`;
        return { status: 'FAILED' };
    }

    // Not confirmed yet — PayChangu may still be processing.
    return { status: 'PENDING' };
}