// lib/subscriptions/access.ts
import { sql } from '@/lib/db';

export interface ActiveSubscription {
    id: string;
    plan: string;
    expires_at: string;
}

export async function getActiveSubscription(studentId: string): Promise<ActiveSubscription | null> {
    const [row] = await sql`
        SELECT id, plan, expires_at
        FROM subscriptions
        WHERE student_id = ${studentId}
          AND status = 'ACTIVE'
          AND expires_at > now()
        ORDER BY expires_at DESC
        LIMIT 1
    `;
    return (row as unknown as ActiveSubscription) ?? null;
}

export async function hasActiveSubscription(studentId: string): Promise<boolean> {
    return (await getActiveSubscription(studentId)) !== null;
}

// Throw-based guard for server actions (booking creation, sending a message)
export async function requireActiveSubscription(studentId: string): Promise<void> {
    const active = await hasActiveSubscription(studentId);
    if (!active) {
        throw new Error('SUBSCRIPTION_REQUIRED');
    }
}