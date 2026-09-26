const MUBAS = { lat: -15.801346118270276, lng: 35.02838775495957 };

function toRad(deg: number) { return (deg * Math.PI) / 180; }

export function distanceFromMubasKm(lat: number, lng: number): number {
    const R = 6371;
    const dLat = toRad(lat - MUBAS.lat);
    const dLon = toRad(lng - MUBAS.lng);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(MUBAS.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}