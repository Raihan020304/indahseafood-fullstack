// app/api/shipping/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, getShippingRates } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  try {
    const { address, weightGram } = await req.json()

    if (!address || !weightGram) {
      return NextResponse.json({ error: 'Alamat dan berat wajib diisi' }, { status: 400 })
    }

    // Geocode alamat
    const geo = await geocodeAddress(address)
    if (!geo) {
      return NextResponse.json(
        { error: 'Alamat tidak ditemukan. Pastikan nama jalan dan kecamatan sudah benar.' },
        { status: 400 }
      )
    }

    // Hitung ongkir
    const options = await getShippingRates({
      destinationLat: geo.lat,
      destinationLng: geo.lng,
      weightGram,
    })

    return NextResponse.json({ options, displayAddress: geo.displayName })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
