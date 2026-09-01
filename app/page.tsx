import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import LandingPage from './landiPage';
import { getFeaturedHostels, getPlatformStats } from '@/lib/data/publicHostelList';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  // Logged-in visitors never see the marketing page — bounce them straight
  // to their dashboard based on role.
  if (authUser) {
    const [user] = await sql`SELECT role FROM users WHERE auth_id = ${authUser.id} LIMIT 1`;

    if (user?.role === 'OWNER') redirect('/hostelOwner');
    if (user?.role === 'ADMIN') redirect('/admin');
    if (user?.role === 'STUDENT') redirect('/student');
    // If the session exists but the users row / role is missing (edge case,
    // e.g. a broken signup), fall through and just show the guest landing
    // page rather than crashing.
  }

  const [featured, stats] = await Promise.all([
    getFeaturedHostels(3),
    getPlatformStats(),
  ]);

  return <LandingPage featured={featured} stats={stats} />;
}