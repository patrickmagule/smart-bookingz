import { sql } from '@/lib/db';
import { DeleteUserButton } from '@/components/admin/deleteUserButton';

const ROLES = ['STUDENT', 'OWNER', 'ADMIN'] as const;

interface UserRow {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

function statusStyle(status: string) {
    switch (status) {
        case 'ACTIVE':
            return 'border-green-300 text-green-700';
        case 'PENDING':
            return 'border-amber-300 text-amber-600';
        case 'SUSPENDED':
        case 'DEACTIVATED':
            return 'border-red-300 text-red-600';
        default:
            return 'border-slate-300 text-slate-500';
    }
}

export default async function AdminUsersPage({
                                                 searchParams,
                                             }: {
    searchParams: Promise<{ role?: string; q?: string }>;
}) {
    const params = await searchParams;
    const role = params.role && (ROLES as readonly string[]).includes(params.role) ? params.role : null;
    const q = params.q?.trim() || null;

    const users = (await sql`
        SELECT id, first_name, last_name, email, role, status, created_at
        FROM users
        WHERE (${role}::text IS NULL OR role = ${role})
          AND (
            ${q}::text IS NULL
            OR email ILIKE ${q ? `%${q}%` : null}
            OR first_name ILIKE ${q ? `%${q}%` : null}
            OR last_name ILIKE ${q ? `%${q}%` : null}
          )
        ORDER BY created_at DESC
        LIMIT 200
    `) as UserRow[];

    const tabHref = (r: string | null) => {
        const sp = new URLSearchParams();
        if (r) sp.set('role', r);
        if (q) sp.set('q', q);
        const qs = sp.toString();
        return `/admin/users${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="p-4 lg:p-6 space-y-4 max-w-5xl">
            <div>
                <h1 className="font-serif text-2xl font-bold text-navy">Users</h1>
                <p className="text-sm text-slate-500 mt-0.5">{users.length} shown</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1">
                    {[null, ...ROLES].map((r) => (
                        <a
                            key={r ?? 'all'}
                            href={tabHref(r)}
                            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                                role === r
                                    ? 'border-navy bg-navy text-white'
                                    : 'border-slate-200 text-slate-600 hover:border-navy hover:text-navy'
                            }`}
                        >
                            {r ? r.charAt(0) + r.slice(1).toLowerCase() : 'All'}
                        </a>
                    ))}
                </div>
                <form action="/admin/users" method="get" className="flex gap-2">
                    {role && <input type="hidden" name="role" value={role} />}
                    <input
                        type="text"
                        name="q"
                        defaultValue={q ?? ''}
                        placeholder="Search name or email"
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-navy"
                    />
                    <button type="submit" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-navy hover:text-navy">
                        Search
                    </button>
                </form>
            </div>

            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {users.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No users match.</p>
                ) : (
                    users.map((u) => (
                        <div key={u.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-navy">
                                    {u.first_name} {u.last_name}
                                </p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    {u.role}
                                </span>
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle(u.status)}`}>
                                    {u.status}
                                </span>
                                {u.role !== 'ADMIN' && (
                                    <DeleteUserButton
                                        userId={u.id}
                                        userName={`${u.first_name} ${u.last_name}`}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}