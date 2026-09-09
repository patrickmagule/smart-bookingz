// components/student/SubscribeButton.tsx
'use client';
import { useState } from 'react';
import { PLAN_CONFIG, type SubscriptionPlan } from '@/lib/subscription/plan';

interface PaychanguCheckoutOptions {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    callback_url: string;
    return_url: string;
    customer: {
        email: string;
        first_name: string;
        last_name: string;
    };
    customization: {
        title: string;
        description: string;
    };
    meta?: Record<string, unknown>;
}

declare global {
    interface Window {
        PaychanguCheckout: (options: PaychanguCheckoutOptions) => void;
    }
}

interface SubscribeButtonProps {
    customer: { email: string; firstName: string; lastName: string };
}

export default function SubscribeButton({ customer }: SubscribeButtonProps) {
    const [selected, setSelected] = useState<SubscriptionPlan>('WEEKLY');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubscribe() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/subscriptions/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selected }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? 'Could not start checkout. Please try again.');
            }

            const { tx_ref, amount } = await res.json();
            if (!tx_ref) {
                throw new Error('Could not start checkout. Please try again.');
            }

            window.PaychanguCheckout({
                public_key: process.env.NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY!,
                tx_ref,
                amount,
                currency: 'MWK',
                callback_url: `${window.location.origin}/api/subscriptions/callback`,
                return_url: `${window.location.origin}/student/subscribe/status?tx_ref=${tx_ref}`,
                customer: {
                    email: customer.email,
                    first_name: customer.firstName,
                    last_name: customer.lastName,
                },
                customization: {
                    title: `HostelFind ${PLAN_CONFIG[selected].label}`,
                    description: 'Unlock hostel details, bookings, and messaging',
                },
                meta: { type: 'subscription', plan: selected },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border border-[#E0D9CF] rounded-sm p-5 bg-white">
            <h3 className="text-sm font-semibold text-[#1A1A1E] mb-3">Choose a plan</h3>
            <div className="space-y-2 mb-4">
                {(Object.keys(PLAN_CONFIG) as SubscriptionPlan[]).map((plan) => (
                    <button
                        key={plan}
                        onClick={() => setSelected(plan)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm border text-sm transition-colors ${
                            selected === plan ? 'border-[#1E3A5F] bg-[#EEE9E0]' : 'border-[#E0D9CF] hover:bg-[#F9F8F6]'
                        }`}
                    >
                        <span className="font-medium text-[#1A1A1E]">{PLAN_CONFIG[plan].label}</span>
                        <span className="text-[#1E3A5F] font-semibold">K{PLAN_CONFIG[plan].amount.toLocaleString()}</span>
                    </button>
                ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-[#1E3A5F] text-white py-2.5 text-sm font-medium rounded-sm hover:bg-[#162d4a] disabled:opacity-50"
            >
                {loading ? 'Loading…' : `Subscribe — K${PLAN_CONFIG[selected].amount.toLocaleString()}`}
            </button>

            {/* Required by PayChangu's popup.js — it injects the checkout iframe into this node */}
            <div id="wrapper"></div>
        </div>
    );
}