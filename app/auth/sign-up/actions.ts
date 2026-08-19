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

  console.log('📝 Sign-up attempt:', { email, firstName, lastName, role });

  const result = await auth.signUp.email({
    email,
    password,
    name: `${firstName} ${lastName}`,
  });

  // If the auth client reported an error, handle duplicates specially.
  if (result.error) {
    // Avoid using `any` to satisfy eslint rules — narrow the error shape safely.
    const errObj = result.error as unknown;
    let code = '';
    let msg = '';

    if (errObj && typeof errObj === 'object') {
      const eo = errObj as Record<string, unknown>;
      if (typeof eo.code === 'string' || typeof eo.code === 'number') code = String(eo.code);
      if (typeof eo.message === 'string') msg = eo.message;
    }

    // Known duplicate cases: tell user to sign in or reset password
    if (String(code).includes('USER_ALREADY') || msg.toLowerCase().includes('already exists')) {
      return { error: 'That email is already registered. Please sign in or reset your password if you forgot it.' };
    }

    return { error: msg || 'Could not create your account. Please try again.' };
  }

  // If the server returned a user object, act on its verification state.
  const returnedUser = result.data?.user ?? (await auth.getSession()).data?.user;

  if (returnedUser) {
    if (returnedUser.emailVerified) {
      // Email is already verified — don't create a duplicate app user.
      return { error: 'That email is already registered. Please sign in or reset your password if you forgot it.' };
    }

    // Email exists but is not verified — proceed to provisioning (if needed)
    const authId = returnedUser.id;

    try {
      await provisionAppUser({ authId, firstName, lastName, email, role });
    } catch (err) {
      console.error('Failed to provision app user after sign-up (existing user):', err);
    }

    // Redirect to verification so the user can finish verifying their email.
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    return null;
  }

  // Resolve the new Neon Auth user id for freshly created accounts.
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

  // Redirect to the verification page with the email so the user knows
  // which inbox to check.
  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}
