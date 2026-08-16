'use client';

import { cn } from '@/lib/utils';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const AMENITIES = [
  'Wardrobe', 'Study Desk', 'Fan', 'AC', 'Window', 
  'Private Bathroom', 'Shared Bathroom', 'Mini Fridge', 'Bookshelf'
];

const ROOM_TYPES = [
  { id: 'Single', name: 'Single' },
  { id: 'Double', name: 'Double' },
  { id: 'Triple', name: 'Triple' },
  { id: 'Quad', name: 'Quad' },
];

export function RoomsBedsStep({ data, updateData, onContinue, onBack }: any) {
  const rooms = data.rooms || [{ id: Date.now(), name: 'Room 1', type: 'Single', description: '', amenities: [], beds: [{ id: Date.now() + 1, label: 'Bed A', price: '' }] }];

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      type: 'Single',
      description: '',
      amenities: [],
      beds: [{ id: Date.now() + 1, label: 'Bed A', price: '' }]
    };
    updateData({ rooms: [...rooms, newRoom] });
  };

  const removeRoom = (roomId: number) => {
    updateData({ rooms: rooms.filter((r: any) => r.id !== roomId) });
  };

  const updateRoom = (roomId: number, updates: any) => {
    updateData({
      rooms: rooms.map((r: any) => r.id === roomId ? { ...r, ...updates } : r)
    });
  };

  const addBed = (roomId: number) => {
    const room = rooms.find((r: any) => r.id === roomId);
    const nextLabel = String.fromCharCode(65 + room.beds.length); // A, B, C...
    const newBed = { id: Date.now(), label: `Bed ${nextLabel}`, price: '' };
    updateRoom(roomId, { beds: [...room.beds, newBed] });
  };

  const removeBed = (roomId: number, bedId: number) => {
    const room = rooms.find((r: any) => r.id === roomId);
    updateRoom(roomId, { beds: room.beds.filter((b: any) => b.id !== bedId) });
  };

  const updateBed = (roomId: number, bedId: number, updates: any) => {
    const room = rooms.find((r: any) => r.id === roomId);
    updateRoom(roomId, {
      beds: room.beds.map((b: any) => b.id === bedId ? { ...b, ...updates } : b)
    });
  };

  const toggleAmenity = (roomId: number, amenity: string) => {
    const room = rooms.find((r: any) => r.id === roomId);
    const amenities = room.amenities || [];
    if (amenities.includes(amenity)) {
      updateRoom(roomId, { amenities: amenities.filter((a: string) => a !== amenity) });
    } else {
      updateRoom(roomId, { amenities: [...amenities, amenity] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">Rooms & Beds</h2>
          <p className="text-xs text-mist">Each room can have multiple beds. Each bed is priced and booked individually.</p>
        </div>
        <button
          onClick={addRoom}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-dark"
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      <div className="space-y-6">
        {rooms.map((room: any, index: number) => (
          <div key={room.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-slate-50/50 px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <span className="font-bold text-navy">{room.name}</span>
                <select
                  value={room.type}
                  onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-navy outline-none"
                >
                  {ROOM_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <span className="text-xs text-mist">{room.beds.length} {room.beds.length === 1 ? 'bed' : 'beds'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-400 hover:text-navy transition-colors">
                  <ChevronDown size={18} />
                </button>
                <button
                  onClick={() => removeRoom(room.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-navy uppercase tracking-wider">Room description (optional)</label>
                <input
                  type="text"
                  value={room.description}
                  onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                  placeholder="e.g. Spacious room with large windows and balcony access"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-navy outline-none transition focus:border-navy"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-navy uppercase tracking-wider">Room amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => {
                    const isSelected = (room.amenities || []).includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(room.id, amenity)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-[10px] font-medium transition-all",
                          isSelected 
                            ? "bg-navy border-navy text-white" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-navy uppercase tracking-wider text-navy">Beds in this room</label>
                  <button
                    onClick={() => addBed(room.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-navy px-2 py-1 text-[10px] font-bold text-navy hover:bg-navy hover:text-white transition-all"
                  >
                    + Add Bed
                  </button>
                </div>

                <div className="rounded-lg bg-gold/5 border border-gold/20 p-3 flex gap-3">
                  <AlertCircle size={16} className="text-gold shrink-0" />
                  <p className="text-[10px] leading-relaxed text-gold-dark font-medium">
                    Each bed is a separate bookable space. A student books one specific bed, not the whole room.
                  </p>
                </div>

                <div className="space-y-2">
                  {room.beds.map((bed: any, bIndex: number) => (
                    <div key={bed.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500">
                        {String.fromCharCode(65 + bIndex)}
                      </div>
                      <input
                        type="text"
                        value={bed.label}
                        onChange={(e) => updateBed(room.id, bed.id, { label: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-navy outline-none"
                      />
                      <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                        <span className="text-[10px] font-bold text-slate-400 mr-2">MK</span>
                        <input
                          type="number"
                          value={bed.price}
                          onChange={(e) => updateBed(room.id, bed.id, { price: e.target.value })}
                          placeholder="25,000"
                          className="w-full text-xs text-navy outline-none"
                        />
                        <span className="text-[10px] text-slate-400 ml-2">/month</span>
                      </div>
                      {room.beds.length > 1 && (
                        <button
                          onClick={() => removeBed(room.id, bed.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Plus size={16} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          className="rounded-lg bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-dark shadow-lg shadow-navy/10"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
