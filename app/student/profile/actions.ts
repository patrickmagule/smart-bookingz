'use server';

import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

type UpdateStudentProfileInput = {
  firstName: string;
  lastName: string;
  phone: string;
  studentNumber: string;
  universityId: string | null;
  program: string;
  yearOfStudy: number | null;
  gender: string;
};

export async function updateStudentProfile(formData: UpdateStudentProfileInput) {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  if (!authUser) {
    throw new Error('Unauthorized');
  }

  const { firstName, lastName, phone, studentNumber, universityId, program, yearOfStudy, gender } =
    formData;

  try {
    const [row] = await sql`SELECT id FROM users WHERE auth_id = ${authUser.id} LIMIT 1`;

    if (!row) {
      return { success: false, error: 'User not found.' };
    }

    const userId = row.id as string;

    // users + student_profiles together, same pattern as provisionAppUser's
    // multi-table insert — student_profiles is upserted since a row should
    // already exist from sign-up, but this stays safe if it doesn't.
    await sql.transaction([
      sql`
        UPDATE users 
        SET 
          first_name = ${firstName},
          last_name = ${lastName},
          phone = ${phone}
        WHERE id = ${userId}
      `,
      sql`
        INSERT INTO student_profiles (user_id, student_number, university_id, program, year_of_study, gender)
        VALUES (${userId}, ${studentNumber || null}, ${universityId || null}, ${program || null}, ${yearOfStudy}, ${gender || null})
        ON CONFLICT (user_id) DO UPDATE SET
          student_number = EXCLUDED.student_number,
          university_id = EXCLUDED.university_id,
          program = EXCLUDED.program,
          year_of_study = EXCLUDED.year_of_study,
          gender = EXCLUDED.gender
      `,
    ]);

    revalidatePath('/student/profile');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
