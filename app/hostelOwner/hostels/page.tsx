import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function HostelsPage() {
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  const hostels = await sql`
    SELECT h.*, 
      (SELECT image_url FROM hostel_images WHERE hostel_id = h.id AND is_primary = true LIMIT 1) as primary_image,
      (SELECT COUNT(*) FROM rooms WHERE hostel_id = h.id) as room_count
    FROM hostels h
    WHERE h.owner_id = ${userId}
    ORDER BY h.created_at DESC
  `;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Hostels</h1>
          <p className="text-mist">Manage your hostel listings and room availability.</p>
        </div>
        <Link 
          href="/hostelOwner/hostels/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-dark"
        >
          <Plus size={18} />
          Add Hostel
        </Link>
      </div>

      {hostels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="rounded-full bg-slate-50 p-4 text-slate-300">
            <Building2 size={48} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-navy">No hostels yet</h3>
          <p className="mt-2 text-mist max-w-sm">
            Get started by adding your first hostel listing. You'll be able to add rooms and photos later.
          </p>
          <Link 
            href="/hostelOwner/hostels/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark"
          >
            <Plus size={18} />
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {hostels.map((hostel) => (
            <div key={hostel.id} className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 transition hover:shadow-md">
              <div className="aspect-video relative bg-slate-100">
                {hostel.primary_image ? (
                  <Image 
                    src={hostel.primary_image} 
                    alt={hostel.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Building2 size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border",
                    hostel.status === 'PUBLISHED' ? "bg-green-50 text-green-700 border-green-200" :
                    hostel.status === 'DRAFT' ? "bg-slate-50 text-slate-700 border-slate-200" :
                    "bg-gold/10 text-gold border-gold/20"
                  )}>
                    {hostel.status}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-navy text-lg group-hover:text-gold transition-colors">{hostel.name}</h3>
                    <div className="mt-1 flex items-center text-sm text-mist">
                      <MapPin size={14} className="mr-1" />
                      {hostel.area}, {hostel.city}
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-navy">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Building2 size={16} />
                      <span>{hostel.room_count} Rooms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{hostel.gender_preference}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/hostelOwner/hostels/${hostel.id}`}
                    className="text-gold text-sm font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    Manage
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: Array<string | number | boolean | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
