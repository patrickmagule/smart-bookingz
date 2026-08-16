'use server';

import { redirect } from 'next/navigation';

type VerifyEmailState = { error: string } | null;

export async function verifyEmail(
  _prevState: VerifyEmailState,
  formData: FormData
): Promise<VerifyEmailState> {
  const token = (formData.get('token') as string | null)?.trim() ?? '';

  if (!token) {
    return { error: 'Please enter the verification token.' };
  }

  try {
    const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        error: 'Invalid or expired verification token. Please check and try again.',
      };
    }

    redirect('/auth/sign-in?verified=true');
  } catch (err) {
    console.error('Verification error:', err);
    return { error: 'Failed to verify email. Please try again.' };
  }
}
