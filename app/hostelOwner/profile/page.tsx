import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { ProfileView } from './profile-view';
import type { UserData, VerificationData } from './types';

export default async function ProfilePage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`
    SELECT * FROM users WHERE auth_id = ${authUser?.id} LIMIT 1
  ` as UserData[];

  const [verification] = await sql`
    SELECT status FROM owner_verifications WHERE owner_id = ${user?.id} LIMIT 1
  ` as VerificationData[];

  return (
    <ProfileView 
      user={user} 
      verification={verification || null} 
    />
  );
}
