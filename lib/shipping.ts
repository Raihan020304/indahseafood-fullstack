// lib/shipping.ts
import { ShippingOption } from '@/types'

// Koordinat toko (Jakarta Utara - area Muara Baru/Muara Angke)
const STORE_LAT = parseFloat(process.env.NEXT_PUBLIC_STORE_LAT || '-6.1351')
const STORE_LNG = parseFloat(process.env.NEXT_PUBLIC_STORE_LNG || '106.8133')

// Hitung jarak antara dua koordinat (Haversine formula)
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // radius bumi km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// GoSend tarif (estimasi - sesuai tarif real GoSend Jakarta)
function calculateGoSendPrice(distanceKm: number, weightGram: number): number {
  const BASE_INSTANT = 13000
  const PER_KM_INSTANT = 2500

  let price = BASE_INSTANT + Math.ceil(distanceKm) * PER_KM_INSTANT

  // Surcharge berat (GoSend: > 5kg tambah per kg)
  if (weightGram > 5000) {
    price += Math.ceil((weightGram - 5000) / 1000) * 2000
  }

  return Math.round(price / 1000) * 1000 // bulatkan ke ribuan
}

// GrabExpress tarif
function calculateGrabPrice(distanceKm: number, weightGram: number): number {
  const BASE = 15000
  const PER_KM = 3000

  let price = BASE + Math.ceil(distanceKm) * PER_KM

  if (weightGram > 3000) {
    price += Math.ceil((weightGram - 3000) / 1000) * 2500
  }

  return Math.round(price / 1000) * 1000
}

interface GetShippingRatesParams {
  destinationLat: number
  destinationLng: number
  weightGram: number
}

// Dalam produksi: panggil GoSend API / Goapix API
// Untuk sekarang: kalkulasi estimasi berdasarkan jarak & berat
export async function getShippingRates({
  destinationLat,
  destinationLng,
  weightGram,
}: GetShippingRatesParams): Promise<ShippingOption[]> {
  const distance = calculateDistance(
    STORE_LAT, STORE_LNG,
    destinationLat, destinationLng
  )

  const distanceRounded = Math.round(distance * 10) / 10

  // Validasi: GoSend max 25 km, GrabExpress max 30 km
  const options: ShippingOption[] = []

  if (distance <= 25) {
    options.push({
      provider: 'gosend',
      serviceType: 'instant',
      serviceName: 'GoSend Instant',
      price: calculateGoSendPrice(distance, weightGram),
      estimatedTime: distance <= 5
        ? '15-30 menit'
        : distance <= 15
        ? '30-60 menit'
        : '60-90 menit',
      distance: distanceRounded,
    })
  }

  if (distance <= 30) {
    options.push({
      provider: 'grabexpress',
      serviceType: 'instant',
      serviceName: 'GrabExpress Instant',
      price: calculateGrabPrice(distance, weightGram),
      estimatedTime: distance <= 5
        ? '20-35 menit'
        : distance <= 15
        ? '35-60 menit'
        : '60-90 menit',
      distance: distanceRounded,
    })
  }

  if (options.length === 0) {
    throw new Error('Lokasi terlalu jauh dari toko kami (max 30 km)')
  }

  return options
}

// Geocode alamat ke koordinat (menggunakan nominatim OpenStreetMap - gratis)
export async function geocodeAddress(address: string): Promise<{
  lat: number
  lng: number
  displayName: string
} | null> {
  try {
    const query = encodeURIComponent(`${address}, Jakarta, Indonesia`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'IndahSeafood/1.0' } }
    )
    const data = await res.json()
    if (!data || data.length === 0) return null
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    }
  } catch {
    return null
  }
}
