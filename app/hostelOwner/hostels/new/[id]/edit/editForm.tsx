'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadDropzone } from '@/lib/uploadThing';
import { updateHostelBasicInfo } from './action';
import type { HostelForEdit } from '@/lib/data/ownerHostelList';

const FACILITIES_OPTIONS = [
    'Wi-Fi', 'CCTV Security', 'Backup Generator', 'Water 24/7', 'Common Room',
    'Study Area', 'Laundry Room', 'Parking', 'Kitchen', 'Security Guard',
    'Sports Ground', 'Rooftop Lounge', 'En-suite Bathrooms', 'Furnished Rooms',
]

interface ExistingPhoto {
    id: string
    url: string
}

interface NewPhoto {
    key: string
    url: string
}

export default function EditHostelForm({ hostelId, initial }: { hostelId: string; initial: HostelForEdit }) {
    const router = useRouter()
    const { hostel } = initial

    const [hostelName, setHostelName] = useState(hostel.name ?? '')
    const [address, setAddress] = useState(hostel.address ?? '')
    const [location, setLocation] = useState(hostel.area ?? '')
    const [distance, setDistance] = useState(
        hostel.distance_from_campus_km !== null && hostel.distance_from_campus_km !== undefined
            ? String(hostel.distance_from_campus_km)
            : ''
    )
    const [gender, setGender] = useState<'mixed' | 'male' | 'female'>(
        (hostel.gender_preference as 'mixed' | 'male' | 'female') ?? 'mixed'
    )
    const [description, setDescription] = useState(hostel.description ?? '')
    const [contactPhone, setContactPhone] = useState(hostel.contact_phone ?? '')
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(initial.facilities)

    const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
        initial.images.map((img) => ({ id: img.id, url: img.image_url }))
    )
    const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([])
    const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([])
    const [uploadError, setUploadError] = useState<string | null>(null)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [isPending, startTransition] = useTransition()

    const toggleFacility = (f: string) =>
        setSelectedFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

    const removeExistingPhoto = (id: string) => {
        setExistingPhotos(prev => prev.filter(p => p.id !== id))
        setRemovedPhotoIds(prev => [...prev, id])
    }

    const removeNewPhoto = (key: string) => setNewPhotos(prev => prev.filter(p => p.key !== key))

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (hostelName.trim() === '') newErrors.hostelName = 'Hostel name is required'
        if (address.trim() === '') newErrors.address = 'Address is required'
        if (location.trim() === '') newErrors.location = 'Location/area is required'
        if (distance.trim() === '') newErrors.distance = 'Distance from MUBAS is required'
        if (contactPhone.trim() === '') newErrors.contactPhone = 'Contact phone is required'
        if (description.trim() === '') newErrors.description = 'Description is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const save = () => {
        setSaveError(null)
        setSaved(false)
        if (!validate()) return

        startTransition(async () => {
            try {
                await updateHostelBasicInfo(hostelId, {
                    hostelName,
                    address,
                    location,
                    distance,
                    gender,
                    description,
                    contactPhone,
                    facilities: selectedFacilities,
                    keepImageIds: existingPhotos.map(p => p.id),
                    newPhotos: newPhotos.map(p => ({ url: p.url })),
                })
                setSaved(true)
                setNewPhotos([])
                router.refresh()
            } catch (err) {
                setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Header */}
            <div className="bg-white border-b border-[#E0D9CF] px-4 sm:px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-[#1A1A1E]">Edit Hostel Listing</h1>
                        <p className="text-xs text-[#6B6B78] mt-0.5">Update your hostel&#39;s details, facilities, and photos</p>
                    </div>
                    <Link href="/hostelOwner/hostels" className="text-sm text-[#6B6B78] hover:text-[#1A1A1E]">← Back to My Hostels</Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {saved && (
                    <div className="bg-green-50 border border-green-200 rounded-sm px-4 py-3 text-sm text-green-700">
                        Changes saved.
                    </div>
                )}
                {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-600">
                        {saveError}
                    </div>
                )}

                {/* Basic info */}
                <div>
                    <h2 className="font-semibold text-[#1A1A1E] mb-4">Basic Info</h2>
                    <div className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Hostel Name <span className="text-red-400">*</span></label>
                                <input value={hostelName} onChange={e => setHostelName(e.target.value)} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.hostelName ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.hostelName && <p className="text-xs text-red-500 mt-1">{errors.hostelName}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Full Address <span className="text-red-400">*</span></label>
                                <input value={address} onChange={e => setAddress(e.target.value)} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.address ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Area / Neighbourhood <span className="text-red-400">*</span></label>
                                <input value={location} onChange={e => setLocation(e.target.value)} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.location ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Distance from MUBAS (km) <span className="text-red-400">*</span></label>
                                <input type="number" step="0.1" min="0" value={distance} onChange={e => setDistance(e.target.value)} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.distance ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.distance && <p className="text-xs text-red-500 mt-1">{errors.distance}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Contact Phone <span className="text-red-400">*</span></label>
                                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.contactPhone ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Gender Policy</label>
                                <select value={gender} onChange={e => setGender(e.target.value as typeof gender)} className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]">
                                    <option value="mixed">Mixed (male & female)</option>
                                    <option value="male">Male only</option>
                                    <option value="female">Female only</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Hostel Description <span className="text-red-400">*</span></label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={500} className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none resize-none ${errors.description ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                <p className="text-[10px] text-[#6B6B78] mt-1">{description.length}/500 characters</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Facilities */}
                <div>
                    <h2 className="font-semibold text-[#1A1A1E] mb-3">Hostel Facilities</h2>
                    <div className="flex flex-wrap gap-2">
                        {FACILITIES_OPTIONS.map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => toggleFacility(f)}
                                className={`text-xs px-3 py-1.5 rounded-sm border transition-all ${selectedFacilities.includes(f) ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B6B78] border-[#E0D9CF] hover:border-[#1E3A5F]/40'}`}
                            >
                                {selectedFacilities.includes(f) ? '✓ ' : ''}{f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Photos */}
                <div>
                    <h2 className="font-semibold text-[#1A1A1E] mb-1">Hostel Photos</h2>
                    <p className="text-xs text-[#6B6B78] mb-4">Remove outdated photos or add new ones. Up to 10 photos, 16MB each.</p>

                    {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-4 text-xs text-red-600">{uploadError}</div>
                    )}

                    <div className="mb-6">
                        <UploadDropzone
                            endpoint="hostelImages"
                            onClientUploadComplete={(res) => {
                                setUploadError(null)
                                setNewPhotos(prev => [...prev, ...res.map(f => ({ url: f.url, key: f.key }))])
                            }}
                            onUploadError={(error) => setUploadError(error.message)}
                            className="border-2 border-dashed border-[#E0D9CF] hover:border-[#1E3A5F]/40 bg-white ut-label:text-sm ut-label:text-[#1A1A1E] ut-allowed-content:text-[#6B6B78] ut-button:bg-[#1E3A5F] ut-button:hover:bg-[#162d4a] rounded-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingPhotos.map((photo, i) => (
                            <div key={photo.id} className="relative group rounded-sm overflow-hidden bg-[#EEE9E0] aspect-video">
                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                {i === 0 && <span className="absolute top-2 left-2 text-[10px] bg-[#C49A2A] text-white px-2 py-0.5 rounded-sm">Cover</span>}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeExistingPhoto(photo.id)} className="bg-white text-red-500 rounded-sm w-7 h-7 flex items-center justify-center text-xs hover:bg-red-50">✕</button>
                                </div>
                            </div>
                        ))}
                        {newPhotos.map((photo) => (
                            <div key={photo.key} className="relative group rounded-sm overflow-hidden bg-[#EEE9E0] aspect-video">
                                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                <span className="absolute top-2 left-2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-sm">New</span>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeNewPhoto(photo.key)} className="bg-white text-red-500 rounded-sm w-7 h-7 flex items-center justify-center text-xs hover:bg-red-50">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {existingPhotos.length === 0 && newPhotos.length === 0 && (
                        <p className="text-xs text-[#6B6B78] mt-3">No photos yet.</p>
                    )}
                </div>

                {/* Save */}
                <div className="flex gap-3 pt-6 border-t border-[#E0D9CF]">
                    <Link href="/hostelOwner/hostels" className="border border-[#E0D9CF] text-[#6B6B78] px-5 py-2.5 text-sm rounded-sm hover:bg-[#EEE9E0]">Cancel</Link>
                    <div className="flex-1" />
                    <button onClick={save} disabled={isPending} className="bg-[#1E3A5F] text-white px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-[#162d4a] disabled:opacity-60">
                        {isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}