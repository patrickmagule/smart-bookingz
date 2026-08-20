'use client';

import { CheckCircle2, MapPin, Home, Bed, Info, Images, Wallet } from 'lucide-react';

type Bed = { id: number; label: string };
type Room = { id?: number; name?: string; area?: string; genderPolicy?: string; rooms?: Room[]; beds?: Bed[]; price?: string | number };
type ImageItem = { file?: File; previewUrl?: string; url?: string; isPrimary?: boolean };

type ReviewStepProps = {
  data: { 
    name?: string; 
    area?: string; 
    genderPolicy?: string; 
    rooms?: Room[]; 
    images?: ImageItem[];
    facilities?: string[];
  };
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

export function ReviewStep({ data, onSubmit, onBack, isSubmitting }: ReviewStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-navy">Review Your Listing</h2>
        <p className="text-sm text-mist">Double check the information before submitting for approval.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
          <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
            <Info size={14} className="text-gold" />
            Basic Details
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Name</span>
              <span className="font-semibold text-navy">{data.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Area</span>
              <span className="font-semibold text-navy">{data.area}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Policy</span>
              <span className="font-semibold text-navy">{data.genderPolicy} Only</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
          <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
            <Home size={14} className="text-gold" />
            Inventory
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Rooms</span>
              <span className="font-semibold text-navy">{data.rooms?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Beds</span>
              <span className="font-semibold text-navy">
                {data.rooms?.reduce((acc: number, room: Room) => acc + (room.beds?.length || 0), 0) || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
            <Bed size={14} className="text-gold" />
            Rooms & Pricing
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.rooms?.map((room, idx) => (
              <div key={idx} className="rounded-lg bg-white p-3 border border-slate-100 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-navy">{room.name}</div>
                  <div className="text-[10px] text-slate-500">{room.beds?.length || 0} Beds</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-navy">MK {Number(room.price || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">per bed / month</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
            <Info size={14} className="text-gold" />
            Facilities
          </div>
          <div className="flex flex-wrap gap-2">
            {data.facilities?.map((facilityId) => (
              <span 
                key={facilityId}
                className="rounded-lg bg-white border border-slate-100 px-3 py-1.5 text-xs font-medium text-navy uppercase tracking-wide"
              >
                {facilityId.replace(/-/g, ' ')}
              </span>
            ))}
            {(!data.facilities || data.facilities.length === 0) && (
              <span className="text-xs text-slate-400">No facilities selected</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
            <Images size={14} className="text-gold" />
            Photos ({data.images?.length || 0})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {data.images?.map((img: ImageItem, idx: number) => (
              <div key={img.url || img.previewUrl || idx} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                <img src={img.url || img.previewUrl} alt="Hostel preview" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-navy p-6 text-white shadow-xl shadow-navy/20">
        <div className="flex items-start gap-4">
          <div className="mt-1 rounded-full bg-gold/20 p-2 text-gold">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Terms of Service</h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              By submitting this listing, you confirm that you are the rightful owner or authorized manager of this property and all information provided is accurate. Listings are reviewed within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-gold px-12 py-3 text-sm font-bold text-navy transition hover:bg-gold-dark shadow-lg shadow-gold/10 disabled:opacity-50 min-w-[160px]"
        >
          {isSubmitting ? (
             <span className="flex items-center gap-2">
               <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent"></span>
               Submitting...
             </span>
          ) : 'Submit Listing for Approval'}
        </button>
      </div>
    </div>
  );
}
