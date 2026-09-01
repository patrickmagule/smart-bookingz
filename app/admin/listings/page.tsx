import { sql } from '@/lib/db';
import { PendingListingActions, RemoveListingButton } from '@/components/admin/listingRowActions';

function statusStyle(status: string) {
    switch (status) {
        case 'PUBLISHED':
            return 'border-green-300 text-green-700';
        case 'PENDING_APPROVAL':
            return 'border-amber-300 text-amber-600';
        case 'REJECTED':
        case 'SUSPENDED':
            return 'border-red-300 text-red-600';
        default:
            return 'border-slate-300 text-slate-500';
    }
}

export default async function AdminListingsPage() {
    const pendingListings = await sql`
        SELECT h.id, h.name, h.address, h.city, h.created_at,
               u.id AS owner_id, u.first_name, u.last_name, u.email
        FROM hostels h
        JOIN users u ON u.id = h.owner_id
        WHERE h.status = 'PENDING_APPROVAL'
        ORDER BY h.created_at ASC
    `;

    const allListings = await sql`
        SELECT h.id, h.name, h.address, h.city, h.status,
               u.id AS owner_id, u.first_name, u.last_name
        FROM hostels h
        JOIN users u ON u.id = h.owner_id
        ORDER BY h.created_at DESC
    `;

    return (
        <div className="p-4 lg:p-6 space-y-8 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">Hostel Listings</h1>
                <p className="text-sm text-slate-500 mt-0.5">Verify new listings and remove ones that break policy.</p>
            </div>

            <section>
                <h2 className="text-sm font-semibold text-navy mb-3">
                    Pending verification ({pendingListings.length})
                </h2>
                {pendingListings.length === 0 ? (
                    <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
                        No listings waiting on verification.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                        {pendingListings.map((h: any) => (
                            <div
                                key={h.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-navy">{h.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {h.address}{h.city ? `, ${h.city}` : ''}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Owner: {h.first_name} {h.last_name} · {h.email}
                                    </p>
                                </div>
                                <PendingListingActions hostelId={h.id} ownerId={h.owner_id} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-navy mb-3">All listings ({allListings.length})</h2>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                    {allListings.map((h: any) => (
                        <div
                            key={h.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="text-sm font-medium text-navy">{h.name}</p>
                                <p className="text-xs text-slate-500">
                                    {h.first_name} {h.last_name} · {h.address}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle(h.status)}`}>
                                    {h.status.replace('_', ' ')}
                                </span>
                                <RemoveListingButton hostelId={h.id} ownerId={h.owner_id} hostelName={h.name} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
