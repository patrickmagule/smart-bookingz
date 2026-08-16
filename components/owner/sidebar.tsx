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
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';

const navItems = [
  { name: 'Dashboard', href: '/hostelOwner', icon: LayoutDashboard },
  { name: 'My Hostels', href: '/hostelOwner/hostels', icon: Building2 },
  { name: 'Bookings', href: '/hostelOwner/bookings', icon: CalendarCheck },
  { name: 'Messages', href: '/hostelOwner/messages', icon: MessageSquare },
  { name: 'Profile', href: '/hostelOwner/profile', icon: UserCircle },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-50 rounded-xl bg-navy p-2.5 text-white shadow-lg transition-all active:scale-95 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 -translate-x-full transform bg-navy text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-6 lg:shrink-0 lg:flex lg:h-[calc(100vh-3rem)] lg:translate-x-0 lg:flex-col lg:rounded-3xl lg:shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b border-white/10 px-6 py-6">
            <h1 className="text-xl font-medium text-gold">HostelFind</h1>
            <p className="mt-1 text-xs font-normal italic text-mist">Owner Dashboard</p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">
            <Link
              href="/hostelOwner/hostels/new"
              onClick={() => setIsOpen(false)}
              className="mb-4 flex items-center rounded-xl bg-gold px-4 py-3 text-sm font-normal text-navy shadow-lg shadow-gold/10 transition-all hover:bg-gold-dark active:scale-[0.98]"
            >
              <Plus className="mr-3 h-5 w-5" />
              Add New Hostel
            </Link>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm font-normal transition-colors",
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-mist hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-gold" : "text-mist")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button 
              onClick={() => signOutAction()}
              className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-normal text-mist transition-colors hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
