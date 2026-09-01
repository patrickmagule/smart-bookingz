'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGauge,
    faUserCheck,
    faBuilding,
    faUsers,
    faCalendarCheck,
    faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { signOutAction } from '@/app/auth/actions';

const NAV = [
    { name: 'Dashboard', href: '/admin', icon: faGauge },
    { name: 'Owners', href: '/admin/owners', icon: faUserCheck },
    { name: 'Listings', href: '/admin/listings', icon: faBuilding },
    { name: 'Users', href: '/admin/users', icon: faUsers },
    { name: 'Bookings', href: '/admin/bookings', icon: faCalendarCheck },
];

interface AdminShellProps {
    user?: { name?: string | null; email?: string | null };
    pendingOwners?: number;
    pendingListings?: number;
    children: React.ReactNode;
}

export function AdminShell({ user, pendingOwners = 0, pendingListings = 0, children }: AdminShellProps) {
    const pathname = usePathname();

    const badgeFor = (href: string) => {
        if (href === '/admin/owners') return pendingOwners;
        if (href === '/admin/listings') return pendingListings;
        return 0;
    };

    const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'A';

    const currentLabel = NAV.find((n) => isActive(n.href))?.name ?? 'Admin';

    return (
        <div className="min-h-screen bg-white">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <div className="flex h-14 items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="hidden lg:block h-7 w-7 shrink-0 rounded-md bg-navy" />
                        <span className="font-serif text-base font-semibold text-navy truncate hidden lg:block">
                            HostelFind Admin
                        </span>
                        <span className="font-serif text-base font-semibold text-navy truncate lg:hidden">
                            {currentLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex flex-col items-end leading-none">
                            <span className="text-xs font-medium text-navy">{user?.name || 'Admin'}</span>
                            <span className="text-[10px] text-slate-400">{user?.email}</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-xs font-medium text-navy">
                            {initials}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-slate-200 sticky top-14 h-[calc(100vh-56px)]">
                    <nav className="flex-1 py-3">
                        {NAV.map((item) => {
                            const active = isActive(item.href);
                            const badge = badgeFor(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors',
                                        active
                                            ? 'border-navy bg-slate-50 font-medium text-navy'
                                            : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-navy'
                                    )}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                                    <span className="flex-1">{item.name}</span>
                                    {badge > 0 && (
                                        <span className="rounded-full bg-navy px-1.5 py-0.5 text-[10px] font-medium text-white">
                                            {badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <form action={signOutAction}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-navy"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0 pb-16 lg:pb-0">{children}</main>
            </div>

            {/* Mobile bottom tab bar */}
            <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white">
                {NAV.map((item) => {
                    const active = isActive(item.href);
                    const badge = badgeFor(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px]',
                                active ? 'text-navy' : 'text-slate-400'
                            )}
                        >
                            <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                            {item.name}
                            {badge > 0 && (
                                <span className="absolute top-1 right-[22%] h-1.5 w-1.5 rounded-full bg-red-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
