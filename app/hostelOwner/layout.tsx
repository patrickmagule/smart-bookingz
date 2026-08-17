import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { OwnerSidebar } from '@/components/owner/sidebar';
import { OwnerHeader } from '@/components/owner/header';

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
    <div className="flex min-h-screen overflow-x-hidden bg-[#FDFCF8] lg:gap-6 lg:p-6">
      <OwnerSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <OwnerHeader user={data.user} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-0">
          <div className="mx-auto max-w-7xl lg:py-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
