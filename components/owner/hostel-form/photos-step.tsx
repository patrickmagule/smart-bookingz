'use client';

import { useState } from 'react';
import { UploadDropzone } from '@uploadthing/react';
import { Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function PhotosStep({ data, updateData, onContinue, onBack }: any) {
  const images = data.images || [];
  const [isUploading, setIsUploading] = useState(false);

  const removeImage = (url: string) => {
    updateData({ images: images.filter((img: any) => img.url !== url) });
  };

  const setPrimary = (url: string) => {
    updateData({
      images: images.map((img: any) => ({
        ...img,
        isPrimary: img.url === url
      }))
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-lg font-bold text-navy">Hostel Photos</h2>
        <p className="text-xs text-mist">Upload high-quality photos of your hostel exterior, common areas, and rooms. More photos attract more bookings.</p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition-colors hover:border-navy/20">
        <UploadDropzone
          endpoint="hostelImages"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            const newImages = res.map((file, index) => ({
              url: file.url,
              isPrimary: images.length === 0 && index === 0
            }));
            updateData({ images: [...images, ...newImages] });
            setIsUploading(false);
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
            setIsUploading(false);
          }}
          appearance={{
            button: "bg-navy text-white text-sm font-bold px-6 py-2 rounded-lg",
            label: "text-navy font-semibold",
            allowedContent: "text-mist text-[10px]"
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Preview ({images.length} photos)</h3>
            {isUploading && <Loader2 className="animate-spin text-navy" size={16} />}
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img: any) => (
              <div key={img.url} className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                img.isPrimary ? "border-gold shadow-md" : "border-transparent"
              )}>
                <Image
                  src={img.url}
                  alt="Hostel"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <button
                  onClick={() => removeImage(img.url)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>

                {!img.isPrimary && (
                  <button
                    onClick={() => setPrimary(img.url)}
                    className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 py-1 text-[10px] font-bold text-navy opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set as Cover
                  </button>
                )}

                {img.isPrimary && (
                  <div className="absolute bottom-2 left-2 rounded-lg bg-gold px-2 py-1 text-[8px] font-bold text-white shadow-sm">
                    COVER IMAGE
                  </div>
                )}
              </div>
            ))}
            
            <button className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-400 hover:border-navy/20 hover:text-navy transition-all">
              <Plus size={24} />
              <span className="mt-2 text-[10px] font-bold">Add more</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 italic">The first photo will be used as the cover image. Drag to reorder.</p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          ← Back
        </button>
        <button
          onClick={onContinue}
          disabled={images.length === 0}
          className="rounded-lg bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-dark shadow-lg shadow-navy/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
