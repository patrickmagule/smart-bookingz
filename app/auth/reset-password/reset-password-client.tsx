'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { authClient } from '@/lib/auth/client';

const FEATURES = [
    'Real-time bed availability, no double bookings',
    'Secure in-app messaging with landlords',
    'Ratings and reviews from real residents',
];

function friendlyError(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
        const code = 'code' in err ? String((err as { code?: unknown }).code ?? '') : '';
        const message = 'message' in err ? String((err as { message?: unknown }).message ?? '') : '';

        if (code === 'TOO_MANY_ATTEMPTS' || message.toLowerCase().includes('too many')) {
            return 'Too many attempts. Please request a new code and try again.';
        }
        if (code === 'INVALID_OTP' || message.toLowerCase().includes('invalid')) {
            return 'That code is incorrect. Please check it and try again.';
        }
        if (code === 'OTP_EXPIRED' || message.toLowerCase().includes('expired')) {
            return 'This code has expired. Request a new one below.';
        }
        if (message) {
            return message;
        }
    }

    return 'Something went wrong. Please try again.';
}

type Step = 'code' | 'password' | 'done';

export function ResetPasswordClient({ initialEmail }: { initialEmail: string | null }) {
    const router = useRouter();
    const [step, setStep] = useState<Step>('code');
    const [email, setEmail] = useState(initialEmail ?? '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const resendCode = async () => {
        setError(null);
        setInfo(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError('Enter the email address for your account.');
            return;
        }

        setIsResending(true);
        try {
            const { error: sendError } = await authClient.forgetPassword.emailOtp({
                email: trimmedEmail,
            });

            // Same enumeration-safe handling as the forgot-password step: don't
            // surface "user not found" — show a generic confirmation either way.
            if (sendError) {
                const code =
                    'code' in sendError ? String((sendError as { code?: unknown }).code ?? '') : '';
                if (!code.toUpperCase().includes('NOT_FOUND')) {
                    setError('Could not resend the code. Please try again.');
                    return;
                }
            }

            setInfo('If that email is registered, a new code has been sent.');
        } catch (err) {
            console.error('Resend reset code failed:', err);
            setError('Could not resend the code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp) {
            setError('Enter your email and the 6-digit code.');
            return;
        }

        setIsVerifying(true);
        try {
            const { data, error: verifyError } = await authClient.emailOtp.checkVerificationOtp({
                email: trimmedEmail,
                otp: trimmedOtp,
                type: 'forget-password',
            });

            if (verifyError || !data?.success) {
                setError(friendlyError(verifyError ?? { code: 'INVALID_OTP' }));
                return;
            }

            setStep('password');
        } catch (err) {
            console.error('Verify reset code failed:', err);
            setError(friendlyError(err));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = (formData.get('password') as string | null) ?? '';
        const confirmPassword = (formData.get('confirmPassword') as string | null) ?? '';

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsResetting(true);
        try {
            const { error: resetError } = await authClient.emailOtp.resetPassword({
                email: email.trim(),
                otp: otp.trim(),
                password,
            });

            if (resetError) {
                setError(friendlyError(resetError));
                return;
            }

            setStep('done');
            router.push('/auth/sign-in?reset=true');
        } catch (err) {
            console.error('Reset-password failed:', err);
            setError(friendlyError(err));
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <AuthShell
            heading="Set a new password."
    subheading="Enter the code we emailed you, then choose a new password."
    features={FEATURES}
    >
    <h1 className="font-serif text-3xl font-semibold text-[#16233F]">Reset your password</h1>
    <p className="mt-2 mb-8 text-sm text-slate-500">
    {step === 'password'
        ? 'Code verified — choose a new password below.'
        : `Check your inbox for the 6-digit code${email ? ` sent to ${email}` : ''}.`}
    </p>

    {step === 'done' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            Your password has been reset. Redirecting you to sign in...
        </div>
    )}

    {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-5" noValidate>
    <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
        Email address
    </label>
    <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
        />
        </div>

        <div>
        <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
        Verification code
    </label>
    <input
        id="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
            />
            </div>

        {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
            </div>
        )}

        {info && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {info}
            </div>
        )}

        <button
            type="submit"
        disabled={isVerifying}
        className="mt-1 w-full rounded-lg bg-[#16233F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E304F] disabled:cursor-not-allowed disabled:opacity-70"
            >
            {isVerifying ? 'Verifying…' : 'Verify Code'}
            </button>

            <button
        type="button"
        onClick={resendCode}
        disabled={isResending}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-70"
            >
            {isResending ? 'Sending…' : "Didn't get a code? Resend"}
            </button>

            <p className="text-center text-sm text-slate-500">
        Remembered it after all?{' '}
        <Link href="/auth/sign-in" className="font-semibold text-[#16233F] hover:underline">
        Sign in
        </Link>
        </p>
        </form>
    )}

    {step === 'password' && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-5" noValidate>
    <PasswordField label="New password" autoComplete="new-password" />
    <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
            />

            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
        {error}
        </div>
    )}

        <button
            type="submit"
        disabled={isResetting}
        className="mt-1 w-full rounded-lg bg-[#16233F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E304F] disabled:cursor-not-allowed disabled:opacity-70"
            >
            {isResetting ? 'Resetting…' : 'Reset Password'}
            </button>

            <button
        type="button"
        onClick={() => {
        setError(null);
        setStep('code');
    }}
        className="text-center text-sm text-slate-500 hover:underline"
            >
            Use a different code
    </button>
    </form>
    )}
    </AuthShell>
);
}