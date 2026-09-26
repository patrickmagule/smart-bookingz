// app/student/hostels/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope, faBed } from '@fortawesome/free-solid-svg-icons';
import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { hasActiveSubscription } from '@/lib/subscription/access';
import {
    getHostelDetail,
    getHostelImages,
    getHostelAmenities,
    getHostelRoomsWithSpaces,
} from '@/lib/data/hostelDetails';
import PhotoGallery from '@/components/student/photoGallery';
import HostelPaywall from '@/components/student/hostelPaywall';
import BookingPanel from '@/components/student/bookingPanel';
import MessageOwnerForm from '@/components/student/messageOwnerForm';

function getDirectionsUrl(lat: number, lng: number) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export const dynamic = 'force-dynamic';

export default async function StudentHostelDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const hostel = await getHostelDetail(id);
    if (!hostel) return notFound();

    const { data } = await auth.getSession();
    const [user] = await sql`SELECT id FROM users WHERE auth_id = ${data?.user?.id} LIMIT 1`;
    const subscribed = user ? await hasActiveSubscription(user.id) : false;

    const images = await getHostelImages(id);

    // Amenities/rooms are only real content for a subscriber — skip the
    // extra queries entirely for everyone else rather than fetch-then-hide.
    const [amenities, rooms] = subscribed
        ? await Promise.all([getHostelAmenities(id), getHostelRoomsWithSpaces(id)])
        : [[], []];

    const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r) => r.price_per_month)) : null;
    const totalBeds = rooms.reduce((sum, r) => sum + r.spaces.length, 0);
    const availableBeds = rooms.reduce((sum, r) => sum + r.spaces.filter((s) => !s.is_occupied).length, 0);

    return (
        <div className="pb-24 md:pb-10">
            <div className="max-w-5xl mx-auto">
                <Link href="/student/hostels" className="inline-block text-xs text-[#6B6B78] hover:underline mb-3">
                    ← Back to hostels
                </Link>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {/* Main column */}
                    <div className="md:col-span-2 space-y-6">
                        <PhotoGallery images={images} alt={hostel.name} />

                        <div>
                            <h1 className="font-serif text-2xl text-[#1A1A1E]">{hostel.name}</h1>
                            <div className="flex items-center gap-1.5 text-[#6B6B78] text-sm mt-1.5">
                                <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                                <span>
                                    {hostel.area ?? 'Area not set'}
                                    {hostel.distance_from_campus_km != null &&
                                        `, ${hostel.distance_from_campus_km}km from MUBAS`}
                                </span>
                            </div>
                            {hostel.latitude != null && hostel.longitude != null ? (
                                <a href={getDirectionsUrl(hostel.latitude, hostel.longitude)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A5F] hover:underline mt-1.5">
                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                    Get Directions on Google Maps
                                </a>
                            ) : (
                                <p className="text-xs text-[#6B6B78] mt-1.5">Location not available</p>
                            )}
                        </div>

                        {hostel.description && (
                            <section>
                                <h2 className="text-sm font-semibold text-[#1A1A1E] mb-2">About this hostel</h2>
                                <p className="text-sm text-[#6B6B78] leading-relaxed">{hostel.description}</p>
                            </section>
                        )}

                        {subscribed && amenities.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold text-[#1A1A1E] mb-2">Amenities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.map((a) => (
                                        <span
                                            key={a.id}
                                            className="bg-[#EEE9E0] text-[#6B6B78] px-2.5 py-1 rounded-sm text-xs font-medium"
                                        >
                                            {a.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {!subscribed ? (
                            <HostelPaywall />
                        ) : (
                            <>
                                {/* Owner card — mobile only; desktop shows it in the sidebar instead */}
                                <section className="md:hidden">
                                    <h2 className="text-sm font-semibold text-[#1A1A1E] mb-2">Owner</h2>
                                    <div className="border border-[#E0D9CF] rounded-sm bg-white p-4">
                                        <p className="text-sm font-medium text-[#1A1A1E]">
                                            {hostel.owner.first_name} {hostel.owner.last_name}
                                        </p>
                                        <a href={`tel:${hostel.contact_phone || hostel.owner.phone || ''}`} className="flex items-center gap-1.5 text-sm text-[#6B6B78] mt-2">
                                            <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                            {hostel.contact_phone || hostel.owner.phone || 'Not provided'}
                                        </a>
                                        <a href={`mailto:${hostel.owner.email}`} className="flex items-center gap-1.5 text-sm text-[#6B6B78] mt-1.5">
                                            <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                                            {hostel.owner.email}
                                        </a>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-sm font-semibold text-[#1A1A1E] mb-3">Location & fees</h2>
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm border border-[#E0D9CF] rounded-sm p-4 bg-white">
                                        <div className="flex justify-between sm:block">
                                            <dt className="text-[#6B6B78]">Address</dt>
                                            <dd className="text-[#1A1A1E] font-medium">
                                                {[hostel.address, hostel.area, hostel.city]
                                                    .filter(Boolean)
                                                    .join(', ') || 'Not specified'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between sm:block">
                                            <dt className="text-[#6B6B78]">Gender preference</dt>
                                            <dd className="text-[#1A1A1E] font-medium">
                                                {hostel.gender_preference || 'Not specified'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between sm:block">
                                            <dt className="text-[#6B6B78]">Deposit</dt>
                                            <dd className="text-[#1A1A1E] font-medium">
                                                {hostel.deposit_amount != null
                                                    ? `K${hostel.deposit_amount.toLocaleString()}`
                                                    : 'None'}
                                            </dd>
                                        </div>
                                        {hostel.other_fees && (
                                            <div className="sm:col-span-2 flex justify-between sm:block">
                                                <dt className="text-[#6B6B78]">Other fees</dt>
                                                <dd className="text-[#1A1A1E] font-medium">{hostel.other_fees}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </section>

                                <section id="rooms">
                                    <div className="flex items-baseline justify-between mb-3">
                                        <h2 className="text-sm font-semibold text-[#1A1A1E] flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faBed} className="h-3.5 w-3.5" />
                                            Rooms & beds
                                        </h2>
                                        <span className="text-xs text-[#6B6B78]">
                                            {availableBeds} of {totalBeds} available
                                        </span>
                                    </div>
                                    {rooms.length === 0 ? (
                                        <p className="text-sm text-[#6B6B78]">No rooms listed yet.</p>
                                    ) : (
                                        <BookingPanel hostelId={hostel.id} rooms={rooms} />
                                    )}
                                </section>

                                <section id="message">
                                    <h2 className="text-sm font-semibold text-[#1A1A1E] mb-3">Message the owner</h2>
                                    <MessageOwnerForm hostelId={hostel.id} ownerId={hostel.owner.id} />
                                </section>
                            </>
                        )}
                    </div>

                    {/* Sidebar — desktop only */}
                    {subscribed && (
                        <aside className="hidden md:block">
                            <div className="sticky top-6 space-y-4">
                                <div className="border border-[#E0D9CF] rounded-sm bg-white p-4">
                                    {minPrice != null && (
                                        <p className="text-lg font-semibold text-[#1E3A5F]">
                                            K{minPrice.toLocaleString()}
                                            <span className="text-xs font-normal text-[#6B6B78]"> /month</span>
                                        </p>
                                    )}
                                    <p className="text-xs text-[#6B6B78] mt-0.5">
                                        {availableBeds} of {totalBeds} beds available
                                    </p>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <a href="#rooms" className="bg-[#1E3A5F] text-white text-center py-2 rounded-sm text-sm font-medium hover:bg-[#162d4a] transition-colors">
                                            Book a bed
                                        </a>
                                        <a href="#message" className="border border-[#1E3A5F] text-[#1E3A5F] text-center py-2 rounded-sm text-sm font-medium hover:bg-[#EEE9E0] transition-colors">
                                            Message owner
                                        </a>
                                        {hostel.latitude != null && hostel.longitude != null && (
                                            <a href={getDirectionsUrl(hostel.latitude, hostel.longitude)} target="_blank" rel="noopener noreferrer" className="border border-[#E0D9CF] text-[#6B6B78] text-center py-2 rounded-sm text-sm font-medium hover:bg-[#EEE9E0] transition-colors">
                                                Get Directions
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-[#E0D9CF] rounded-sm bg-white p-4">
                                    <h3 className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wide mb-2">
                                        Owner
                                    </h3>
                                    <p className="text-sm font-medium text-[#1A1A1E]">
                                        {hostel.owner.first_name} {hostel.owner.last_name}
                                    </p>
                                    <a href={`tel:${hostel.contact_phone || hostel.owner.phone || ''}`} className="flex items-center gap-1.5 text-sm text-[#6B6B78] mt-2 hover:text-[#1E3A5F]">
                                        <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                                        {hostel.contact_phone || hostel.owner.phone || 'Not provided'}
                                    </a>
                                    <a href={`mailto:${hostel.owner.email}`} className="flex items-center gap-1.5 text-sm text-[#6B6B78] mt-1.5 hover:text-[#1E3A5F]">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                                        {hostel.owner.email}
                                    </a>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            {/* Sticky bottom action bar — mobile only */}
            {subscribed && (
                <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E0D9CF] px-4 py-3 flex items-center gap-3 z-10">
                    <div className="flex-1 min-w-0">
                        {minPrice != null && (
                            <p className="text-sm font-semibold text-[#1E3A5F] truncate">
                                K{minPrice.toLocaleString()}
                                <span className="text-[10px] font-normal text-[#6B6B78]">/mo</span>
                            </p>
                        )}
                        <p className="text-[10px] text-[#6B6B78]">{availableBeds} beds available</p>
                    </div>
                    <a href="#message" className="border border-[#1E3A5F] text-[#1E3A5F] px-3 py-2 rounded-sm text-xs font-medium whitespace-nowrap">
                        Message
                    </a>
                    <a href="#rooms" className="bg-[#1E3A5F] text-white px-4 py-2 rounded-sm text-xs font-medium whitespace-nowrap">
                        Book a bed
                    </a>
                </div>
            )}
        </div>
    );
}