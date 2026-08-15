'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { provisionAppUser, type AppRole } from '@/lib/auth/provision-app-user';

type SignUpState = { error: string } | null;

const FORM_ROLES = ['student', 'owner'] as const;
type FormRole = (typeof FORM_ROLES)[number];

function toAppRole(role: FormRole): AppRole {
  return role.toUpperCase() as AppRole;
}

export async function signUpWithEmail(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const firstName = (formData.get('firstName') as string | null)?.trim() ?? '';
  const lastName = (formData.get('lastName') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string | null) ?? '';
  const formRole = formData.get('role') as string | null;

  if (!email || !firstName || !lastName || !password) {
    return { error: 'Please fill in all required fields.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  // Server-side guardrail: only student/owner are ever accepted here,
  // regardless of what the UI renders — never trust client input.
  if (!FORM_ROLES.includes(formRole as FormRole)) {
    return { error: 'Select whether you are registering as a student or a hostel owner.' };
  }

  const role = toAppRole(formRole as FormRole);

  const result = await auth.signUp.email({
    email,
    password,
    name: `${firstName} ${lastName}`,
    // Optional duplicate of the role on the Neon Auth user record itself
    // (see the `additionalFields` config in lib/auth/server.ts) — handy
    // if you later put role claims in the JWT for Neon RLS. The `users`
    // table below is the actual source of truth for the app.
    role,
  });

  if (result.error) {
    return { error: result.error.message || 'Could not create your account. Please try again.' };
  }

  // Resolve the new Neon Auth user id. `result.data` is the expected
  // shape for a successful signUp.email() call; the getSession() fallback
  // covers the case where the beta SDK's response differs from that.
  // Verify this against your installed @neondatabase/auth version.
  const authId = result.data?.user?.id ?? (await auth.getSession()).data?.user?.id;

  if (!authId) {
    return {
      error:
        'Your account was created, but we could not finish setting up your profile. Please sign in to continue.',
    };
  }

  try {
    await provisionAppUser({ authId, firstName, lastName, email, role });
  } catch (err) {
    // Don't block the sign-up on this — the sign-in action retries
    // provisioning for accounts that are missing a `users` row.
    console.error('Failed to provision app user after sign-up:', err);
  }

  redirect('/dashboard');
}
