import { auth } from '@/lib/auth/server';
import { redirect, notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { getHostelForEdit } from '@/lib/data/ownerHostelList';
import EditHostelForm from './editForm';

export const dynamic = 'force-dynamic';

export default async function EditHostelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data } = await auth.getSession();
    if (!data?.user) redirect('/auth/sign-in');

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data.user.id} LIMIT 1`;
    if (!user) redirect('/');

    const result = await getHostelForEdit(id, user.id);
    if (!result) notFound();

    return <EditHostelForm hostelId={id} initial={result} />;
}