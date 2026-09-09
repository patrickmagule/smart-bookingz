'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PublicHostelCard, PlatformStats } from '@/lib/data/publicHostelList';

interface LandingPageProps {
    featured: PublicHostelCard[];
    stats: PlatformStats;
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
    return (
        <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill={i <= Math.round(rating) ? '#C49A2A' : '#E0D9CF'}>
              <path d="M6 1L7.35 4.35L11 4.9L8.5 7.3L9.1 11L6 9.35L2.9 11L3.5 7.3L1 4.9L4.65 4.35L6 1Z" />
          </svg>
      ))}
    </span>
    );
}

function genderLabel(g: string | null) {
    if (g === 'male') return '♂ Male';
    if (g === 'female') return '♀ Female';
    return '⚧ Mixed';
}

function genderBadgeClass(g: string | null) {
    if (g === 'female') return 'bg-pink-100 text-pink-700';
    if (g === 'male') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
}

const FEATURES = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#1E3A5F" strokeWidth="1.5" />
                <path d="M15.5 15.5L19 19" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Smart Search',
        desc: 'Filter by price, location, gender policy, distance from MUBAS, and available beds.',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="4" width="18" height="14" rx="2" stroke="#1E3A5F" strokeWidth="1.5" />
                <path d="M2 9H20" stroke="#1E3A5F" strokeWidth="1.5" />
                <path d="M7 2V6M15 2V6" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Instant Booking',
        desc: 'Book a specific bed in a shared room directly. Real-time availability prevents double bookings.',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#1E3A5F" strokeWidth="1.5" />
                <circle cx="11" cy="9" r="2.5" stroke="#1E3A5F" strokeWidth="1.5" />
            </svg>
        ),
        title: 'Map View',
        desc: 'See all hostels on an interactive map with real distance calculations from MUBAS campus.',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 18V7L11 2L18 7V18H13V13H9V18H4Z" stroke="#1E3A5F" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Verified Owners',
        desc: 'All hostel listings go through admin verification before they go live. No fraudulent listings.',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M20 3H2V15H8L11 18L14 15H20V3Z" stroke="#1E3A5F" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7 8H15M7 11H12" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'In-App Messaging',
        desc: 'Communicate directly with hostel owners before and after bookings. Secure and logged.',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L13.5 7.5H19L14.5 11L16.5 16.5L11 13L5.5 16.5L7.5 11L3 7.5H8.5L11 2Z" stroke="#1E3A5F" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Ratings & Reviews',
        desc: 'Honest reviews from verified past residents. Submit your review after your stay ends.',
    },
];

