import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import Link from 'next/link';
import { getOwnerHostels } from '@/lib/data/ownerHostelList';
import { HostelCardActions } from './hostelCard';

export const dynamic = 'force-dynamic';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
      <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill={i <= Math.round(rating) ? '#C49A2A' : '#E0D9CF'}>
                  <path d="M6 1L7.35 4.35L11 4.9L8.5 7.3L9.1 11L6 9.35L2.9 11L3.5 7.3L1 4.9L4.65 4.35L6 1Z" />
                </svg>
            ))}
        </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: 'Verified', className: 'bg-[#1E3A5F] text-white' },
    PENDING_APPROVAL: { label: 'Pending Verification', className: 'bg-amber-50 text-[#C49A2A] border border-amber-200' },
    DRAFT: { label: 'Draft', className: 'bg-[#EEE9E0] text-[#6B6B78] border border-[#E0D9CF]' },
    SUSPENDED: { label: 'Deactivated', className: 'bg-red-50 text-red-500 border border-red-200' },
    REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-500 border border-red-200' },
  };
  const cfg = map[status] ?? map.DRAFT;
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-sm ${cfg.className}`}>{cfg.label}</span>;
}

function genderLabel(g: string | null) {
  if (g === 'male') return '♂ Male only';
  if (g === 'female') return '♀ Female only';
  return '⚧ Mixed';
}

export default async function MyHostelsPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  if (!userId) return <div>User not found</div>;

  const hostels = await getOwnerHostels(userId);

  return (
      <div>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl text-[#1A1A1E]">My Hostels</h1>
            <p className="text-sm text-[#6B6B78] mt-0.5">{hostels.length} hostel{hostels.length !== 1 ? 's' : ''} registered on your account</p>
          </div>
          <Link
              href="/hostelOwner/hostels/new"
              className="bg-[#1E3A5F] text-white text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-[#162d4a] transition-colors whitespace-nowrap"
          >
            + Add New Hostel
          </Link>
        </div>

        {hostels.length === 0 ? (
            <div className="border-2 border-dashed border-[#E0D9CF] rounded-sm p-16 text-center">
              <p className="text-[#6B6B78] text-sm mb-4">You haven&#39;t added any hostels yet.</p>
              <Link href="/hostelOwner/hostels/new" className="bg-[#1E3A5F] text-white text-sm px-5 py-2.5 rounded-sm hover:bg-[#162d4a]">
                Add Your First Hostel
              </Link>
            </div>
        ) : (
            <div className="space-y-6">
              {hostels.map((h) => {
                const cover = h.images[0] ?? null;
                const visibleFacilities = h.facilities.slice(0, 5);
                const moreCount = h.facilities.length - visibleFacilities.length;

                return (
                    <div key={h.id} className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-[360px] h-56 sm:h-auto shrink-0 bg-[#EEE9E0]">
                          {cover ? (
                              <img src={cover} alt={h.name} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#6B6B78] text-xs">No photo yet</div>
                          )}
                        </div>

                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/hostelOwner/hostels/${h.id}`}>
                                <h2 className="font-serif text-xl text-[#1A1A1E] hover:text-[#1E3A5F] hover:underline cursor-pointer">{h.name}</h2>
                              </Link>
                              <StatusBadge status={h.status} />
                            </div>
                            <HostelCardActions hostelId={h.id} status={h.status} />
                          </div>

                          <p className="text-sm text-[#6B6B78] mb-4">{h.address}</p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {[
                              ['Rooms', h.rooms_count],
                              ['Total Beds', h.total_beds],
                              ['Available', h.available_beds],
                              ['Distance', h.distance_from_campus_km !== null ? `${h.distance_from_campus_km} km` : '—'],
                            ].map(([label, value]) => (
                                <div key={label as string} className="bg-[#F9F8F6] border border-[#E0D9CF] rounded-sm py-3 text-center transition-colors hover:bg-[#EEE9E0]">
                                  {label === 'Distance' ? (
                                    <>
                                      <p className="text-xl font-semibold text-[#1E3A5F]">{value}</p>
                                      <p className="text-[10px] text-[#6B6B78] mt-0.5">{label}</p>
                                    </>
                                  ) : (
                                    <Link href="/hostelOwner/rooms" className="block">
                                      <p className="text-xl font-semibold text-[#1E3A5F]">{value}</p>
                                      <p className="text-[10px] text-[#6B6B78] mt-0.5">{label}</p>
                                    </Link>
                                  )}
                                </div>
                            ))}
                          </div>

                          {h.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {visibleFacilities.map((f) => (
                                    <span key={f} className="text-xs bg-[#EEE9E0] text-[#6B6B78] px-2.5 py-1 rounded-sm">{f}</span>
                                ))}
                                {moreCount > 0 && (
                                    <span className="text-xs text-[#6B6B78] px-1 py-1">+{moreCount} more</span>
                                )}
                              </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {h.review_count > 0 ? (
                                <>
                                  <StarRating rating={h.rating ?? 0} />
                                  <span className="font-semibold text-[#1A1A1E]">{h.rating}</span>
                                  <span className="text-[#6B6B78]">({h.review_count} reviews)</span>
                                </>
                            ) : (
                                <>
                                  <StarRating rating={0} />
                                  <span className="text-[#6B6B78]">No reviews yet</span>
                                </>
                            )}
                            <span className="text-[#6B6B78]">·</span>
                            <span className="text-[#6B6B78]">{genderLabel(h.gender_preference)}</span>
                          </div>
                        </div>
                      </div>

                      {h.images.length > 0 && (
                          <div className="border-t border-[#E0D9CF] px-5 py-3 flex items-center gap-2">
                            {h.images.slice(0, 3).map((url, i) => (
                                <div key={i} className="w-16 h-12 rounded-sm overflow-hidden bg-[#EEE9E0] shrink-0">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <Link
                                href={`/hostelOwner/hostels/new/${h.id}/edit`}
                                className="w-16 h-12 rounded-sm border-2 border-dashed border-[#E0D9CF] flex items-center justify-center text-[#6B6B78] text-lg shrink-0 hover:border-[#1E3A5F]/40"
                            >
                              +
                            </Link>
                            <span className="text-xs text-[#6B6B78] ml-1">{h.images.length} photo{h.images.length !== 1 ? 's' : ''}</span>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}