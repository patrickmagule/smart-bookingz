import { sql } from '@/lib/db';
import LandingPage from './landingPage';
import { getFeaturedHostels, getPlatformStats } from '@/lib/data/publicHostelList';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const [featured, stats] = await Promise.all([
    getFeaturedHostels(3),
    getPlatformStats(),
  ]);

  return <LandingPage featured={featured} stats={stats} />;
}