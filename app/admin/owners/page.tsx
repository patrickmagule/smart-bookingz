import { sql } from '@/lib/db';
import { PendingOwnerActions, OwnerActiveToggle } from '@/components/admin/ownerRowActions';

function statusStyle(status: string) {
    switch (status) {
        case 'VERIFIED':
            return 'border-green-300 text-green-700';
        case 'PENDING':
            return 'border-amber-300 text-amber-600';
        case 'REJECTED':
            return 'border-red-300 text-red-600';
        default:
            return 'border-slate-300 text-slate-500';
    }
}

export default async function AdminOwnersPage() {
    const pendingOwners = await sql`
        SELECT ov.id AS verification_id, u.id AS owner_id, u.first_name, u.last_name, u.email, ov.submitted_at
        FROM owner_verifications ov
        JOIN users u ON u.id = ov.owner_id
        WHERE ov.status = 'PENDING'
        ORDER BY ov.submitted_at ASC
    `;

    const allOwners = await sql`
        SELECT
            u.id, u.first_name, u.last_name, u.email, u.status, u.created_at,
            (SELECT COUNT(*) FROM hostels h WHERE h.owner_id = u.id) AS hostel_count,
            (
                SELECT ov.status FROM owner_verifications ov
                WHERE ov.owner_id = u.id
                ORDER BY ov.submitted_at DESC
                LIMIT 1
            ) AS latest_verification_status
        FROM users u
        WHERE u.role = 'OWNER'
        ORDER BY u.created_at DESC
    `;

    return (
        <div className="p-4 lg:p-6 space-y-8 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">Hostel Owners</h1>
                <p className="text-sm text-slate-500 mt-0.5">Verify new owners and manage existing accounts.</p>
            </div>

            <section>
                <h2 className="text-sm font-semibold text-navy mb-3">
                    Pending verification ({pendingOwners.length})
                </h2>
                {pendingOwners.length === 0 ? (
                    <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
                        No owners waiting on verification.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                        {pendingOwners.map((o: any) => (
                            <div
                                key={o.verification_id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-navy">
                                        {o.first_name} {o.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500">{o.email}</p>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Submitted {new Date(o.submitted_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <PendingOwnerActions verificationId={o.verification_id} ownerId={o.owner_id} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-navy mb-3">All owners ({allOwners.length})</h2>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                    {allOwners.map((o: any) => {
                        const isSuspended = o.status === 'SUSPENDED' || o.status === 'DEACTIVATED';
                        return (
                            <div
                                key={o.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-navy">
                                        {o.first_name} {o.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {o.email} · {o.hostel_count} hostel{Number(o.hostel_count) !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle(o.latest_verification_status ?? '')}`}>
                                        {o.latest_verification_status ?? 'Not submitted'}
                                    </span>
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                            isSuspended ? 'border-red-300 text-red-600' : 'border-green-300 text-green-700'
                                        }`}
                                    >
                                        {o.status}
                                    </span>
                                    <OwnerActiveToggle ownerId={o.id} isSuspended={isSuspended} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
