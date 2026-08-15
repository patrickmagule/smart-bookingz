'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { provisionAppUser, type AppRole } from '@/lib/auth/provision-app-user';

type SignInState = { error: string } | null;

export async function signInWithEmail(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const result = await auth.signIn.email({ email, password });

  if (result.error) {
    // Deliberately generic — don't reveal whether the email exists.
    return { error: 'Incorrect email or password.' };
  }

  const authUser = result.data?.user ?? (await auth.getSession()).data?.user;

  // Safety net: if the `users` row from sign-up provisioning never
  // landed (e.g. a dropped request), finish it here rather than leaving
  // the account permanently stuck. This should be rare — if you see it
  // firing often, it's worth logging/alerting rather than silently
  // patching it on every login.
  if (authUser?.id) {
    const existing = await sql`
      SELECT id FROM users WHERE auth_id = ${authUser.id} LIMIT 1
    `;

    if (existing.length === 0) {
      const [firstName, ...rest] = (authUser.name ?? '').trim().split(' ');

      await provisionAppUser({
        authId: authUser.id,
        firstName: firstName || 'Unknown',
        lastName: rest.join(' '),
        email: authUser.email ?? email,
        // Falls back to STUDENT if the role wasn't readable off the
        // Neon Auth user record — flag these for manual review rather
        // than trusting the default in a real rollout.
        role: ((authUser as { role?: string }).role as AppRole) ?? 'STUDENT',
      }).catch((err) => {
        console.error('Provisioning retry failed for', authUser.id, err);
      });
    }
  }

  // No role is selected on this form on purpose: the account's role
  // lives in the `users` table, not in anything the client sends.
  // Route by role from a server component that reads it after redirect,
  // e.g.:
  //   const [row] = await sql`SELECT role FROM users WHERE auth_id = ${authUser.id}`;
  //   redirect(row.role === 'OWNER' ? '/owner' : '/dashboard');
  redirect('/dashboard');
}
