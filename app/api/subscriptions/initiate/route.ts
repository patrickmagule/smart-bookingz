// app/api/subscriptions/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { PLAN_CONFIG, type SubscriptionPlan } from '@/lib/subscription/plan';

export async function POST(req: NextRequest) {
    const { data } = await auth.getSession();
    if (!data?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let body: { plan?: SubscriptionPlan };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { plan } = body;
    const config = plan ? PLAN_CONFIG[plan] : undefined;
    if (!config) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const tx_ref = `sub_${randomUUID()}`;

    await sql`
        INSERT INTO subscriptions (student_id, plan, amount, tx_ref, status)
        VALUES (${user.id}, ${plan}, ${config.amount}, ${tx_ref}, 'PENDING')
    `;

    return NextResponse.json({ tx_ref, amount: config.amount });
}