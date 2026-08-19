import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { OwnerTopNav } from '@/components/owner/ownerTopnav';

export const dynamic = 'force-dynamic';

export default async function OwnerLayout({
                                            children,
                                          }: {
  children: React.ReactNode;
}) {
  const { data } = await auth.getSession();

  if (!data?.user) {
    redirect('/auth/sign-in');
  }

  // Double check role for security
  const [user] = await sql`
    SELECT role FROM users WHERE auth_id = ${data.user.id} LIMIT 1
  `;

  if (!user || user.role !== 'OWNER') {
    // Redirect students and admins to their respective areas or home
    if (user?.role === 'STUDENT') redirect('/student');
    if (user?.role === 'ADMIN') redirect('/admin');
    redirect('/');
  }

  return (
      <div className="min-h-screen bg-[#FDFCF8]">
        <OwnerTopNav user={data.user} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
  );
}