'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Wifi, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  BookOpen, 
  WashingMachine, 
  Car, 
  Utensils, 
  Lock, 
  Trophy, 
  Coffee, 
  Bath, 
  BedDouble,
  Users
} from 'lucide-react';

const FACILITIES = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'security', name: 'CCTV Security', icon: ShieldCheck },
  { id: 'generator', name: 'Backup Generator', icon: Zap },
  { id: 'water', name: 'Water 24/7', icon: Droplets },
  { id: 'common-room', name: 'Common Room', icon: Users },
  { id: 'study-area', name: 'Study Area', icon: BookOpen },
  { id: 'laundry', name: 'Laundry Room', icon: WashingMachine },
  { id: 'parking', name: 'Parking', icon: Car },
  { id: 'kitchen', name: 'Kitchen', icon: Utensils },
  { id: 'guard', name: 'Security Guard', icon: Lock },
  { id: 'sports', name: 'Sports Ground', icon: Trophy },
  { id: 'lounge', name: 'Rooftop Lounge', icon: Coffee },
  { id: 'ensuite', name: 'En-suite Bathrooms', icon: Bath },
  { id: 'furnished', name: 'Furnished Rooms', icon: BedDouble },
];

type BasicInfoData = {
  name?: string;
  address?: string;
  area?: string;
  distance?: string;
  phone?: string;
  genderPolicy?: string;
  description?: string;
  facilities?: string[];
};

type BasicInfoProps = {
  data: BasicInfoData;
  updateData: (fields: Partial<BasicInfoData>) => void;
  onContinue: () => void;
};

export function BasicInfoStep({ data, updateData, onContinue }: BasicInfoProps) {
  const [descriptionCount, setDescriptionCount] = useState(data.description?.length || 0);

  const toggleFacility = (id: string) => {
    const facilities = data.facilities || [];
    if (facilities.includes(id)) {
      updateData({ facilities: facilities.filter((f: string) => f !== id) });
    } else {
      updateData({ facilities: [...facilities, id] });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      updateData({ description: value });
      setDescriptionCount(value.length);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Hostel Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="e.g. Sunrise Hostel"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Full Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder="e.g. Plot 45, Chirimba"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Area / Neighbourhood <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.area || ''}
            onChange={(e) => updateData({ area: e.target.value })}
            placeholder="e.g. Chirimba, Blantyre"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Distance from MUBAS (km) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={data.distance || ''}
            onChange={(e) => updateData({ distance: e.target.value })}
            placeholder="2"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="0999993293"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          />
        </div>

        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Gender Policy <span className="text-red-500">*</span>
          </label>
          <select
            value={data.genderPolicy || 'Mixed'}
            onChange={(e) => updateData({ genderPolicy: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5"
          >
            <option value="Mixed">Mixed (Male & Female)</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
          </select>
        </div>

        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            Hostel Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={data.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Provide a detailed description of your hostel..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/5 resize-none"
          />
          <div className="mt-1 flex justify-end">
            <span className="text-[10px] text-slate-400 font-medium">
              {descriptionCount}/500 characters
            </span>
          </div>
        </div>

        <div className="col-span-full pt-2">
          <label className="mb-4 block text-sm font-semibold text-navy">
            Hostel Facilities
          </label>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((facility) => {
              const isSelected = (data.facilities || []).includes(facility.id);
              return (
                <button
                  key={facility.id}
                  type="button"
                  onClick={() => toggleFacility(facility.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    isSelected
                      ? "bg-navy border-navy text-white shadow-md"
                      : "bg-white border-slate-100 text-slate-600 hover:border-navy/20 hover:bg-slate-50"
                  )}
                >
                  {isSelected && <span className="text-[10px]">✓</span>}
                  {facility.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100">
        <button
          onClick={onContinue}
          className="rounded-lg bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-dark shadow-lg shadow-navy/10 active:scale-[0.98]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
