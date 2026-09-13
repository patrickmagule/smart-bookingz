'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth/client';

const FEATURES = [
    'Real-time bed availability, no double bookings',
    'Secure in-app messaging with landlords',
    'Ratings and reviews from real residents',
];

export function ForgotPasswordClient({ initialEmail }: { initialEmail: string | null }) {
    const router = useRouter();
    const [email, setEmail] = useState(initialEmail ?? '');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError('Enter the email address for your account.');
            return;
        }

        setIsLoading(true);
        try {
            // Neon's managed Better Auth SDK sends password-reset OTPs through
            // this dedicated method rather than emailOtp.sendVerificationOtp
            // (that one only covers 'sign-in' / 'email-verification').
            const { error: sendError } = await authClient.forgetPassword.emailOtp({
                email: trimmedEmail,
            });

            // Enumeration-safe handling: don't surface "user not found" style
            // errors here, or this form could be used to check which emails are
            // registered. Only show an error for genuine technical failures
            // (network, rate limit) — otherwise proceed as if it succeeded.
            if (sendError) {
                const code =
                    'code' in sendError ? String((sendError as { code?: unknown }).code ?? '') : '';
                const isEnumerationRisk = code.toUpperCase().includes('NOT_FOUND');

                if (!isEnumerationRisk) {
                    setError('Something went wrong sending the reset code. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }

            router.push(`/auth/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
        } catch (err) {
            console.error('Forgot-password request failed:', err);
            setError('Something went wrong sending the reset code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            heading="Reset your password."
    subheading="We'll send a 6-digit code to your email so you can set a new password."
    features={FEATURES}
    >
    <h1 className="font-serif text-3xl font-semibold text-[#16233F]">Forgot your password?</h1>
        <p className="mt-2 mb-8 text-sm text-slate-500">
        Enter the email address on your account and we&apos;ll send you a code to reset it.
    </p>

    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
    <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
        Email address
    </label>
    <input
    id="email"
    name="email"
    type="email"
    required
    autoComplete="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
        />
        </div>

    {error && (
        <div
            role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
            {error}
            </div>
    )}

    <button
        type="submit"
    disabled={isLoading}
    className="mt-1 w-full rounded-lg bg-[#16233F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E304F] disabled:cursor-not-allowed disabled:opacity-70"
        >
        {isLoading ? 'Sending code…' : 'Send Reset Code'}
        </button>

        <p className="text-center text-sm text-slate-500">
        Remembered your password?{' '}
        <Link href="/auth/sign-in" className="font-semibold text-[#16233F] hover:underline">
        Sign in
        </Link>
        </p>
        </form>
        </AuthShell>
);
}