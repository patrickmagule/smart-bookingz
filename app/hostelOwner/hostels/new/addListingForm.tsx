'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUploadThing } from '@/lib/uploadThing'
import { createHostelListing } from './actions';
import LocationPicker from '@/components/owner/LocationPicker'
import { distanceFromMubasKm } from '@/lib/geo'

type Step = 'basic' | 'rooms' | 'photos' | 'pricing' | 'review';

interface BedDraft {
    label: string
}

interface RoomDraft {
    id: string
    name: string
    type: string
    price: string        // price for the WHOLE room — every bed in it shares this
    beds: BedDraft[]
    amenities: string[]
    description: string
}

interface PhotoDraft {
    url: string
    key: string
}

interface PendingUpload {
    id: string
    file: File
    previewUrl: string
}

const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Quad', 'Studio']
const FACILITIES_OPTIONS = [
    'Wi-Fi', 'CCTV Security', 'Backup Generator', 'Water 24/7', 'Common Room',
    'Study Area', 'Laundry Room', 'Parking', 'Kitchen', 'Security Guard',
    'Sports Ground', 'Rooftop Lounge', 'En-suite Bathrooms', 'Furnished Rooms',
]
const AMENITY_OPTIONS = ['Wardrobe', 'Study Desk', 'Fan', 'AC', 'Window', 'Private Bathroom', 'Shared Bathroom', 'Mini Fridge', 'Bookshelf']

const STEPS: { key: Step; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'rooms', label: 'Rooms & Beds' },
    { key: 'photos', label: 'Photos' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'review', label: 'Review & Submit' },
]

