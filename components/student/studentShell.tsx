'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faMagnifyingGlass,
    faCalendarCheck,
    faMessage,
    faBell,
    faCircleUser,
    faRightFromBracket,
    faBars,
    faXmark,
    faChevronDown,
    faGear,
} from '@fortawesome/free-solid-svg-icons';
import { signOutAction } from '@/app/auth/actions';

interface StudentShellProps {
    user: { name?: string | null; email?: string | null };
    unreadMsgs: number;
    unreadNotifs: number;
    children: React.ReactNode;
}

const NAV = [
    { href: '/student', label: 'Home', icon: faHouse },
    { href: '/student/hostels', label: 'Find Hostels', icon: faMagnifyingGlass },
    { href: '/student/bookings', label: 'My Bookings', icon: faCalendarCheck },
    { href: '/student/messages', label: 'Messages', icon: faMessage, badgeKey: 'unreadMsgs' as const },
];

export function StudentShell({ user, unreadMsgs, unreadNotifs, children }: StudentShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials =
        user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

    const badges: Record<'unreadMsgs', number> = { unreadMsgs };
    const currentLabel = NAV.find((n) => n.href === pathname)?.label ?? 'Home';

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Top header — identical structure to OwnerShell's */}
            <header className="sticky top-0 z-50 bg-[#1E3A5F] border-b border-[#2a4d7a]">
                <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/80 hover:text-white p-1">
                        <FontAwesomeIcon icon={faBars} className="h-[18px] w-[18px]" />
                    </button>

                    <Link href="/student" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 bg-[#C49A2A] flex items-center justify-center rounded-sm">
                            <FontAwesomeIcon icon={faHouse} className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-serif text-xl text-white tracking-tight">HostelFind</span>
                    </Link>

                    <div className="w-px h-6 bg-white/15 mx-1 hidden sm:block" />

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-white leading-tight">Student Portal</p>
                        <p className="text-[10px] text-white/60 leading-tight">{currentLabel}</p>
                    </div>

                    <div className="flex-1" />

                    <Link href="/student/notifications" className="relative p-2 text-white/80 hover:text-white">
                        <FontAwesomeIcon icon={faBell} className="h-[18px] w-[18px]" />
                        {unreadNotifs > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full ring-2 ring-[#1E3A5F]" />
                        )}
                    </Link>

                    {/* Profile dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen((v) => !v)}
                            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-sm hover:bg-white/10 transition-colors"
                        >
                            <div className="w-8 h-8 bg-[#C49A2A] rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {initials}
                            </div>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={cn('h-3 w-3 text-white/70 transition-transform hidden sm:block', profileOpen && 'rotate-180')}
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E0D9CF] rounded-sm py-1 z-50">
                                <div className="px-3 py-2.5 border-b border-[#E0D9CF]">
                                    <p className="text-sm font-medium text-[#1A1A1E] truncate">{user.name ?? 'Student'}</p>
                                    <p className="text-xs text-[#6B6B78] truncate">{user.email}</p>
                                </div>
                                <Link
                                    href="/student/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1A1A1E] hover:bg-[#F9F8F6] transition-colors"
                                >
                                    <FontAwesomeIcon icon={faCircleUser} className="h-3.5 w-3.5 text-[#6B6B78]" />
                                    Profile
                                </Link>
                                <Link
                                    href="/student/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1A1A1E] hover:bg-[#F9F8F6] transition-colors"
                                >
                                    <FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5 text-[#6B6B78]" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => signOutAction()}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#6B6B78] hover:bg-[#F9F8F6] hover:text-red-500 transition-colors border-t border-[#E0D9CF] mt-1"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex">
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar — same mobile-first slide-in mechanics as OwnerShell */}
                <aside
                    className={cn(
                        'fixed top-0 left-0 h-full w-56 bg-white border-r border-[#E0D9CF] z-40 flex flex-col transition-transform duration-200',
                        'lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    )}
                >
                    <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-[#2a4d7a] bg-[#1E3A5F]">
                        <span className="font-serif text-white">HostelFind</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-white/70">
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-2">
                        {NAV.map((item) => {
                            const active = pathname === item.href;
                            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
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
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {badge > 0 && (
                                        <span className="bg-[#1E3A5F] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                            {badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 min-w-0 px-4 sm:px-6 py-6">{children}</div>
            </div>
        </div>
    );
}