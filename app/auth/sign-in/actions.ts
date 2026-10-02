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
    // Narrow type safely to satisfy ESLint @typescript-eslint/no-explicit-any rule
    const errObj = result.error as unknown;
    let code = '';
    let msg = '';

    if (errObj && typeof errObj === 'object') {
      const eo = errObj as Record<string, unknown>;
      if (typeof eo.code === 'string' || typeof eo.code === 'number') code = String(eo.code);
      if (typeof eo.message === 'string') msg = eo.message;
    }

    console.error('SIGN-IN ERROR:', { message: msg, code, error: result.error });

    return {
      error: msg || 'Authentication failed.',
    };
  }

  const authUser = result.data?.user ?? (await auth.getSession()).data?.user;

  // Safety net: retry provisioning if the user row is missing in PostgreSQL
  if (authUser?.id) {
    const existing = await sql`
      SELECT id FROM users WHERE auth_id = ${authUser.id} LIMIT 1
    `;

    if (existing.length === 0) {
      const [firstName, ...rest] = (authUser.name ?? '').trim().split(' ');

      // Safely extract and normalize raw role string to ENUM format
      const rawRole = String((authUser as { role?: unknown }).role ?? '').toUpperCase();

      let role: AppRole = 'STUDENT';
      if (rawRole === 'OWNER') role = 'OWNER';
      if (rawRole === 'ADMIN') role = 'ADMIN';

      await provisionAppUser({
        authId: authUser.id,
        firstName: firstName || 'Unknown',
        lastName: rest.join(' '),
        email: authUser.email ?? email,
        role,
      }).catch((err) => {
        console.error('Provisioning retry failed for', authUser.id, err);
      });
    }
  }

  // Handle post-login redirection based on role status
  if (authUser?.id) {
    const [row] = await sql`SELECT id, role FROM users WHERE auth_id = ${authUser.id} LIMIT 1`;
    if (row) {
      if (row.role === 'OWNER') {
        const [verification] = await sql`
          SELECT status FROM owner_verifications 
          WHERE owner_id = ${row.id} 
          ORDER BY submitted_at DESC 
          LIMIT 1
        `;

        if (verification?.status !== 'VERIFIED') {
          return {
            error: "You can't access the system. Not verified by an admin. Wait until verified or call customer support.",
          };
        }
        redirect('/hostelOwner');
      } else if (row.role === 'ADMIN') {
        redirect('/admin');
      } else {
        redirect('/student');
      }
    } else {
      // User authenticated but not found in database — treat as STUDENT (default role)
      redirect('/student');
    }
  }

  redirect('/');
}