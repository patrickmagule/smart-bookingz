// app/student/subscribe/page.tsx
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { getActiveSubscription } from '@/lib/subscription/access';
import { PLAN_CONFIG } from '@/lib/subscription/plan';
import SubscribeButton from '@/components/student/subscribeButton';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function SubscribePage() {
    const { data } = await auth.getSession();
    const [user] = await sql`
        SELECT id, first_name, last_name, email FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1
    `;
    if (!user) return <div>User not found</div>;

    const active = await getActiveSubscription(user.id);

    return (
        <div className="max-w-md space-y-6">
            <div>
                <h1 className="font-serif text-2xl text-[#1A1A1E]">Subscription</h1>
                <p className="text-sm text-[#6B6B78] mt-0.5">
                    Unlock hostel details, booking, and messaging with owners.
                </p>
            </div>

            {active ? (
                <div className="border border-green-200 bg-green-50 rounded-sm p-4">
                    <p className="text-sm font-semibold text-green-700">
                        You have an active {PLAN_CONFIG[active.plan as keyof typeof PLAN_CONFIG]?.label ?? active.plan} plan
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                        Expires {format(new Date(active.expires_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-[#6B6B78]">
                    You don&#39;t have an active subscription. Choose a plan below to unlock full access.
                </p>
            )}

            <SubscribeButton
                customer={{
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                }}
            />
        </div>
    );
}