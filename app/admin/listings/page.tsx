// app/admin/listings/page.tsx
import { sql } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

type PendingListing = {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    created_at: string;
    owner_id: string;
    first_name: string;
    last_name: string;
    email: string;
};

type ListingSummary = {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    status: string;
    owner_id: string;
    first_name: string;
    last_name: string;
    email: string;
};

function ViewDetailsButton({ id }: { id: string }) {
    return (
        <Link
            href={`/admin/listings/${id}`}
            className="inline-block rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
        >
            View details
        </Link>
    );
}

export default async function AdminListingsPage() {
    const pendingListings = await sql`
        SELECT h.id, h.name, h.address, h.city, h.created_at,
               u.id AS owner_id, u.first_name, u.last_name, u.email
        FROM hostels h
                 JOIN users u ON u.id = h.owner_id
        WHERE h.status = 'PENDING_APPROVAL'
        ORDER BY h.created_at ASC
    ` as PendingListing[];

    // Drafts are excluded here — the owner hasn't submitted them for
    // review yet, so there's nothing for an admin to act on.
    const allListings = await sql`
        SELECT h.id, h.name, h.address, h.city, h.status,
               u.id AS owner_id, u.first_name, u.last_name, u.email
        FROM hostels h
                 JOIN users u ON u.id = h.owner_id
        WHERE h.status != 'DRAFT'
        ORDER BY h.created_at DESC
    ` as ListingSummary[];

    return (
        <div className="p-4 lg:p-6 space-y-8 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">Hostel Listings</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Open a listing to review its details before verifying or removing it.
                </p>
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
                        {pendingListings.map((h) => (
                            <div
                                key={h.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-navy truncate">{h.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {h.address}{h.city ? `, ${h.city}` : ''}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Owner: {h.first_name} {h.last_name} · {h.email}
                                    </p>
                                </div>
                                <ViewDetailsButton id={h.id} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-navy mb-3">All listings ({allListings.length})</h2>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                    {allListings.map((h) => (
                        <div
                            key={h.id}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-navy truncate">{h.name}</p>
                                <p className="text-xs text-slate-500 truncate">
                                    {h.first_name} {h.last_name} · {h.email} · {h.address}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle(h.status)}`}>
                                    {h.status.replace('_', ' ')}
                                </span>
                                <ViewDetailsButton id={h.id} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}