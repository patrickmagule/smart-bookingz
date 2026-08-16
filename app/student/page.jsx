import { Search, MapPin, Filter, MessageSquare, Heart, User, LogOut, Home } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Student Navigation */}
      <nav className="sticky top-0 z-30 bg-navy text-white px-4 py-3 md:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gold p-1.5 rounded-lg">
              <Home className="w-5 h-5 text-navy" fill="currentColor" />
            </div>
            <span className="text-xl font-display font-bold">HostelFind</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/student" className="text-gold font-medium border-b-2 border-gold pb-1">Discover</Link>
            <a href="#" className="text-white/80 hover:text-white transition-colors">My Bookings</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Messages</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <MessageSquare size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full border-2 border-navy"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gold text-navy flex items-center justify-center font-bold text-xs cursor-pointer">
              JD
            </div>
            <button className="md:hidden">
              <Search size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-navy">Find your next home</h1>
            <p className="text-slate-500">Discover verified hostels near MUBAS campus</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search area, hostel name..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 shadow-sm"
              />
            </div>
            <button className="bg-white border border-slate-200 p-2.5 rounded-xl text-navy hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Near MUBAS', 'Self-Contained', 'Mixed', 'Female Only', 'Male Only', 'Under K30,000'].map((filter) => (
            <button 
              key={filter}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
                filter === 'All' 
                  ? 'bg-navy text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-navy/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Hostel Grid Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-all">
              <div className="h-48 bg-slate-200 relative">
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-navy">
                  VERIFIED
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <Heart size={16} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-navy group-hover:text-gold transition-colors">Sunrise Executive Hostel</h3>
                  <div className="flex items-center gap-1 text-gold">
                    <Heart size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-navy">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                  <MapPin size={12} />
                  <span>Chirimba, 1.2km from MUBAS</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">Mixed</span>
                   <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">Free Wi-Fi</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                    <span className="text-lg font-bold text-navy">K28,500</span>
                    <span className="text-[10px] text-slate-400 font-medium"> /month</span>
                  </div>
                  <button className="bg-navy text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-navy-dark transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}