export default function LandingPage({ featured, stats }: LandingPageProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [gender, setGender] = useState('all');
    const [maxPrice, setMaxPrice] = useState('');

    // Guests can't see hostel details or full search results — every gated
    // action sends them to create an account instead.
    const goToSignin = () => router.push('/auth/sign-in');

    const heroCard = featured[0];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-navy text-white py-12 sm:py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold text-xs font-medium px-3 py-1.5 rounded-sm mb-6">
                                <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                                Official Platform for MUBAS Students
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">
                                Find Your Home
                                <br />
                                Away from Home
                            </h1>
                            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                                Discover, compare, and book verified off-campus hostels near MUBAS with real-time availability and transparent pricing.
                            </p>

                            {/* Search bar — gated: submitting sends guests to sign up */}
                            <div className="bg-white rounded-sm shadow-lg p-2">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by location, hostel name..."
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && goToSignin()}
                                        className="flex-1 px-3 py-2 text-[#1A1A1E] text-sm outline-none placeholder:text-gray-400 min-w-0"
                                    />
                                    <select
                                        value={gender}
                                        onChange={e => setGender(e.target.value)}
                                        className="px-3 py-2 text-sm text-[#1A1A1E] border-t sm:border-t-0 sm:border-l border-gray-200 outline-none bg-white sm:min-w-[120px]"
                                    >
                                        <option value="all">Any gender</option>
                                        <option value="male">Male only</option>
                                        <option value="female">Female only</option>
                                        <option value="mixed">Mixed</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Max price (MK)"
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        className="px-3 py-2 text-sm text-[#1A1A1E] border-t sm:border-t-0 sm:border-l border-gray-200 outline-none w-full sm:w-36"
                                    />
                                    <button
                                        onClick={goToSignin}
                                        className="bg-navy text-white px-5 py-2 text-sm font-medium hover:bg-[#162d4a] transition-colors rounded-sm"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Auth CTAs */}
                            <div className="flex flex-wrap gap-3 mt-5">
                                <Link
                                    href="/auth/sign-up"
                                    className="bg-gold text-white text-sm px-5 py-2 rounded-sm font-semibold hover:bg-[#a8841f] transition-colors"
                                >
                                    Create Account
                                </Link>
                                <Link
                                    href="/auth/sign-in"
                                    className="border border-white/40 text-white text-sm px-5 py-2 rounded-sm hover:bg-white/10 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-6 sm:gap-8 mt-8">
                                {[
                                    [String(stats.hostelCount), 'Verified Hostels'],
                                    [`${stats.studentCount}+`, 'Students Housed'],
                                    [`${stats.avgRating.toFixed(1)}★`, 'Avg. Rating'],
                                ].map(([val, label]) => (
                                    <div key={label}>
                                        <p className="text-xl font-semibold text-white">{val}</p>
                                        <p className="text-xs text-white/50 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero image — hidden on mobile to keep the fold light */}
                        <div className="hidden md:block relative">
                            <div className="rounded-sm overflow-hidden bg-[#162d4a]">
                                <img
                                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&h=480&fit=crop&auto=format"
                                    alt="Student hostel building"
                                    className="w-full h-80 object-cover opacity-90"
                                />
                            </div>
                            {heroCard && (
                                <div className="absolute -bottom-4 -left-4 bg-white text-[#1A1A1E] rounded-sm p-4 shadow-xl max-w-[220px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-green-600 font-medium">
                      {heroCard.available_beds > 0 ? 'Available Now' : 'Fully Booked'}
                    </span>
                                    </div>
                                    <p className="text-sm font-semibold">{heroCard.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {heroCard.distance_from_campus_km !== null ? `${heroCard.distance_from_campus_km} km from MUBAS` : heroCard.area}
                                    </p>
                                    {heroCard.lowest_price !== null && (
                                        <p className="text-sm font-semibold text-navy mt-1">From MK {heroCard.lowest_price.toLocaleString()}/mo</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1E] mb-3">Everything You Need</h2>
                        <p className="text-[#6B6B78] max-w-xl mx-auto text-sm sm:text-base">
                            A complete platform for students, hostel owners, and administrators — built for the MUBAS community.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="border border-[#E0D9CF] rounded-sm p-5 sm:p-6 hover:border-navy/30 hover:shadow-sm transition-all">
                                <div className="w-10 h-10 bg-[#EEE9E0] rounded-sm flex items-center justify-center mb-4">{f.icon}</div>
                                <h3 className="font-semibold text-[#1A1A1E] text-sm mb-2">{f.title}</h3>
                                <p className="text-[#6B6B78] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Hostels — gated: card click sends guests to sign up, never to details */}
            <section className="py-12 sm:py-16 bg-[#F9F8F6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-end justify-between mb-6 sm:mb-8">
                        <div>
                            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1E] mb-2">Featured Hostels</h2>
                            <p className="text-[#6B6B78] text-sm">Verified and highly rated options near MUBAS campus</p>
                        </div>
                        <button onClick={goToSignin} className="text-sm text-navy font-medium hover:underline hidden sm:block">
                            View all →
                        </button>
                    </div>

                    {featured.length === 0 ? (
                        <div className="border-2 border-dashed border-[#E0D9CF] rounded-sm p-12 sm:p-16 text-center bg-white">
                            <p className="text-[#6B6B78] text-sm">No hostels published yet — check back soon.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                            {featured.map(hostel => (
                                <button
                                    key={hostel.id}
                                    onClick={goToSignin}
                                    className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden hover:shadow-md hover:border-navy/20 transition-all text-left group"
                                >
                                    <div className="relative bg-[#EEE9E0]">
                                        {hostel.cover_image ? (
                                            <img
                                                src={hostel.cover_image}
                                                alt={hostel.name}
                                                className="w-full h-44 sm:h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-44 sm:h-48 flex items-center justify-center text-[#6B6B78] text-xs">No photo yet</div>
                                        )}
                                        <span className="absolute top-3 left-3 bg-navy text-white text-xs px-2 py-0.5 rounded-sm">Verified</span>
                                        <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-sm font-medium ${genderBadgeClass(hostel.gender_preference)}`}>
                      {genderLabel(hostel.gender_preference)}
                    </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-[#1A1A1E] text-sm leading-tight">{hostel.name}</h3>
                                            {hostel.distance_from_campus_km !== null && (
                                                <span className="text-xs text-[#6B6B78] whitespace-nowrap">{hostel.distance_from_campus_km} km</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#6B6B78] mb-3">{hostel.area || hostel.address}</p>

                                        {hostel.review_count > 0 ? (
                                            <div className="flex items-center gap-2 mb-3">
                                                <StarRating rating={hostel.rating} />
                                                <span className="text-xs text-[#6B6B78]">
                          {hostel.rating.toFixed(1)} ({hostel.review_count} reviews)
                        </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mb-3">
                                                <StarRating rating={0} />
                                                <span className="text-xs text-[#6B6B78]">No reviews yet</span>
                                            </div>
                                        )}

                                        {hostel.facilities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {hostel.facilities.slice(0, 3).map(f => (
                                                    <span key={f} className="text-[10px] bg-[#EEE9E0] text-[#6B6B78] px-2 py-0.5 rounded-sm">
                            {f}
                          </span>
                                                ))}
                                                {hostel.facilities.length > 3 && (
                                                    <span className="text-[10px] text-[#6B6B78]">+{hostel.facilities.length - 3} more</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-[#E0D9CF]">
                                            <div>
                                                {hostel.lowest_price !== null ? (
                                                    <>
                                                        <span className="text-sm font-semibold text-navy">MK {hostel.lowest_price.toLocaleString()}</span>
                                                        <span className="text-xs text-[#6B6B78]">/month per bed</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-[#6B6B78]">Contact for pricing</span>
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium ${hostel.available_beds > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {hostel.available_beds > 0 ? `${hostel.available_beds} beds free` : 'Fully booked'}
                      </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How it works */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1E] mb-3">How It Works</h2>
                        <p className="text-[#6B6B78] text-sm sm:text-base">Book your hostel in four simple steps</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
                        {[
                            { step: '01', title: 'Register', desc: 'Create a student account with your MUBAS student ID.' },
                            { step: '02', title: 'Search', desc: 'Filter hostels by location, price, gender policy, and bed availability.' },
                            { step: '03', title: 'Choose a Bed', desc: 'Select the exact bed you want in a room with other students if desired.' },
                            { step: '04', title: 'Book & Pay', desc: 'Submit your bookings request, pay securely, and receive confirmation.' },
                        ].map(item => (
                            <div key={item.step} className="text-center">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-navy text-white font-serif text-lg flex items-center justify-center mx-auto mb-4 rounded-sm">
                                    {item.step}
                                </div>
                                <h3 className="font-semibold text-[#1A1A1E] mb-2 text-sm">{item.title}</h3>
                                <p className="text-xs text-[#6B6B78] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 sm:py-14 bg-navy">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">List Your Hostel Today</h2>
                    <p className="text-white/70 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                        Join {stats.hostelCount > 0 ? `${stats.hostelCount} verified hostel owners` : 'verified hostel owners'} reaching {stats.studentCount > 0 ? `${stats.studentCount}+ students` : 'students'} on the platform.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={goToSignin}
                            className="bg-white text-navy px-6 py-2.5 text-sm font-semibold hover:bg-white/90 rounded-sm transition-colors"
                        >
                            Browse Hostels
                        </button>
                        <Link
                            href="/auth/sign-in"
                            className="border border-white/40 text-white px-6 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors"
                        >
                            Register as Owner
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#111D2E] text-white/50 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <p className="text-white font-semibold text-sm mb-3">HostelFind</p>
                            <p className="text-xs leading-relaxed">Official hostel discovery and booking platform for MUBAS students.</p>
                        </div>
                        {[
                            { title: 'Students', links: ['Find Hostels', 'My Bookings', 'Messages', 'Reviews'] },
                            { title: 'Owners', links: ['List Your Hostel', 'Manage Rooms', 'Booking Requests', 'Analytics'] },
                            { title: 'Support', links: ['Help Center', 'Report Issue', 'Terms of Service', 'Privacy Policy'] },
                        ].map(col => (
                            <div key={col.title}>
                                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-3">{col.title}</p>
                                <ul className="space-y-1.5">
                                    {col.links.map(l => (
                                        <li key={l}>
                                            <a href="#" className="text-xs hover:text-white transition-colors">
                                                {l}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 pt-6 text-xs text-center">
                        © {new Date().getFullYear()} HostelFind — Smart Hostel Discovery for MUBAS Students. Blantyre, Malawi.
                    </div>
                </div>
            </footer>
        </div>
    );
}