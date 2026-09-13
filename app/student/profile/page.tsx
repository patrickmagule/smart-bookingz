import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { StudentProfileView } from './student-profile-view';
import type { UserData, StudentProfileData, UniversityOption } from './types';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = (await sql`
    SELECT * FROM users WHERE auth_id = ${authUser?.id} LIMIT 1
  `) as UserData[];

  const [profile] = (await sql`
    SELECT sp.*, u.name AS university_name
    FROM student_profiles sp
    LEFT JOIN universities u ON u.id = sp.university_id
    WHERE sp.user_id = ${user?.id}
    LIMIT 1
  `) as StudentProfileData[];

  const universities = (await sql`
    SELECT id, name FROM universities ORDER BY name
  `) as UniversityOption[];

  return <StudentProfileView user={user} profile={profile || null} universities={universities} />;
}
