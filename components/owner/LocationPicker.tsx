'use client';

import { useEffect, useRef, useState } from 'react';

type LatLng = { lat: number; lng: number };

interface LocationPickerProps {
    value: LatLng | null;
    onChange: (loc: LatLng) => void;
}

const BLANTYRE_CENTER = { lat: -15.7861, lng: 35.0058 };

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const mapDivRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const mapRef = useRef<google.maps.Map | null>(null)
    const markerRef = useRef<google.maps.Marker | null>(null)
    const [ready, setReady] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [locating, setLocating] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function init() {
            const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            if (!key) {
                setLoadError('Map is not configured (missing Google Maps API key).')
                return
            }

            // v2 of @googlemaps/js-api-loader dropped the `Loader` class in
            // favor of this functional API: setOptions() once, then
            // importLibrary() per library, each returning that library's
            // exported classes directly.
            const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader')
            setOptions({ key, v: 'weekly' })

            const { Map } = await importLibrary('maps')
            const { Marker } = await importLibrary('marker')
            const { Autocomplete } = await importLibrary('places')

            if (cancelled || !mapDivRef.current) return

            const start = value ?? BLANTYRE_CENTER
            const map = new Map(mapDivRef.current, {
                center: start,
                zoom: value ? 16 : 13,
                streetViewControl: false,
                mapTypeControl: false,
            })
            const marker = new Marker({ position: start, map, draggable: true })

            marker.addListener('dragend', () => {
                const pos = marker.getPosition()
                if (pos) onChange({ lat: pos.lat(), lng: pos.lng() })
            })
            map.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (!e.latLng) return
                marker.setPosition(e.latLng)
                onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            })

            if (searchInputRef.current) {
                const autocomplete = new Autocomplete(searchInputRef.current, {
                    fields: ['geometry'],
                    componentRestrictions: { country: 'mw' },
                })
                autocomplete.bindTo('bounds', map)
                autocomplete.addListener('place_changed', () => {
                    const loc = autocomplete.getPlace().geometry?.location
                    if (!loc) return
                    map.setCenter(loc)
                    map.setZoom(16)
                    marker.setPosition(loc)
                    onChange({ lat: loc.lat(), lng: loc.lng() })
                })
            }

            mapRef.current = map
            markerRef.current = marker
            setReady(true)
        }

        init()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Re-sync pin if `value` changes from outside (e.g. after "Use my location")
    useEffect(() => {
        if (!ready || !value || !mapRef.current || !markerRef.current) return
        markerRef.current.setPosition(value)
        mapRef.current.panTo(value)
    }, [value, ready])

    const useMyLocation = () => {
        setLocationError(null)
        if (!navigator.geolocation) {
            setLocationError("Your browser doesn't support location capture — search on the map instead.")
            return
        }
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            setLocationError("Location capture needs a secure connection (https). Search on the map instead.")
            return
        }
        setLocating(true)

        const onError = (err: GeolocationPositionError) => {
            console.error('Geolocation error:', err.code, err.message)
            if (err.code === err.PERMISSION_DENIED) {
                setLocationError('Location permission denied — enable it for this site in your browser settings, or search on the map instead.')
                setLocating(false)
                return
            }
            if (err.code === err.TIMEOUT) {
                // Retry once with lower accuracy — often succeeds faster indoors/on laptops
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                        setLocating(false)
                    },
                    (err2) => {
                        console.error('Geolocation retry error:', err2.code, err2.message)
                        setLocationError("Couldn't get a location fix in time — search on the map instead.")
                        setLocating(false)
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
                )
                return
            }
            // POSITION_UNAVAILABLE
            setLocationError("Your device couldn't determine your location (often means the connection isn't secure/HTTPS, or location services are off) — search on the map instead.")
            setLocating(false)
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setLocating(false)
            },
            onError,
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                    ref={searchInputRef}
                    placeholder="Search for the hostel's address or area…"
                    className="flex-1 border border-[#E0D9CF] rounded-sm px-3 py-2.5 text-sm outline-none focus:border-[#1E3A5F]"
                />
                <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="text-xs bg-[#1E3A5F] text-white px-3 py-2.5 rounded-sm hover:bg-[#162d4a] disabled:opacity-60 whitespace-nowrap"
                >
                    {locating ? 'Locating…' : '📍 Use My Current Location'}
                </button>
            </div>
            {locationError && <p className="text-xs text-red-500 mb-2">{locationError}</p>}
            {loadError ? (
                <p className="text-xs text-red-500">{loadError}</p>
            ) : (
                <div ref={mapDivRef} className="w-full h-64 rounded-sm border border-[#E0D9CF] bg-[#EEE9E0]" />
            )}
            <p className="text-[10px] text-[#6B6B78] mt-1.5">
                Search or use your current location, then drag the pin if it&#39;s not exact. Not at the hostel right now? Leave this blank — you can set it later.
            </p>
        </div>
    )
}