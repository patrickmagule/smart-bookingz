import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import LandingPage from './landingPage';
import { getFeaturedHostels, getPlatformStats } from '@/lib/data/publicHostelList';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Safe to use now that middleware handles the cookie caching
  const { data } = await auth.getSession();
  const authUser = data?.user;

  if (authUser) {
    const [user] = await sql`SELECT role FROM users WHERE auth_id = ${authUser.id} LIMIT 1`;

    if (user?.role === 'OWNER') redirect('/hostelOwner');
    if (user?.role === 'ADMIN') redirect('/admin');
    if (user?.role === 'STUDENT') redirect('/student');
  }

  const [featured, stats] = await Promise.all([
    getFeaturedHostels(3),
    getPlatformStats(),
  ]);

  return <LandingPage featured={featured} stats={stats} />;
}