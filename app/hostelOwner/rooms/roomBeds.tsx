'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addRoom, toggleRoomStatus, toggleBedStatus } from './action';
import type { OwnerRoom } from '@/lib/data/ownerHostelList';

const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Quad', 'Studio']

interface Props {
    hostels: { id: string; name: string }[]
    rooms: OwnerRoom[]
}

function BedDot({ status, occupied }: { status: string; occupied: boolean }) {
    let color = 'bg-green-400'
    let title = 'Available'
    if (status !== 'ACTIVE') {
        color = 'bg-yellow-400'
        title = 'Inactive'
    } else if (occupied) {
        color = 'bg-red-300'
        title = 'Booked'
    }
    return <div className={`w-3 h-3 rounded-sm ${color}`} title={title} />
}

function RoomRow({ room, onChanged }: { room: OwnerRoom; onChanged: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [bedPending, setBedPending] = useState<string | null>(null)

    const availableCount = room.beds.filter(b => b.status === 'ACTIVE' && !b.occupied).length
    const isActive = room.status === 'ACTIVE'

    const handleToggleRoom = () => {
        setError(null)
        startTransition(async () => {
            try {
                await toggleRoomStatus(room.id)
                onChanged()
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong')
            }
        })
    }

    const handleToggleBed = (bedId: string) => {
        setError(null)
        setBedPending(bedId)
        startTransition(async () => {
            try {
                await toggleBedStatus(bedId)
                onChanged()
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong')
            } finally {
                setBedPending(null)
            }
        })
    }

    return (
        <div className="border border-[#E0D9CF] rounded-sm overflow-hidden mb-3 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-[#EEE9E0] rounded-sm overflow-hidden shrink-0">
                        {room.thumbnail ? (
                            <img src={room.thumbnail} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6B6B78] text-[10px]">No photo</div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[#1A1A1E]">{room.name}</span>
                            <span className="text-[10px] bg-[#EEE9E0] text-[#6B6B78] px-2 py-0.5 rounded-sm">{room.type ?? '—'}</span>
                            {!isActive && <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-sm">Inactive</span>}
                        </div>
                        <p className="text-xs text-[#6B6B78] mt-0.5">
                            {room.beds.length} bed{room.beds.length !== 1 ? 's' : ''} · {availableCount} available · MK {room.price.toLocaleString()}/mo per bed
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="flex gap-1 hidden sm:flex">
                        {room.beds.map(b => <BedDot key={b.id} status={b.status} occupied={b.occupied} />)}
                    </div>
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="text-xs text-[#1E3A5F] border border-[#1E3A5F] px-3 py-1.5 rounded-sm hover:bg-[#EEE9E0] hidden sm:block"
                    >
                        Manage Beds
                    </button>
                    <button
                        onClick={handleToggleRoom}
                        disabled={isPending}
                        className={`text-xs border px-3 py-1.5 rounded-sm disabled:opacity-50 ${isActive ? 'text-red-500 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                    >
                        {isPending ? '…' : isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => setExpanded(e => !e)} className="text-[#6B6B78]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Manage Beds button */}
            {expanded && (
                <div className="sm:hidden px-4 py-2 border-t border-[#E0D9CF] bg-[#F9F8F6]">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="w-full text-xs text-[#1E3A5F] border border-[#1E3A5F] px-3 py-1.5 rounded-sm hover:bg-white"
                    >
                        Manage Beds
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}

            {expanded && (
                <div className="border-t border-[#E0D9CF] bg-[#F9F8F6] p-4">
                    <p className="text-[10px] text-[#6B6B78] mb-3">A booked bed can&#39;t be disabled here — cancel or complete its booking first.</p>
                    <div className="space-y-2">
                        {room.beds.map(bed => (
                            <div key={bed.id} className="flex items-center justify-between bg-white border border-[#E0D9CF] rounded-sm px-3 py-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-[#EEE9E0] rounded-sm flex items-center justify-center text-[10px] font-semibold text-[#1E3A5F]">
                                        {bed.label.replace('Bed ', '')}
                                    </div>
                                    <span className="text-sm text-[#1A1A1E]">{bed.label}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium ${bed.status !== 'ACTIVE' ? 'bg-yellow-50 text-yellow-700' : bed.occupied ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {bed.status !== 'ACTIVE' ? 'Inactive' : bed.occupied ? 'Booked' : 'Available'}
                  </span>
                                </div>
                                <button
                                    onClick={() => handleToggleBed(bed.id)}
                                    disabled={bed.occupied || bedPending === bed.id}
                                    className="text-xs text-[#1E3A5F] border border-[#1E3A5F] px-2.5 py-1 rounded-sm hover:bg-[#EEE9E0] disabled:opacity-40"
                                >
                                    {bedPending === bed.id ? '…' : bed.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function AddRoomModal({ hostelId, onClose, onAdded }: { hostelId: string; onClose: () => void; onAdded: () => void }) {
    const [name, setName] = useState('')
    const [type, setType] = useState('Double')
    const [bedCount, setBedCount] = useState('2')
    const [price, setPrice] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const submit = () => {
        setError(null)
        startTransition(async () => {
            try {
                await addRoom({ hostelId, name, type, bedCount: Number(bedCount), price })
                onAdded()
                onClose()
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong')
            }
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-6">
                <h2 className="font-serif text-xl text-[#1A1A1E] mb-5">Add New Room</h2>

                {error && <div className="bg-red-50 border border-red-200 rounded-sm px-3 py-2 mb-4 text-xs text-red-600">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Room Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Room 301" className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Room Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]">
                                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Number of Beds</label>
                            <input type="number" min={1} max={16} value={bedCount} onChange={e => setBedCount(e.target.value)} className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#1A1A1E] mb-1.5">Price per Bed (MK / month)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 25000" className="w-full border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]" />
                        <p className="text-[10px] text-[#6B6B78] mt-1">Every bed in this room is booked at this same price.</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 border border-[#E0D9CF] text-[#6B6B78] py-2.5 text-sm rounded-sm hover:bg-[#F9F8F6]">Cancel</button>
                    <button onClick={submit} disabled={isPending} className="flex-1 bg-[#1E3A5F] text-white py-2.5 text-sm font-medium rounded-sm hover:bg-[#162d4a] disabled:opacity-60">
                        {isPending ? 'Adding…' : 'Add Room'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function RoomsBedsClient({ hostels, rooms }: Props) {
    const router = useRouter()
    const [activeHostelId, setActiveHostelId] = useState(hostels[0]?.id ?? '')
    const [showAddRoom, setShowAddRoom] = useState(false)

    // Server actions already call revalidatePath('/hostelOwner/rooms'), which
    // invalidates the cache — router.refresh() is what actually re-runs this
    // route's Server Component and pushes fresh `rooms`/`hostels` props down
    // into this client tree without a full page reload.
    const onChanged = () => router.refresh()

    const visibleRooms = useMemo(
        () => rooms.filter(r => r.hostel_id === activeHostelId),
        [rooms, activeHostelId]
    )

    if (hostels.length === 0) {
        return (
            <div className="border-2 border-dashed border-[#E0D9CF] rounded-sm p-16 text-center">
                <p className="text-[#6B6B78] text-sm">Add a hostel first, then come back here to manage its rooms and beds.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-2xl text-[#1A1A1E]">Rooms & Beds</h1>
                    <p className="text-sm text-[#6B6B78] mt-0.5">Manage individual beds, prices, and availability per room.</p>
                </div>
                <button
                    onClick={() => setShowAddRoom(true)}
                    className="bg-[#1E3A5F] text-white text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-[#162d4a] transition-colors whitespace-nowrap"
                >
                    + Add Room
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {hostels.map(h => (
                    <button
                        key={h.id}
                        onClick={() => setActiveHostelId(h.id)}
                        className={`text-sm px-4 py-2 rounded-sm border whitespace-nowrap transition-colors ${activeHostelId === h.id ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#1A1A1E] border-[#E0D9CF] hover:border-[#1E3A5F]/40'}`}
                    >
                        {h.name}
                    </button>
                ))}
            </div>

            {visibleRooms.length === 0 ? (
                <div className="border-2 border-dashed border-[#E0D9CF] rounded-sm p-12 text-center">
                    <p className="text-[#6B6B78] text-sm mb-3">No rooms in this hostel yet</p>
                    <button onClick={() => setShowAddRoom(true)} className="bg-[#1E3A5F] text-white text-sm px-5 py-2 rounded-sm hover:bg-[#162d4a]">Add First Room</button>
                </div>
            ) : (
                visibleRooms.map(room => <RoomRow key={room.id} room={room} onChanged={onChanged} />)
            )}

            {showAddRoom && (
                <AddRoomModal hostelId={activeHostelId} onClose={() => setShowAddRoom(false)} onAdded={onChanged} />
            )}
        </div>
    )
}