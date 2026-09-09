// app/student/hostels/page.tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';
import { getPublishedHostels, type HostelListRow } from '@/lib/data/studentDashboard';
import HostelFilters from '@/components/student/hostelFilters';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function FindHostelsPage({
                                                 searchParams,
                                             }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;

    const hostels: HostelListRow[] = await getPublishedHostels({
        search: params.search as string,
        type: params.type as string,
        gender: params.gender as string,
        distance: params.distance ? parseFloat(params.distance as string) : undefined,
        maxPrice: params.maxPrice ? parseFloat(params.maxPrice as string) : undefined,
    });

    return (
        <div>
            <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded-sm mb-6" />}>
                <HostelFilters />
            </Suspense>

            {hostels.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#6B6B78]">No published hostels yet.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {hostels.map((h: HostelListRow) => (
                        <div key={h.id} className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
                            <div className="h-40 bg-[#EEE9E0] relative">
                                {h.image_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />
                                )}
                                <button className="absolute top-2.5 right-2.5 p-1.5 bg-white border border-[#E0D9CF] rounded-sm text-[#6B6B78] hover:text-red-500 transition-colors">
                                    <FontAwesomeIcon icon={faHeart} className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h3 className="text-sm font-semibold text-[#1A1A1E]">{h.name}</h3>
                                    <span className="text-xs font-semibold text-[#1A1A1E]">{h.avg_rating ? h.avg_rating.toFixed(1) : 'New'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#6B6B78] text-xs mb-3">
                                    <FontAwesomeIcon icon={faLocationDot} className="h-3 w-3" />
                                    <span>
                                        {h.area ?? 'Area not set'}
                                        {h.distance_from_campus_km != null && `, ${h.distance_from_campus_km}km from MUBAS`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                                    {h.amenities.slice(0, 2).map((a: string) => (
                                        <span key={a} className="bg-[#EEE9E0] text-[#6B6B78] px-2 py-0.5 rounded-sm text-[10px] font-medium">{a}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-[#E0D9CF]">
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E3A5F]">{h.min_price ? `K${h.min_price.toLocaleString()}` : 'Price on request'}</span>
                                        {h.min_price && <span className="text-[10px] text-[#6B6B78]"> /month</span>}
                                    </div>
                                    <a href={`/student/hostels/${h.id}`} className="bg-[#1E3A5F] text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-[#162d4a] transition-colors">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}