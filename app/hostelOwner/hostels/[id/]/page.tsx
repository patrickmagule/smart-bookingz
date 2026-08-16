import { auth } from '@/lib/auth/server';
import { sql } from '@/lib/db';
import { 
  Building2, 
  MapPin, 
  Users, 
  Plus,
  ArrowLeft,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function HostelDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const { data } = await auth.getSession();
  const authUser = data?.user;

  const [user] = await sql`SELECT id FROM users WHERE auth_id = ${authUser?.id} LIMIT 1`;
  const userId = user?.id;

  const [hostel] = await sql`
    SELECT * FROM hostels 
    WHERE id = ${id} AND owner_id = ${userId}
  `;

  if (!hostel) notFound();

  const rooms = await sql`
    SELECT r.*, 
      (SELECT COUNT(*) FROM room_spaces WHERE room_id = r.id) as total_spaces,
      (SELECT COUNT(*) FROM room_spaces rs 
       JOIN bookings b ON rs.id = b.space_id 
       WHERE rs.room_id = r.id AND b.status = 'CONFIRMED') as occupied_spaces
    FROM rooms r
    WHERE r.hostel_id = ${id}
    ORDER BY r.room_number
  `;

  const images = await sql`
    SELECT * FROM hostel_images WHERE hostel_id = ${id} ORDER BY display_order
  `;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/hostelOwner/hostels" className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">{hostel.name}</h1>
          <div className="flex items-center gap-2 text-sm text-mist">
            <MapPin size={14} />
            {hostel.address}, {hostel.area}, {hostel.city}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Rooms and Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Rooms Section */}
          <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Rooms</h2>
              <button className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:underline">
                <Plus size={16} />
                Add Room
              </button>
            </div>
            
            {rooms.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm">No rooms added to this hostel yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {rooms.map((room) => (
                  <div key={room.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h3 className="font-bold text-navy">Room {room.room_number}</h3>
                      <p className="text-sm text-mist mt-1">{room.description || 'No description'}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                        <span className="text-gold">MK {Number(room.price_per_month).toLocaleString()} / month</span>
                        <span className="text-slate-400">{room.total_spaces - room.occupied_spaces} beds available</span>
                      </div>
                    </div>
                    <Link 
                      href={`/hostelOwner/hostels/${id}/rooms/${room.id}`}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-navy hover:border-navy transition-colors"
                    >
                      <Settings size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Photos and Quick Stats */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy">Hostel Photos</h2>
              <ImageIcon size={18} className="text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {images.map((img) => (
                <div key={img.id} className="aspect-square relative rounded-lg overflow-hidden bg-slate-100">
                  <Image src={img.image_url} alt="Hostel" fill className="object-cover" />
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 rounded-lg text-slate-300 text-sm">
                  No photos uploaded
                </div>
              )}
            </div>
          </section>

          <section className="bg-navy p-6 rounded-xl shadow-sm text-white">
            <h2 className="font-bold mb-4">Hostel Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mist">Current Status</span>
                <span className="font-bold text-gold uppercase tracking-wider">{hostel.status}</span>
              </div>
              <div className="h-px bg-white/10"></div>
              <p className="text-xs text-mist leading-relaxed">
                {hostel.status === 'DRAFT' 
                  ? 'Your hostel is currently in draft mode and not visible to students. Complete all details and submit for approval.'
                  : 'Your hostel is live and students can request bookings.'}
              </p>
              {hostel.status === 'DRAFT' && (
                <button className="w-full mt-4 py-2.5 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light transition">
                  Publish Hostel
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
