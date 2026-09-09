// app/api/subscriptions/webhook/route.ts
import { sql } from '@/lib/db';
import { PLAN_CONFIG, type SubscriptionPlan } from '@/lib/subscription/plan';
import crypto from 'crypto';

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paychangu-signature'); // confirm exact header in PayChangu's webhook docs

    const expected = crypto
        .createHmac('sha256', process.env.PAYCHANGU_SECRET_KEY!)
        .update(rawBody)
        .digest('hex');

    // Constant-time comparison to avoid timing attacks on the HMAC check
    const signatureBuf = Buffer.from(signature ?? '', 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureValid =
        signatureBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(signatureBuf, expectedBuf);

    if (!signatureValid) {
        return new Response('Invalid signature', { status: 401 });
    }

    const { tx_ref } = JSON.parse(rawBody);

    // Always re-verify server-side — never trust the webhook body's status directly
    const verifyRes = await fetch(`https://api.paychangu.com/verify-payment/${tx_ref}`, {
        headers: { Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}` },
    });
    const verified = await verifyRes.json();

    // IMPORTANT: `verified.status` is the *API call's* status (almost always "success"
    // as long as the request itself worked) — NOT the transaction's outcome.
    // The actual payment status lives at `verified.data.status`.
    const transactionStatus: string | undefined = verified?.data?.status;

    const [sub] = await sql`SELECT plan, amount FROM subscriptions WHERE tx_ref = ${tx_ref}`;
    if (!sub) return new Response('Unknown tx_ref', { status: 404 });

    // Sanity-check the confirmed amount matches what we charged for this plan,
    // so a tampered client-side amount can't be used to activate a cheaper plan.
    const amountMatches =
        verified?.data?.amount != null && Number(verified.data.amount) === Number(sub.amount);

    if (transactionStatus === 'success' && amountMatches) {
        const days = PLAN_CONFIG[sub.plan as SubscriptionPlan].days;
        await sql`
            UPDATE subscriptions
            SET status = 'ACTIVE',
                starts_at = now(),
                expires_at = now() + (${days} * interval '1 day')
            WHERE tx_ref = ${tx_ref}
        `;
    } else {
        await sql`UPDATE subscriptions SET status = 'FAILED' WHERE tx_ref = ${tx_ref}`;
    }

    return new Response('OK', { status: 200 });
}