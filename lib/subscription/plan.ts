// lib/subscriptions/plan.ts
export type SubscriptionPlan = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// TODO: adjust these — placeholders until you set real pricing
export const PLAN_CONFIG: Record<SubscriptionPlan, { amount: number; days: number; label: string }> = {
    DAILY:   { amount: 500,   days: 1,  label: 'Daily Access' },
    WEEKLY:  { amount: 2500,  days: 7,  label: 'Weekly Access' },
    MONTHLY: { amount: 8000,  days: 30, label: 'Monthly Access' },
};