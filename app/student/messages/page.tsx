// app/student/messages/page.tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { getStudentConversations } from '@/lib/data/studentMessage';

export const dynamic = 'force-dynamic';

export default async function StudentMessagesPage() {
    const { data } = await auth.getSession();
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    if (!user) return <div>User not found</div>;

    const conversations = await getStudentConversations(user.id);

    return (
        <div className="max-w-2xl space-y-4">
            <div>
                <h1 className="font-serif text-2xl text-[#1A1A1E]">Messages</h1>
                <p className="text-sm text-[#6B6B78] mt-0.5">Conversations with hostel owners</p>
            </div>

            {conversations.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#6B6B78]">
                    No conversations yet. Message an owner from a hostel&#39;s detail page to get started.
                </div>
            ) : (
                <div className="divide-y divide-[#E0D9CF] border border-[#E0D9CF] rounded-sm bg-white">
                    {conversations.map((c) => (
                        <Link
                            key={c.id}
                            href={`/student/messages/${c.id}`}
                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#F9F8F6] transition-colors"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-[#1A1A1E] truncate">
                                        {c.owner_first_name} {c.owner_last_name}
                                    </p>
                                    {c.unread_count > 0 && (
                                        <span className="bg-[#1E3A5F] text-white text-[10px] font-medium rounded-full px-1.5 py-0.5">
                                            {c.unread_count}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[#6B6B78] truncate">{c.hostel_name}</p>
                                {c.last_message && (
                                    <p className="text-xs text-[#6B6B78] truncate mt-0.5">{c.last_message}</p>
                                )}
                            </div>
                            {c.last_message_at && (
                                <span className="text-[10px] text-[#6B6B78] shrink-0">
                                    {format(new Date(c.last_message_at), 'MMM d')}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}