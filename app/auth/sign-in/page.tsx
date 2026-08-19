'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signInWithEmail } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';

const FEATURES = [
  'Real-time bed availability, no double bookings',
  'Secure in-app messaging with landlords',
  'Ratings and reviews from real residents',
];

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <AuthShell
      heading="Welcome back."
      subheading="Sign in to access your account, view bookings, and communicate with hostel owners."
      features={FEATURES}
    >
      <h1 className="font-serif text-3xl font-semibold text-[#16233F]">Sign in to your account</h1>
      <p className="mt-2 mb-8 text-sm text-slate-500">Enter your credentials below.</p>

      <form action={formAction} className="flex flex-col gap-5" noValidate>
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
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
          />
        </div>

        <PasswordField autoComplete="current-password" />

        {state?.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full rounded-lg bg-[#16233F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E304F] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Signing in…' : 'Sign In'}
        </button>

        <div className="flex flex-col items-center gap-3 text-sm">
          <Link href="/auth/forgot-password" className="text-[#16233F] hover:underline">
            Forgot your password?
          </Link>
          <p className="text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-semibold text-[#16233F] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
