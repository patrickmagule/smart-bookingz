'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth/client';

const FEATURES = [
  '134 verified hostel listings near MUBAS',
  'Real-time bed availability — no double bookings',
  'Secure in-app messaging with landlords',
  'Ratings and reviews from real residents',
];

export function VerifyEmailClient({
  initialEmail,
  initialToken,
}: {
  initialEmail: string | null;
  initialToken: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const friendlyError = (err: unknown, isNumericCode: boolean) => {
    if (typeof err === 'object' && err !== null) {
      const code = 'code' in err ? String((err as { code?: unknown }).code ?? '') : '';
      const message = 'message' in err ? String((err as { message?: unknown }).message ?? '') : '';

      if (code === 'OTP_EXPIRED' || message.toLowerCase().includes('otp expired')) {
        return 'This verification code has expired. Please request a new one and try again.';
      }

      if (code === 'TOKEN_EXPIRED' || message.toLowerCase().includes('token expired')) {
        return 'This verification link has expired. Please request a new one and try again.';
      }

      if (message) {
        return message;
      }
    }

    return isNumericCode
      ? 'Invalid or expired verification code. Please try again.'
      : 'Invalid or expired verification token. Please try again.';
  };

  const resendCode = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError('Enter the email address to resend the code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'email-verification' });
      if (res.error) {
        setError(friendlyError(res.error, true));
        return;
      }

      setInfo('A new verification code has been sent to your email.');
    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyValue = async (rawValue: string) => {
    const normalizedValue = rawValue.trim();

    if (!normalizedValue) {
      setError('Please enter the verification code or token.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const isNumericCode = /^\d{6}$/.test(normalizedValue);
    if (isNumericCode && !email.trim()) {
      setError('Enter the email address that received the code.');
      setIsLoading(false);
      return;
    }

    try {
      const response = isNumericCode
        ? await authClient.emailOtp.verifyEmail({
            email: email.trim(),
            otp: normalizedValue,
          })
        : await authClient.verifyEmail({
            query: { token: normalizedValue },
          });

      if (response.error) {
        setError(friendlyError(response.error, isNumericCode));
        return;
      }

      setIsVerified(true);
      router.push('/auth/sign-in?verified=true');
    } catch (err) {
      setError(friendlyError(err, isNumericCode));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyValue(code);
  };

  useEffect(() => {
    if (initialToken) {
      const timeoutId = window.setTimeout(() => {
        void verifyValue(initialToken);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  return (
    <AuthShell
      heading="Verify your email."
      subheading="We sent a verification email to your address. Enter the 6-digit code, or paste the token from the link if you opened it elsewhere."
      features={FEATURES}
    >
      <h1 className="font-serif text-3xl font-semibold text-[#16233F]">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-500">
        Check your inbox for the verification email{email ? ` sent to ${email}` : ''}.
      </p>

      {isVerified ? (
        <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          Your email has been verified. Redirecting you to sign in...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="text"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10 text-sm"
            />
          </div>

          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification code or token
            </label>
            <input
              id="code"
              type="text"
              autoComplete="one-time-code"
              placeholder="Enter the 6-digit code or paste the token"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10 text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              If you received a 6-digit code, enter it here. If your email has a verification link instead, open the link or paste its token here.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {info && (
            <div
              role="status"
              className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700"
            >
              {info}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 mt-1 rounded-lg bg-[#16233F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E304F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Verifying…' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={resendCode}
              disabled={isLoading}
              className="mt-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-70"
            >
              Resend code
            </button>
          </div>

          {info && (
            <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
              {info}
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-3">
            Already verified?{' '}
            <Link href="/auth/sign-in" className="font-semibold text-[#16233F] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
