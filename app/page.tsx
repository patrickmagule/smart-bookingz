'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, MapPin, Home, Menu, X, Star, HelpCircle, ChevronDown,
  Calendar, MessageSquare,
} from 'lucide-react';

const FEATURES = [
  { icon: Search, title: 'Smart Search', desc: 'Filter by price, location, gender policy, distance from MUBAS, and available beds.' },
  { icon: Calendar, title: 'Instant Booking', desc: 'Book a specific bed in a shared room directly. Real-time availability prevents double bookings.' },
  { icon: MapPin, title: 'Map View', desc: 'See all hostels on an interactive map with real distance calculations from MUBAS campus.' },
  { icon: Home, title: 'Verified Owners', desc: 'All hostel listings go through admin verification before they go live. No fraudulent listings.' },
  { icon: MessageSquare, title: 'In-App Messaging', desc: 'Communicate directly with hostel owners before and after booking. Secure and logged.' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Honest reviews from verified past residents. Submit your review after your stay ends.' },
];

const STEPS = [
  { n: '01', title: 'Register', desc: 'Create an account and login.' },
  { n: '02', title: 'Search', desc: 'Filter hostels by location, price, gender policy, and bed availability.' },
  { n: '03', title: 'Choose a Bed', desc: 'Select the exact bed you want in a room with other students if desired.' },
  { n: '04', title: 'Book & Pay', desc: 'Submit your booking request, pay securely, and receive confirmation.' },
];

const FOOTER_COLS = [
  { heading: 'Students', links: ['Find Hostels', 'My Bookings', 'Messages', 'Reviews'] },
  { heading: 'Owners', links: ['List Your Hostel', 'Manage Rooms', 'Booking Requests', 'Analytics'] },
  { heading: 'Support', links: ['Help Center', 'Report Issue', 'Terms of Service', 'Privacy Policy'] },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
      <div className="min-h-screen bg-white font-sans text-navy">
        {/* Navigation */}
        <nav className="bg-navy-dark text-white px-4 py-4 md:px-8 relative z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gold p-1.5 rounded-md shadow-inner">
                <Home className="w-5 h-5 text-navy-dark" fill="currentColor" />
              </div>
              <span className="text-lg md:text-xl font-display font-medium tracking-tight">HostelFind</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                <Link href="/" className="bg-navy-pill px-5 py-2 rounded-lg text-sm font-normal shadow-sm">Home</Link>
                <a href="#" className="text-sm font-normal text-white/80 hover:text-white transition-colors">Find Hostels</a>
              </div>
              <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                <Link href="/auth/sign-in" className="text-sm font-normal text-white/80 hover:text-white transition-colors">Sign in</Link>
                <Link href="/auth/sign-up" className="bg-gold hover:bg-gold-dark text-navy-dark px-6 py-2 rounded-lg text-sm font-normal transition-all shadow-lg hover:shadow-gold/20 active:scale-[0.98]">Register</Link>
              </div>
            </div>

            <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link href="/" className="bg-navy-pill px-4 py-2 rounded-lg text-sm font-normal">Home</Link>
                <a href="#" className="px-4 py-2 text-sm font-normal text-white/80">Find Hostels</a>
                <Link href="/auth/sign-in" className="px-4 py-2 text-sm font-normal text-white/80">Sign in</Link>
                <Link href="/auth/sign-up" className="bg-gold text-navy-dark px-4 py-2 rounded-lg text-sm font-normal text-center">Register</Link>
              </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="bg-navy text-white pt-10 pb-20 md:pt-16 md:pb-28 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-8 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] md:text-xs uppercase tracking-widest font-normal text-gold-light">Official Platform for MUBAS Students</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-display font-normal leading-[1.1] mb-6 tracking-tight">
                Find Your Home<br className="hidden sm:block" /> Away from Home
              </h1>

              <p className="text-mist text-sm md:text-base max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-normal">
                Discover, compare, and book verified off-campus hostels near MUBAS with real-time availability and transparent pricing.
              </p>


              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/auth/sign-up" className="bg-gold hover:bg-gold-dark text-navy-dark px-8 py-3.5 rounded-xl font-normal text-sm transition-all shadow-[0_10px_20px_rgba(201,161,98,0.2)] hover:shadow-[0_10px_25px_rgba(201,161,98,0.3)] active:scale-[0.98]">
                  Create Account
                </Link>
                <Link href="/auth/sign-in" className="bg-transparent border-2 border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-xl font-normal text-sm transition-all hover:bg-white/5 active:scale-[0.98]">
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-6 md:gap-12 max-w-lg mx-auto lg:mx-0 border-t border-white/10 pt-8">
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-display font-normal tracking-tight">134</div>
                  <div className="text-[10px] md:text-xs text-mist uppercase font-normal tracking-widest">Verified Hostels</div>
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-display font-normal tracking-tight">1,200+</div>
                  <div className="text-[10px] md:text-xs text-mist uppercase font-normal tracking-widest text-nowrap">Students Housed</div>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <div className="text-2xl md:text-3xl font-display font-normal tracking-tight flex items-center justify-end md:justify-start gap-1">
                    4.6<Star className="w-5 h-5 text-gold fill-gold" />
                  </div>
                  <div className="text-[10px] md:text-xs text-mist uppercase font-normal tracking-widest">Avg. Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image / Card */}
            <div className="relative z-10 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group">
                <Image
                    src="/hostel.png"
                    alt="Modern Hostel Room"
                    width={800}
                    height={600}
                    priority
                    className="w-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60" />
              </div>

              <div className="absolute -bottom-8 -left-12 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-[260px] ring-1 ring-black/5 animate-bounce-slow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] font-normal text-green-600 uppercase tracking-widest">Available Now</span>
                </div>
                <h3 className="text-navy font-display font-normal text-lg mb-1 tracking-tight">Sunrise Student Lodge</h3>
                <p className="text-gray-500 text-xs font-normal mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> 0.8 km from MUBAS
                </p>
                <div className="text-navy font-normal text-sm flex items-baseline gap-1">
                  <span className="text-[10px] font-normal text-gray-400">From</span>
                  MK 14,000<span className="text-[10px] font-normal text-gray-400">/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-display font-normal text-navy mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              A complete platform for students, hostel owners, and administrators.
              Built for the MUBAS community.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border border-gray-200 rounded-2xl p-7 hover:shadow-lg transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-[#F4F1EA] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-navy" />
                  </div>
                  <h3 className="font-display font-normal text-base text-navy mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-24 px-4 md:px-8 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-normal text-navy mb-3 tracking-tight">How It Works</h2>
            <p className="text-gray-500 text-sm md:text-base">Book your hostel in four simple steps</p>
          </div>

          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="text-center">
                  <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-white font-display font-normal text-lg">{n}</span>
                  </div>
                  <h3 className="font-display font-normal text-base text-navy mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[220px] mx-auto">{desc}</p>
                </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy py-20 md:py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-normal text-white mb-4 tracking-tight">List Your Hostel Today</h2>
            <p className="text-mist text-sm md:text-base mb-10 leading-relaxed">
              Join over 89 verified hostel owners reaching more than 1,200 students on the platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-navy px-8 py-3.5 rounded-xl font-normal text-sm hover:bg-gray-100 transition-all active:scale-[0.98]">
                Browse Hostels
              </button>
              <button className="bg-transparent border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-normal text-sm hover:bg-white/5 transition-all active:scale-[0.98]">
                Register as Owner
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-navy-dark px-4 md:px-8 pt-16 pb-8">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div>
              <h3 className="text-white font-display font-normal text-lg mb-3">HostelFind</h3>
              <p className="text-mist text-sm leading-relaxed max-w-xs">
                Official hostel discovery and booking platform for MUBAS students.
              </p>
            </div>

            {FOOTER_COLS.map(({ heading, links }) => (
                <div key={heading}>
                  <h4 className="text-gold-light text-xs font-normal uppercase tracking-widest mb-4">{heading}</h4>
                  <ul className="space-y-2.5 text-sm text-white/70">
                    {links.map((link) => (
                        <li key={link}>
                          <a href="#" className="hover:text-white transition-colors">{link}</a>
                        </li>
                    ))}
                  </ul>
                </div>
            ))}
          </div>

          <div className="max-w-6xl mx-auto pt-8 text-center">
            <p className="text-white/50 text-xs">
              © 2025 HostelFind — Smart Hostel Discovery for MUBAS Students. Blantyre, Malawi.
            </p>
          </div>
        </footer>

        {/* Floating Help Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <button className="bg-navy-dark text-white p-4 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:scale-110 hover:-translate-y-1 transition-all group">
            <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
  );
}