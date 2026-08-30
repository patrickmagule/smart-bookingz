import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AddListingForm from './addListingForm';

export const dynamic = 'force-dynamic';

export default async function NewHostelListingPage() {
  const { data } = await auth.getSession();
  if (!data?.user) redirect('/auth/sign-in');

  const [user] = await sql`
        SELECT id, role FROM users WHERE auth_id = ${data.user.id} LIMIT 1
    `;

  if (!user || user.role !== 'OWNER') {
    if (user?.role === 'STUDENT') redirect('/student');
    if (user?.role === 'ADMIN') redirect('/admin');
    redirect('/');
  }

  return <AddListingForm />;
}