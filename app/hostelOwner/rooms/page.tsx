import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { getOwnerHostelTabs, getOwnerRooms } from '@/lib/data/ownerHostelList';
import RoomsBedsClient from './roomBeds';

export const dynamic = 'force-dynamic';

export default async function RoomsBedsPage() {
    const { data } = await auth.getSession();
    const authUser = data?.user;

    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
    const userId = user?.id;

    if (!userId) return <div>User not found</div>;

    const [hostels, rooms] = await Promise.all([
        getOwnerHostelTabs(userId),
        getOwnerRooms(userId),
    ]);

    return <RoomsBedsClient hostels={hostels} rooms={rooms} />;
}