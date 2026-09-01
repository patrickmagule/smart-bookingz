// app/admin/listings/[id]/page.tsx
import { sql } from '@/lib/db';
import { PendingListingActions, RemoveListingButton } from '@/components/admin/listingRowActions';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PUBLISHED: 'border-green-300 text-green-700',
        PENDING_APPROVAL: 'border-amber-300 text-amber-600',
        REJECTED: 'border-red-300 text-red-600',
        SUSPENDED: 'border-red-300 text-red-600',
    };
    return (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[status] ?? 'border-slate-300 text-slate-500'}`}>
      {status.replace('_', ' ')}
    </span>
    );
}

type HostelImage = {
    id: string;
    image_url: string;
};

type HostelRoom = {
    id: string;
    room_number: number;
    description: string | null;
    price_per_month: number;
    total_spaces: number;
    occupied_spaces: number;
};

export default async function AdminListingDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [hostel] = await sql`
        SELECT h.*,
               u.id       AS owner_id,
               u.first_name,
               u.last_name,
               u.email
        FROM hostels h
                 JOIN users u ON u.id = h.owner_id
        WHERE h.id = ${id}
            LIMIT 1
    `;

    if (!hostel) return notFound();

    const rooms = await sql`
        SELECT r.*,
               (SELECT COUNT(*) FROM room_spaces WHERE room_id = r.id) as total_spaces,
               (SELECT COUNT(*) FROM room_spaces rs
                                         JOIN bookings b ON rs.id = b.space_id
                WHERE rs.room_id = r.id AND b.status = 'CONFIRMED') as occupied_spaces
        FROM rooms r
        WHERE r.hostel_id = ${id}
        ORDER BY r.room_number
    ` as HostelRoom[];

    const images = await sql`
        SELECT id, image_url FROM hostel_images WHERE hostel_id = ${id} ORDER BY display_order
    ` as HostelImage[];

    return (
        <div className="max-w-4xl p-4 sm:p-6 space-y-6">
            <Link href="/admin/listings" className="text-xs text-slate-600 hover:underline">← Back to listings</Link>

            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1E]">{hostel.name}</h1>
                    <StatusBadge status={hostel.status} />
                </div>
                <p className="text-sm text-[#6B6B78]">
                    {[hostel.address, hostel.area, hostel.city].filter(Boolean).join(', ')}
                </p>
                <p className="text-xs text-[#6B6B78]">
                    Owner: {hostel.first_name} {hostel.last_name} · {hostel.email}
                </p>
            </div>

            {/* Actions (mobile first) — status-aware:
          PENDING_APPROVAL -> verify/reject, PUBLISHED -> remove for policy
          violations. REJECTED/SUSPENDED/DRAFT have no further action here. */}
            <div className="flex flex-wrap gap-2">
                {hostel.status === 'PENDING_APPROVAL' ? (
                    <PendingListingActions hostelId={hostel.id} ownerId={hostel.owner_id} />
                ) : hostel.status === 'PUBLISHED' ? (
                    <RemoveListingButton hostelId={hostel.id} ownerId={hostel.owner_id} hostelName={hostel.name} />
                ) : (
                    <p className="text-xs text-[#6B6B78]">No actions available — this listing is {hostel.status.replace('_', ' ').toLowerCase()}.</p>
                )}
            </div>

            {/* Photos */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-[#1A1A1E]">Photos</h2>
                {images.length === 0 ? (
                    <p className="text-sm text-[#6B6B78]">No photos uploaded.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {images.map((img) => (
                            <div key={img.id} className="relative aspect-square bg-slate-100 overflow-hidden">
                                <Image src={img.image_url} alt="Hostel photo" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Details */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-[#1A1A1E]">Details</h2>
                <div className="text-sm text-[#1A1A1E] space-y-1">
                    {hostel.description && (<p className="text-[#6B6B78]">{hostel.description}</p>)}
                    <p className="text-[#6B6B78]">Created: {new Date(hostel.created_at).toLocaleString()}</p>
                </div>
            </section>

            {/* Rooms */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-[#1A1A1E]">Rooms ({rooms.length})</h2>
                {rooms.length === 0 ? (
                    <p className="text-sm text-[#6B6B78]">No rooms added.</p>
                ) : (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-sm">
                        {rooms.map((room) => (
                            <div key={room.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1E]">Room {room.room_number}</p>
                                    <p className="text-xs text-[#6B6B78]">{room.description || 'No description'}</p>
                                </div>
                                <div className="text-xs text-[#6B6B78] flex gap-3">
                                    <span>MK {Number(room.price_per_month).toLocaleString()}/month</span>
                                    <span>{Number(room.total_spaces) - Number(room.occupied_spaces)} beds available</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}