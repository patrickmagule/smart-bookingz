'use client';

import { useState, useRef } from 'react';
import { compressImage } from '@/lib/compress-image';
import { Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ImageItem = { file?: File; previewUrl?: string; url?: string; isPrimary?: boolean };

type PhotosStepProps = {
    data: { images?: ImageItem[] };
    updateData: (fields: Partial<{ images: ImageItem[] }>) => void;
    onContinue: () => void;
    onBack: () => void;
};

export function PhotosStep({ data, updateData, onContinue, onBack }: PhotosStepProps) {
    const images: ImageItem[] = data.images || []; // Array of { file: File, previewUrl: string, isPrimary: boolean }
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setIsProcessing(true);
        try {
            const processed = await Promise.all(
                files.map(async (file) => {
                    // Compress image iteratively down to <= 100 KB
                    const compressed = await compressImage(file, 100);
                    return {
                        file: compressed,
                        previewUrl: URL.createObjectURL(compressed),
                        isPrimary: false,
                    };
                })
            );

            const combined = [...images, ...processed];

            // Ensure at least one image is marked as primary cover
            if (combined.length > 0 && !combined.some((img) => img.isPrimary)) {
                combined[0].isPrimary = true;
            }

            updateData({ images: combined });
        } catch (err) {
            console.error('Image compression error:', err);
            alert('Failed to process one or more images.');
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (targetUrl: string) => {
        const target = images.find((img: ImageItem) => (img.previewUrl || img.url) === targetUrl);
        if (target?.previewUrl) {
            URL.revokeObjectURL(target.previewUrl);
        }

        const filtered = images.filter((img: ImageItem) => (img.previewUrl || img.url) !== targetUrl);

        // If we removed the primary image, reassign cover to the first remaining photo
        if (target?.isPrimary && filtered.length > 0) {
            filtered[0].isPrimary = true;
        }

        updateData({ images: filtered });
    };

    const setPrimary = (targetUrl: string) => {
        updateData({
            images: images.map((img: ImageItem) => ({ 
                ...img,
                isPrimary: (img.previewUrl || img.url) === targetUrl,
            })),
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-lg font-bold text-navy">Hostel Photos</h2>
                <p className="text-xs text-mist">
                    Upload high-quality photos of your hostel exterior, common areas, and rooms. Images will automatically be optimized to under 100 KB before saving.
                </p>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="hostel-photo-input"
            />

            {/* Upload Dropzone Container */}
            <label
                htmlFor="hostel-photo-input"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition-colors hover:border-navy/20 hover:bg-slate-50"
            >
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    {isProcessing ? (
                        <Loader2 className="animate-spin text-navy" size={32} />
                    ) : (
                        <div className="rounded-full bg-navy/5 p-3 text-navy">
                            <ImageIcon size={28} />
                        </div>
                    )}
                    <p className="text-sm font-semibold text-navy">
                        {isProcessing ? 'Compressing photos...' : 'Click or drag images here to upload'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        JPG, PNG, WebP supported • Target max size: 100 KB/photo
                    </p>
                </div>
            </label>

            {/* Photo Preview Grid */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                            Preview ({images.length} {images.length === 1 ? 'photo' : 'photos'})
                        </h3>
                        {isProcessing && <Loader2 className="animate-spin text-navy" size={16} />}
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {images.filter((img) => img.previewUrl || img.url).map((img: ImageItem) => {
                            const displayUrl = img.previewUrl ?? img.url!;
                            return (
                                <div
                                    key={displayUrl}
                                    className={cn(
                                        'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all',
                                        img.isPrimary ? 'border-gold shadow-md' : 'border-transparent'
                                    )}
                                >
                                    <Image
                                        src={displayUrl}
                                        alt="Hostel Preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <button
                                        type="button"
                                        onClick={() => removeImage(displayUrl)}
                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>

                                    {!img.isPrimary && (
                                        <button
                                            type="button"
                                            onClick={() => setPrimary(displayUrl)}
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
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-400 hover:border-navy/20 hover:text-navy transition-all"
                        >
                            <Plus size={24} />
                            <span className="mt-2 text-[10px] font-bold">Add more</span>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                        The image with the gold tag will be used as the hostel cover photo.
                    </p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={onContinue}
                    disabled={images.length === 0 || isProcessing}
                    className="rounded-lg bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-dark shadow-lg shadow-navy/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}