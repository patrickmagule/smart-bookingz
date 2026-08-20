'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Building2,
    MessageSquare,
    CalendarCheck,
    UserCircle,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';

const navItems = [
    { name: 'Dashboard', href: '/hostelOwner', icon: LayoutDashboard },
    { name: 'My Hostels', href: '/hostelOwner/hostels', icon: Building2 },
    { name: 'Bookings', href: '/hostelOwner/bookings', icon: CalendarCheck, badge: 2 },
    { name: 'Messages', href: '/hostelOwner/messages', icon: MessageSquare, badge: 1 },
];

interface OwnerTopNavProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function OwnerTopNav({ user }: OwnerTopNavProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'O';

    return (
        <header className="sticky top-0 z-40 bg-navy">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link href="/hostelOwner" className="flex items-center gap-2 shrink-0">
                    <span className="text-lg font-medium text-gold">HostelFind</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-1 ml-8 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-normal transition-colors',
                                    isActive ? 'text-white' : 'text-mist hover:text-white hover:bg-white/5'
                                )}
                            >
                                <item.icon size={16} className={isActive ? 'text-gold' : 'text-mist'} />
                                {item.name}
                                {item.badge && (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-navy">
                    {item.badge}
                  </span>
                                )}
                                {isActive && (
                                    <span className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full bg-gold" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <button className="relative rounded-lg p-2 text-mist transition-colors hover:bg-white/5 hover:text-white">
                        <Bell size={18} />
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-1.5 transition-colors hover:bg-white/5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-medium text-navy">
                                {initials}
                            </div>
                            <div className="hidden xl:flex flex-col items-start leading-none">
                                <span className="text-xs font-normal text-white">{user?.name || 'Owner'}</span>
                                <span className="text-[10px] font-normal text-mist">Verified</span>
                            </div>
                            <ChevronDown size={14} className="text-mist" />
                        </button>

                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-navy-dark py-1.5 shadow-lg">
                                    <Link
                                        href="/hostelOwner/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-mist transition-colors hover:bg-white/5 hover:text-white"
                                    >
                                        <UserCircle size={16} />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => signOutAction()}
                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-mist transition-colors hover:bg-red-900/20 hover:text-red-300"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileOpen}
                    className="lg:hidden rounded-lg p-2 text-white"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 bg-navy px-4 py-3">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-normal transition-colors',
                                        isActive ? 'bg-white/10 text-white' : 'text-mist hover:bg-white/5 hover:text-white'
                                    )}
                                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-gold' : 'text-mist'} />
                      {item.name}
                  </span>
                                    {item.badge && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-navy">
                      {item.badge}
                    </span>
                                    )}
                                </Link>
                            );
                        })}
                        <Link
                            href="/hostelOwner/profile"
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-normal transition-colors',
                                pathname === '/hostelOwner/profile'
                                    ? 'bg-white/10 text-white'
                                    : 'text-mist hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <UserCircle size={18} className={pathname === '/hostelOwner/profile' ? 'text-gold' : 'text-mist'} />
                            Profile
                        </Link>
                        <button
                            onClick={() => signOutAction()}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-normal text-mist transition-colors hover:bg-red-900/20 hover:text-red-300"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}