function StepIndicator({ current }: { current: Step }) {
    const idx = STEPS.findIndex(s => s.key === current)
    return (
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${i < idx ? 'bg-green-600 text-white' : i === idx ? 'bg-[#1E3A5F] text-white' : 'bg-[#EEE9E0] text-[#6B6B78]'}`}>
                            {i < idx ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 whitespace-nowrap ${i === idx ? 'text-[#1E3A5F] font-semibold' : 'text-[#6B6B78]'}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`w-10 sm:w-16 h-px mx-1 mt-[-10px] ${i < idx ? 'bg-green-400' : 'bg-[#E0D9CF]'}`} />}
                </div>
            ))}
        </div>
    )
}

export default function AddListingForm() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('basic')

    // Basic info
    const [hostelName, setHostelName] = useState('')
    const [address, setAddress] = useState('')
    const [location, setLocation] = useState('')
    const [distance, setDistance] = useState('')
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [gender, setGender] = useState<'mixed' | 'male' | 'female'>('mixed')
    const [description, setDescription] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])

    // Rooms
    const [rooms, setRooms] = useState<RoomDraft[]>([])
    const [editingRoom, setEditingRoom] = useState<string | null>(null)

    // Photos — real UploadThing uploads, URLs only
    const [photos, setPhotos] = useState<PhotoDraft[]>([])
    const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { startUpload, isUploading } = useUploadThing('hostelImages', {
        onClientUploadComplete: (res) => {
            setUploadError(null)
            setPhotos(prev => [
                ...prev,
                ...res.map(f => ({ url: f.url, key: f.key })),
            ])
            setPendingUploads(prev => {
                prev.forEach(p => URL.revokeObjectURL(p.previewUrl))
                return []
            })
        },
        onUploadError: (error) => {
            setUploadError(error.message)
            setPendingUploads(prev => {
                prev.forEach(p => URL.revokeObjectURL(p.previewUrl))
                return []
            })
        },
    })

    const handleFilesPicked = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return
        const files = Array.from(fileList)
        setUploadError(null)
        // Instant local previews — independent of the network request,
        // so the user sees proof a file was picked even if the upload
        // itself is slow or fails.
        setPendingUploads(prev => [
            ...prev,
            ...files.map(file => ({
                id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ])
        startUpload(files)
    }

    // Errors / submission
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [isPending, startTransition] = useTransition()

    const toggleFacility = (f: string) =>
        setSelectedFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

    const addRoom = () => {
        const id = `r-${Date.now()}`
        setRooms(prev => [...prev, {
            id,
            name: `Room ${prev.length + 1}`,
            type: 'Single',
            price: '',
            beds: [{ label: 'Bed A' }],
            amenities: [],
            description: '',
        }])
        setEditingRoom(id)
    }

    const removeRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id))

    const updateRoom = (id: string, field: keyof RoomDraft, value: unknown) =>
        setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))

    const addBed = (roomId: string) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r
            const labels = 'ABCDEFGHIJKLMNOP'.split('')
            const label = `Bed ${labels[r.beds.length] ?? r.beds.length + 1}`
            return { ...r, beds: [...r.beds, { label }] }
        }))
    }

    const removeBed = (roomId: string, bedIdx: number) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r
            return { ...r, beds: r.beds.filter((_, i) => i !== bedIdx) }
        }))
    }

    const updateBedLabel = (roomId: string, bedIdx: number, label: string) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r
            const beds = r.beds.map((b, i) => i === bedIdx ? { ...b, label } : b)
            return { ...r, beds }
        }))
    }

    const toggleAmenity = (roomId: string, amenity: string) => {
        setRooms(prev => prev.map(r => {
            if (r.id !== roomId) return r
            const amenities = r.amenities.includes(amenity)
                ? r.amenities.filter(a => a !== amenity)
                : [...r.amenities, amenity]
            return { ...r, amenities }
        }))
    }

    const removePhoto = (key: string) => setPhotos(prev => prev.filter(p => p.key !== key))
    const makeCover = (key: string) =>
        setPhotos(prev => {
            const target = prev.find(p => p.key === key)
            if (!target) return prev
            return [target, ...prev.filter(p => p.key !== key)]
        })

    const validateBasic = () => {
        const e: Record<string, string> = {}
        if (!hostelName.trim()) e.hostelName = 'Hostel name is required'
        if (!address.trim()) e.address = 'Address is required'
        if (!location.trim()) e.location = 'Location/area is required'
        if (!contactPhone.trim()) e.contactPhone = 'Contact phone is required'
        if (!description.trim()) e.description = 'Description is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const validateRooms = () => {
        if (rooms.length === 0) {
            setErrors({ rooms: 'Add at least one room' })
            return false
        }
        for (const room of rooms) {
            if (room.beds.length === 0) {
                setErrors({ rooms: `${room.name} must have at least one bed` })
                return false
            }
            if (!room.price || Number(room.price) <= 0) {
                setErrors({ rooms: `${room.name} needs a valid monthly price` })
                return false
            }
        }
        setErrors({})
        return true
    }

    const next = () => {
        const order: Step[] = ['basic', 'rooms', 'photos', 'pricing', 'review']
        const idx = order.indexOf(step)

        if (step === 'basic' && !validateBasic()) return
        if (step === 'rooms' && !validateRooms()) return

        if (idx < order.length - 1) setStep(order[idx + 1])
    }

    const back = () => {
        const order: Step[] = ['basic', 'rooms', 'photos', 'pricing', 'review']
        const idx = order.indexOf(step)
        if (idx > 0) setStep(order[idx - 1])
    }

    const submit = () => {
        setSubmitError(null)
        startTransition(async () => {
            try {
                await createHostelListing({
                    hostelName,
                    address,
                    location,
                    distance,
                    latitude,
                    longitude,
                    gender,
                    description,
                    contactPhone,
                    facilities: selectedFacilities,
                    rooms: rooms.map(r => ({
                        name: r.name,
                        type: r.type,
                        description: r.description,
                        amenities: r.amenities,
                        price: r.price,
                        beds: r.beds.map(b => ({ label: b.label })),
                    })),
                    photos: photos.map((p, i) => ({ url: p.url, isPrimary: i === 0, key: p.key })),
                })
                setSubmitted(true)
            } catch (err) {
                setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
            }
        })
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4">
                <div className="max-w-lg w-full text-center">
                    <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12L10 17L19 7" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="font-serif text-2xl text-[#1A1A1E] mb-2">Listing Submitted for Review</h1>
                    <p className="text-sm text-[#6B6B78] mb-8 max-w-sm mx-auto leading-relaxed">
                        <strong className="text-[#1A1A1E]">{hostelName}</strong> has been submitted. An administrator will review and approve your listing within 1–2 working days before it goes live.
                    </p>
                    <div className="bg-white border border-[#E0D9CF] rounded-sm p-5 text-left mb-8">
                        <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-3">Listing Summary</p>
                        {[
                            ['Hostel Name', hostelName],
                            ['Location', location],
                            ['Distance from MUBAS', `${distance} km`],
                            ['Gender Policy', gender.charAt(0).toUpperCase() + gender.slice(1)],
                            ['Total Rooms', rooms.length],
                            ['Total Beds', rooms.reduce((s, r) => s + r.beds.length, 0)],
                        ].map(([k, v]) => (
                            <div key={String(k)} className="flex justify-between text-sm py-1.5 border-b border-[#E0D9CF] last:border-0">
                                <span className="text-[#6B6B78]">{k}</span>
                                <span className="font-medium text-[#1A1A1E]">{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => router.push('/hostelOwner')} className="bg-[#1E3A5F] text-white px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-[#162d4a]">Go to Dashboard</button>
                        <button
                            onClick={() => {
                                setSubmitted(false)
                                setStep('basic')
                                setHostelName(''); setAddress(''); setLocation(''); setDistance('')
                                setGender('mixed'); setDescription(''); setContactPhone('')
                                setSelectedFacilities([]); setRooms([]); setPhotos([]); setPendingUploads([])
                            }}
                            className="border border-[#E0D9CF] text-[#6B6B78] px-5 py-2.5 text-sm rounded-sm hover:bg-[#EEE9E0]"
                        >
                            Add Another Listing
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9F8F6]">
            {/* Header */}
            <div className="bg-white border-b border-[#E0D9CF] px-4 sm:px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-[#1A1A1E]">Add New Hostel Listing</h1>
                        <p className="text-xs text-[#6B6B78] mt-0.5">Complete all steps to submit your listing for admin approval</p>
                    </div>
                    <Link href="/hostelOwner" className="text-sm text-[#6B6B78] hover:text-[#1A1A1E]">← Back to Dashboard</Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <StepIndicator current={step} />

                {/* ---- STEP: BASIC INFO ---- */}
                {step === 'basic' && (
                    <div className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Hostel Name <span className="text-red-400">*</span></label>
                                <input value={hostelName} onChange={e => setHostelName(e.target.value)} placeholder="e.g. Sunrise Student Lodge" className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.hostelName ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.hostelName && <p className="text-xs text-red-500 mt-1">{errors.hostelName}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Full Address <span className="text-red-400">*</span></label>
                                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Plot 45, Chichiri, Blantyre" className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.address ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Area / Neighbourhood <span className="text-red-400">*</span></label>
                                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Chichiri, Blantyre" className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.location ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Hostel Location on Map</label>
                                <LocationPicker
                                    value={latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null}
                                    onChange={(loc) => {
                                        setLatitude(loc.lat)
                                        setLongitude(loc.lng)
                                        setDistance(String(distanceFromMubasKm(loc.lat, loc.lng)))
                                    }}
                                />
                                {distance && (
                                    <p className="text-xs text-[#1E3A5F] font-medium mt-2">≈ {distance} km from MUBAS (auto-calculated)</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Contact Phone <span className="text-red-400">*</span></label>
                                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+265 991 000 000" className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none ${errors.contactPhone ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
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
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={500} placeholder="Describe your hostel — location benefits, security, utilities, rules, atmosphere..." className={`w-full border rounded-sm px-3 py-2.5 text-sm outline-none resize-none ${errors.description ? 'border-red-400' : 'border-[#E0D9CF] focus:border-[#1E3A5F]'}`} />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                <p className="text-[10px] text-[#6B6B78] mt-1">{description.length}/500 characters</p>
                            </div>
                        </div>

                        {/* Facilities */}
                        <div>
                            <label className="block text-xs font-medium text-[#1A1A1E] mb-3">Hostel Facilities</label>
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
                    </div>
                )}

                {/* ---- STEP: ROOMS & BEDS ---- */}
                {step === 'rooms' && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="font-semibold text-[#1A1A1E]">Rooms & Beds</h2>
                                <p className="text-xs text-[#6B6B78] mt-0.5">Set one monthly price per room — every bed in that room is booked at that same price.</p>
                            </div>
                            <button onClick={addRoom} className="bg-[#1E3A5F] text-white text-sm px-4 py-2 rounded-sm hover:bg-[#162d4a] flex items-center gap-1.5">
                                <span>+</span> Add Room
                            </button>
                        </div>
                        {errors.rooms && <p className="text-xs text-red-500 mb-3">{errors.rooms}</p>}

                        {rooms.length === 0 && (
                            <div className="border-2 border-dashed border-[#E0D9CF] rounded-sm p-12 text-center">
                                <p className="text-[#6B6B78] text-sm mb-3">No rooms added yet</p>
                                <button onClick={addRoom} className="bg-[#1E3A5F] text-white text-sm px-5 py-2 rounded-sm hover:bg-[#162d4a]">Add First Room</button>
                            </div>
                        )}

                        <div className="space-y-4 mt-4">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white border border-[#E0D9CF] rounded-sm overflow-hidden">
                                    {/* Room header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0D9CF] bg-[#F9F8F6]">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <input
                                                value={room.name}
                                                onChange={e => updateRoom(room.id, 'name', e.target.value)}
                                                className="font-semibold text-sm text-[#1A1A1E] bg-transparent border-b border-transparent focus:border-[#1E3A5F] outline-none w-32"
                                            />
                                            <select value={room.type} onChange={e => updateRoom(room.id, 'type', e.target.value)} className="text-xs border border-[#E0D9CF] rounded-sm px-2 py-1 outline-none">
                                                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                            <span className="text-xs text-[#6B6B78]">{room.beds.length} bed{room.beds.length !== 1 ? 's' : ''}</span>
                                            {room.price && (
                                                <span className="text-xs font-medium text-[#1E3A5F]">MK {Number(room.price).toLocaleString()}/mo</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingRoom(editingRoom === room.id ? null : room.id)} className="text-xs text-[#1E3A5F] border border-[#1E3A5F] px-2.5 py-1 rounded-sm hover:bg-[#EEE9E0]">
                                                {editingRoom === room.id ? 'Collapse' : 'Edit'}
                                            </button>
                                            <button onClick={() => removeRoom(room.id)} className="text-xs text-red-500 border border-red-200 px-2.5 py-1 rounded-sm hover:bg-red-50">Remove</button>
                                        </div>
                                    </div>

                                    {editingRoom === room.id && (
                                        <div className="p-4 space-y-4">
                                            {/* Room price — applies to every bed in the room */}
                                            <div className="bg-[#F9F8F6] border border-[#E0D9CF] rounded-sm p-3">
                                                <label className="text-xs font-medium text-[#1A1A1E] mb-1.5 block">Monthly price for this room <span className="text-red-400">*</span></label>
                                                <div className="flex items-center gap-2 max-w-xs">
                                                    <span className="text-xs text-[#6B6B78]">MK</span>
                                                    <input
                                                        type="number"
                                                        value={room.price}
                                                        onChange={e => updateRoom(room.id, 'price', e.target.value)}
                                                        placeholder="25000"
                                                        className="flex-1 border border-[#E0D9CF] rounded-sm px-2 py-1.5 text-sm outline-none focus:border-[#1E3A5F]"
                                                    />
                                                    <span className="text-xs text-[#6B6B78]">/month</span>
                                                </div>
                                                <p className="text-[10px] text-[#6B6B78] mt-1.5">Every bed below is booked individually, but all beds in this room share this price.</p>
                                            </div>

                                            {/* Room description */}
                                            <div>
                                                <label className="text-xs text-[#6B6B78] mb-1 block">Room description (optional)</label>
                                                <input value={room.description} onChange={e => updateRoom(room.id, 'description', e.target.value)} placeholder="e.g. Spacious room with large windows and balcony access" className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2 text-sm outline-none focus:border-[#1E3A5F]" />
                                            </div>

                                            {/* Amenities */}
                                            <div>
                                                <label className="text-xs text-[#6B6B78] mb-2 block">Room amenities</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {AMENITY_OPTIONS.map(a => (
                                                        <button key={a} type="button" onClick={() => toggleAmenity(room.id, a)}
                                                                className={`text-[10px] px-2.5 py-1 rounded-sm border transition-all ${room.amenities.includes(a) ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B6B78] border-[#E0D9CF] hover:border-[#1E3A5F]/40'}`}>
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Beds */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-medium text-[#1A1A1E]">Beds in this room</label>
                                                    <button onClick={() => addBed(room.id)} className="text-xs text-[#1E3A5F] border border-[#1E3A5F] px-2.5 py-1 rounded-sm hover:bg-[#EEE9E0]">+ Add Bed</button>
                                                </div>

                                                <div className="bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 mb-3">
                                                    <p className="text-[10px] text-amber-700">Each bed is a separate bookable space — a student books one specific bed, not the whole room. All beds here are booked at the room price above.</p>
                                                </div>

                                                <div className="space-y-2">
                                                    {room.beds.map((bed, i) => (
                                                        <div key={i} className="flex items-center gap-3 bg-[#F9F8F6] border border-[#E0D9CF] rounded-sm p-3">
                                                            <div className="w-8 h-8 bg-[#EEE9E0] rounded-sm flex items-center justify-center text-xs font-semibold text-[#1E3A5F] shrink-0">
                                                                {bed.label.replace('Bed ', '')}
                                                            </div>
                                                            <input
                                                                value={bed.label}
                                                                onChange={e => updateBedLabel(room.id, i, e.target.value)}
                                                                className="w-32 border border-[#E0D9CF] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#1E3A5F]"
                                                                placeholder="Bed A"
                                                            />
                                                            <span className="flex-1 text-xs text-[#6B6B78]">
                                {room.price ? `MK ${Number(room.price).toLocaleString()}/month (room price)` : 'Set the room price above'}
                              </span>
                                                            {room.beds.length > 1 && (
                                                                <button onClick={() => removeBed(room.id, i)} className="text-red-400 hover:text-red-600 shrink-0">
                                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                        <path d="M2 2L12 12M2 12L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Collapsed summary */}
                                    {editingRoom !== room.id && (
                                        <div className="px-4 py-3 flex flex-wrap gap-3">
                                            {room.beds.map((b, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-xs text-[#6B6B78]">
                                                    <div className="w-5 h-5 bg-green-50 border border-green-200 rounded-sm flex items-center justify-center text-[9px] font-semibold text-green-700">{b.label.replace('Bed ', '')}</div>
                                                    {b.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ---- STEP: PHOTOS ---- */}
                {step === 'photos' && (
                    <div>
                        <h2 className="font-semibold text-[#1A1A1E] mb-1">Hostel Photos</h2>
                        <p className="text-xs text-[#6B6B78] mb-6">Upload high-quality photos of your hostel exterior, common areas, and rooms. More photos attract more bookings. Up to 10 photos, 16MB each.</p>

                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-4 text-xs text-red-600">{uploadError}</div>
                        )}

                        {/* Real upload — hits /api/uploadthing via useUploadThing, only the
                            returned URL is kept. The hidden input + button gives us full
                            control over showing an instant local preview the moment a file
                            is picked, independent of whether the network upload succeeds. */}
                        <div className="mb-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    handleFilesPicked(e.target.files)
                                    e.target.value = ''
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full border-2 border-dashed border-[#E0D9CF] hover:border-[#1E3A5F]/40 bg-white rounded-sm py-10 text-center text-sm text-[#6B6B78] disabled:opacity-60 transition-colors"
                            >
                                {isUploading ? 'Uploading…' : '+ Click to choose photos'}
                            </button>
                        </div>

                        {/* Preview grid */}
                        <div>
                            <p className="text-xs font-medium text-[#6B6B78] uppercase tracking-wider mb-3">Preview ({photos.length} photos)</p>
                            {photos.length === 0 && pendingUploads.length === 0 ? (
                                <p className="text-xs text-[#6B6B78]">No photos uploaded yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {photos.map((photo, i) => (
                                        <div key={photo.key} className="relative group rounded-sm overflow-hidden bg-[#EEE9E0] aspect-video">
                                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {i === 0 ? (
                                                    <span className="absolute top-2 left-2 text-[10px] bg-[#C49A2A] text-white px-2 py-0.5 rounded-sm">Cover</span>
                                                ) : (
                                                    <button onClick={() => makeCover(photo.key)} className="bg-white text-[#1E3A5F] rounded-sm px-2 py-1 text-[10px] hover:bg-[#EEE9E0]">Make cover</button>
                                                )}
                                                <button onClick={() => removePhoto(photo.key)} className="bg-white text-red-500 rounded-sm w-7 h-7 flex items-center justify-center text-xs hover:bg-red-50">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingUploads.map(p => (
                                        <div key={p.id} className="relative rounded-sm overflow-hidden bg-[#EEE9E0] aspect-video">
                                            <img src={p.previewUrl} alt="" className="w-full h-full object-cover opacity-60" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[10px] bg-black/60 text-white px-2 py-1 rounded-sm">Uploading…</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-[#6B6B78] mt-3">The first photo is used as the cover image. Hover a photo to remove it or set it as the cover.</p>
                        </div>
                    </div>
                )}

                {/* ---- STEP: PRICING ---- */}
                {step === 'pricing' && (
                    <div>
                        <h2 className="font-semibold text-[#1A1A1E] mb-1">Pricing Summary</h2>
                        <p className="text-xs text-[#6B6B78] mb-6">Review and adjust each room&#39;s monthly price — it applies to every bed in that room.</p>

                        {rooms.length === 0 ? (
                            <div className="text-center py-10 text-[#6B6B78] text-sm">
                                <p>No rooms added yet. Go back to add rooms and set prices.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rooms.map(room => (
                                    <div key={room.id} className="bg-white border border-[#E0D9CF] rounded-sm p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="font-semibold text-sm text-[#1A1A1E]">{room.name}</span>
                                                <span className="ml-2 text-[10px] bg-[#EEE9E0] text-[#6B6B78] px-2 py-0.5 rounded-sm">{room.type}</span>
                                            </div>
                                            <span className="text-xs text-[#6B6B78]">{room.beds.length} bed{room.beds.length !== 1 ? 's' : ''}</span>
                                        </div>

                                        <div className="flex items-center justify-between bg-[#F9F8F6] border border-[#E0D9CF] rounded-sm px-3 py-2 mb-3">
                                            <span className="text-sm text-[#1A1A1E]">Price for this room</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#6B6B78]">MK</span>
                                                <input
                                                    type="number"
                                                    value={room.price}
                                                    onChange={e => updateRoom(room.id, 'price', e.target.value)}
                                                    className="w-28 border border-[#E0D9CF] rounded-sm px-2 py-1 text-sm text-right outline-none focus:border-[#1E3A5F]"
                                                />
                                                <span className="text-xs text-[#6B6B78]">/mo</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {room.beds.map((bed, i) => (
                                                <span key={i} className="text-[10px] bg-[#EEE9E0] text-[#1A1A1E] px-2.5 py-1 rounded-sm">{bed.label}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Price summary */}
                                <div className="bg-[#EEE9E0] border border-[#E0D9CF] rounded-sm p-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[#6B6B78]">Total beds available</span>
                                        <span className="font-semibold text-[#1A1A1E]">{rooms.reduce((s, r) => s + r.beds.length, 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6B6B78]">Lowest priced room</span>
                                        <span className="font-semibold text-[#1E3A5F]">
                      {(() => {
                          const prices = rooms.map(r => Number(r.price)).filter(p => p > 0)
                          return prices.length > 0 ? `MK ${Math.min(...prices).toLocaleString()}/mo` : '—'
                      })()}
                    </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ---- STEP: REVIEW ---- */}
                {step === 'review' && (
                    <div>
                        <h2 className="font-semibold text-[#1A1A1E] mb-1">Review Your Listing</h2>
                        <p className="text-xs text-[#6B6B78] mb-6">Check everything is correct before submitting for admin approval.</p>

                        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6 text-xs text-amber-800">
                            <strong>Note:</strong> After submission, an administrator will verify your listing details and photos before it appears publicly. This protects students from fraudulent listings.
                        </div>

                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6 text-xs text-red-600">{submitError}</div>
                        )}

                        <div className="space-y-4">
                            <div className="bg-white border border-[#E0D9CF] rounded-sm p-5">
                                <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-3">Hostel Details</p>
                                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {[
                                        ['Name', hostelName],
                                        ['Location', location],
                                        ['Address', address],
                                        ['Distance from MUBAS', `${distance} km`],
                                        ['Gender policy', gender],
                                        ['Contact', contactPhone],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between border-b border-[#E0D9CF] py-1.5 text-sm">
                                            <span className="text-[#6B6B78]">{k}</span>
                                            <span className="font-medium text-[#1A1A1E] text-right ml-4">{v || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-[#E0D9CF] rounded-sm p-5">
                                <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-3">Rooms & Beds ({rooms.length} rooms · {rooms.reduce((s, r) => s + r.beds.length, 0)} beds)</p>
                                {rooms.map(room => (
                                    <div key={room.id} className="mb-3 last:mb-0 pb-3 border-b border-[#E0D9CF] last:border-0">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-[#1A1A1E]">{room.name} <span className="font-normal text-[#6B6B78]">({room.type})</span></span>
                                            <span className="font-medium text-[#1E3A5F]">{room.price ? `MK ${Number(room.price).toLocaleString()}/mo` : 'No price'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {room.beds.map((b, i) => (
                                                <span key={i} className="text-[10px] bg-[#EEE9E0] text-[#1A1A1E] px-2.5 py-1 rounded-sm">{b.label}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {photos.length > 0 && (
                                <div className="bg-white border border-[#E0D9CF] rounded-sm p-5">
                                    <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-3">Photos ({photos.length})</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {photos.map((p, i) => (
                                            <div key={p.key} className="relative aspect-square rounded-sm overflow-hidden bg-[#EEE9E0]">
                                                <img src={p.url} alt="" className="w-full h-full object-cover" />
                                                {i === 0 && <span className="absolute top-1 left-1 text-[8px] bg-[#C49A2A] text-white px-1.5 py-0.5 rounded-sm">Cover</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedFacilities.length > 0 && (
                                <div className="bg-white border border-[#E0D9CF] rounded-sm p-5">
                                    <p className="text-xs font-semibold text-[#6B6B78] uppercase tracking-wider mb-3">Facilities ({selectedFacilities.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedFacilities.map(f => (
                                            <span key={f} className="text-xs bg-[#EEE9E0] text-[#1A1A1E] px-2.5 py-1 rounded-sm">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-[#E0D9CF]">
                    {step !== 'basic' && (
                        <button onClick={back} disabled={isPending} className="border border-[#E0D9CF] text-[#6B6B78] px-5 py-2.5 text-sm rounded-sm hover:bg-[#EEE9E0] disabled:opacity-50">← Back</button>
                    )}
                    <div className="flex-1" />
                    {step !== 'review' ? (
                        <button onClick={next} className="bg-[#1E3A5F] text-white px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-[#162d4a]">Continue →</button>
                    ) : (
                        <button onClick={submit} disabled={isPending} className="bg-[#C49A2A] text-white px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-[#a8841f] disabled:opacity-60">
                            {isPending ? 'Submitting…' : 'Submit for Approval'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}