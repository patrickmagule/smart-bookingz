'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: { firstName: string; lastName: string; phone: string }) {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  if (!authUser) {
    throw new Error('Unauthorized');
  }

  const { firstName, lastName, phone } = formData;

  try {
    await sql`
      UPDATE users 
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        phone = ${phone}
      WHERE auth_id = ${authUser.id}
    `;

    revalidatePath('/hostelOwner/profile');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
