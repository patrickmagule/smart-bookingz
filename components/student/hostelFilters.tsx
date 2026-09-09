'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from '@/lib/hooks/useDebounce';

const categories = ['All', 'Near MUBAS', 'Self-Contained', 'Mixed', 'Female Only', 'Male Only', 'Under K30,000'];

export default function HostelFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [type, setType] = useState(searchParams.get('type') || 'All');
    const [gender, setGender] = useState(searchParams.get('gender') || 'All');
    const [distance, setDistance] = useState(searchParams.get('distance') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (debouncedSearch) params.set('search', debouncedSearch);
        else params.delete('search');
        
        if (type && type !== 'All') params.set('type', type);
        else params.delete('type');

        if (gender && gender !== 'All') params.set('gender', gender);
        else params.delete('gender');
        
        if (distance) params.set('distance', distance);
        else params.delete('distance');
        
        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        router.push(`/student/hostels?${params.toString()}`);
    }, [debouncedSearch, type, gender, distance, maxPrice, router, searchParams]);

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl text-[#1A1A1E]">Find your next home</h1>
                    <p className="text-sm text-[#6B6B78] mt-0.5">Discover verified hostels near MUBAS campus</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:w-80">
                        <FontAwesomeIcon 
                            icon={faMagnifyingGlass} 
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B78] h-3.5 w-3.5" 
                        />
                        <input
                            type="text"
                            placeholder="Search area, hostel name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-[#E0D9CF] rounded-sm py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`border border-[#E0D9CF] p-2 rounded-sm transition-colors ${showAdvanced ? 'bg-[#1E3A5F] text-white' : 'text-[#1E3A5F] hover:bg-[#F9F8F6]'}`}
                    >
                        <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setType(cat)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                            type === cat 
                                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' 
                                : 'bg-white text-[#6B6B78] border-[#E0D9CF] hover:border-[#1E3A5F]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-[#E0D9CF] rounded-sm animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A1A1E]">Max Distance (km)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            min="0"
                            placeholder="e.g. 2.5"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full bg-white border border-[#E0D9CF] rounded-sm py-2 px-3 text-sm outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A1A1E]">Max Price (MK)</label>
                        <input 
                            type="number" 
                            min="0"
                            placeholder="e.g. 35000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full bg-white border border-[#E0D9CF] rounded-sm py-2 px-3 text-sm outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#1A1A1E]">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-white border border-[#E0D9CF] rounded-sm py-2 px-3 text-sm outline-none focus:border-[#1E3A5F] appearance-none"
                        >
                            <option value="All">All Genders</option>
                            <option value="Male">Male Only</option>
                            <option value="Female">Female Only</option>
                            <option value="Both">Both (Mixed)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
