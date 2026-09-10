'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGauge,
    faUserCheck,
    faBuilding,
    faUsers,
    faCalendarCheck,
    faRightFromBracket,
    faBars,
    faXmark,
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Top bar */}
            <header className="sticky top-0 z-50 bg-[#1E3A5F] border-b border-[#2a4d7a]">
                <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
                    {/* Mobile sidebar toggle */}
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/80 hover:text-white p-1">
                        <FontAwesomeIcon icon={faBars} className="h-[18px] w-[18px]" />
                    </button>

                    {/* Logo */}
                    <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 bg-[#C49A2A] flex items-center justify-center rounded-sm">
                            <FontAwesomeIcon icon={faBuilding} className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-serif text-xl text-white tracking-tight">HostelFind</span>
                    </Link>
                    
                    <div className="w-px h-6 bg-white/15 mx-1 hidden sm:block" />

                    {/* Page title */}
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-white leading-tight">Admin Portal</p>
                        <p className="text-[10px] text-white/60 leading-tight">{currentLabel}</p>
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex flex-col items-end leading-none">
                            <span className="text-xs font-medium text-white">{user?.name || 'Admin'}</span>
                            <span className="text-[10px] text-white/60">{user?.email}</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C49A2A] text-xs font-semibold text-white">
                            {initials}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed top-0 left-0 h-full w-56 bg-white border-r border-[#E0D9CF] z-40 flex flex-col transition-transform duration-200',
                        'lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    )}
                >
                    {/* Mobile sidebar header */}
                    <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-[#2a4d7a] bg-[#1E3A5F]">
                        <span className="font-serif text-white">HostelFind</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-white/70">
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Admin info */}
                    <div className="px-4 py-4 border-b border-[#E0D9CF]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#C49A2A] rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#1A1A1E] truncate">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-[#6B6B78] truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-2">
                        {NAV.map((item) => {
                            const active = isActive(item.href);
                            const badge = badgeFor(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative',
                                        active ? 'bg-[#EEE9E0] text-[#1E3A5F] font-medium' : 'text-[#6B6B78] hover:bg-[#F9F8F6] hover:text-[#1A1A1E]'
                                    )}
                                >
                                    {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#1E3A5F]" />}
                                    <FontAwesomeIcon icon={item.icon} className={cn('h-4 w-4', active ? 'text-[#1E3A5F]' : 'text-[#6B6B78]')} />
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {badge > 0 && (
                                        <span className="bg-[#1E3A5F] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                            {badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sign out */}
                    <form action={signOutAction} className="p-3 border-t border-[#E0D9CF]">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-sm text-[#6B6B78] hover:bg-[#F9F8F6] hover:text-red-500 transition-colors"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
