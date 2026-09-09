'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
    id: string;
    image_url: string;
}

export default function PhotoGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    function handleScroll() {
        const el = scrollRef.current;
        if (!el) return;
        setActive(Math.round(el.scrollLeft / el.clientWidth));
    }

    if (images.length === 0) {
        return <div className="aspect-[4/3] sm:aspect-video bg-[#EEE9E0] rounded-sm" />;
    }

    return (
        <div className="relative">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {images.map((img, i) => (
                    <div
                        key={img.id}
                        className="relative w-full flex-none snap-start aspect-[4/3] sm:aspect-video bg-[#EEE9E0]"
                    >
                        <Image src={img.image_url} alt={alt} fill className="object-cover" priority={i === 0} />
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                                i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}