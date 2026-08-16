'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface OwnerHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function OwnerHeader({ user }: OwnerHeaderProps) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'O';

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-100 bg-white px-4 md:px-8 shadow-sm">
      <div className="lg:hidden" />

      <div className="hidden lg:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search bookings, hostels..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 focus:border-navy transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <Link 
          href="/hostelOwner/hostels/new" 
          className="hidden md:flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-xs font-normal text-white transition-all hover:bg-navy-dark"
        >
          <Plus size={16} />
          Add Hostel
        </Link>
        
        <div className="flex items-center gap-2 border-l border-slate-100 pl-3 md:pl-6">
          <button className="relative p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-lg transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 ml-2 group cursor-pointer">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-normal leading-none text-navy">{user?.name || 'Owner'}</span>
              <span className="text-[10px] font-normal text-mist">Verified Account</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-sm font-normal text-navy shadow-inner shadow-black/5 transition-transform group-hover:scale-105">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
