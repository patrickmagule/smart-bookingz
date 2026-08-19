'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { signUpWithEmail } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { RoleToggle, type SignUpRole } from '@/components/auth/role-toggle';

const FEATURES = [
  'Real-time bed availability,no double bookings',
  'Secure in-app messaging with landlords',
  'Ratings and reviews from real residents',
];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const [role, setRole] = useState<SignUpRole>('student');

  return (
    <AuthShell
      heading="Find your hostel."
      subheading="Create an account to browse verified listings, message owners, and book a bed near MUBAS."
      features={FEATURES}
    >
      <h1 className="font-serif text-3xl font-semibold text-[#16233F]">Create your account</h1>
      <p className="mt-2 mb-8 text-sm text-slate-500">Tell us a bit about yourself to get started.</p>

      <form action={formAction} className="flex flex-col gap-5" noValidate>
        {/* Only Student and Hostel Owner are offered here — Admin
            accounts are never created through the public sign-up form. */}
        <RoleToggle value={role} onChange={setRole} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Chisomo"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              placeholder="Banda"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#16233F] focus:ring-2 focus:ring-[#16233F]/10"
            />
          </div>
        </div>

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

        <PasswordField label="Password" autoComplete="new-password" />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
        />

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
          {isPending ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-[#16233F] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
