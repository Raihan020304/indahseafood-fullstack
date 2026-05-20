'use client'
// app/checkout/page.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatRupiah } from '@/lib/midtrans'
import { ShippingAddress, ShippingOption } from '@/types'
import { MapPin, Truck, CreditCard, ChevronRight, Loader2 } from 'lucide-react'
import Image from 'next/image'

type Step = 'address' | 'shipping' | 'payment'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void
        onPending: (result: unknown) => void
        onError: (result: unknown) => void
        onClose: () => void
      }) => void
    }
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const totalWeight = items.reduce((sum, i) => sum + i.product.weight * i.quantity, 0)

  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [error, setError] = useState('')

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: session?.user?.name || '',
    phone: '',
    address: '',
    district: '',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '',
    notes: '',
  })

  // Redirect jika belum login
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-ocean-500" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/checkout')
    return null
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  // Cari ongkir
  async function handleGetShipping() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: `${address.address}, ${address.district}, ${address.city}`,
          weightGram: totalWeight,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal cek ongkir')
      setShippingOptions(data.options)
      setStep('shipping')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal cek ongkir')
    } finally {
      setLoading(false)
    }
  }

  // Buat transaksi Midtrans
  async function handlePay() {
    if (!selectedShipping) return
    setError('')
    setLoading(true)
    try {
      const total = subtotal + selectedShipping.price
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: address,
          shippingOption: selectedShipping,
          subtotal,
          shippingCost: selectedShipping.price,
          total,
          customer: {
            name: session!.user!.name,
            email: session!.user!.email,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat transaksi')

      // Buka Midtrans Snap
      window.snap.pay(data.snapToken, {
        onSuccess: () => {
          clearCart()
          router.push(`/checkout/success?order=${data.orderId}`)
        },
        onPending: () => {
          router.push(`/checkout/success?order=${data.orderId}&status=pending`)
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba lagi.')
          setLoading(false)
        },
        onClose: () => {
          setLoading(false)
        },
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal proses pembayaran')
      setLoading(false)
    }
  }

  const total = subtotal + (selectedShipping?.price || 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['address', 'shipping', 'payment'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-ocean-600 text-white' :
              (step === 'shipping' && s === 'address') || (step === 'payment')
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {((step === 'shipping' && s === 'address') || step === 'payment') && s !== step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === s ? 'text-ocean-700' : 'text-slate-400'}`}>
              {s === 'address' ? 'Alamat' : s === 'shipping' ? 'Pengiriman' : 'Pembayaran'}
            </span>
            {i < 2 && <ChevronRight size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Alamat */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-ocean-600" />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-800">Alamat Pengiriman</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                <input type="text" value={address.fullName} onChange={e => setAddress(a => ({...a, fullName: e.target.value}))} className="input-field" placeholder="Nama penerima" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. HP / WA *</label>
                <input type="tel" value={address.phone} onChange={e => setAddress(a => ({...a, phone: e.target.value}))} className="input-field" placeholder="08xx-xxxx-xxxx" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap *</label>
                <input type="text" value={address.address} onChange={e => setAddress(a => ({...a, address: e.target.value}))} className="input-field" placeholder="Nama jalan, nomor rumah, RT/RW" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelurahan / Kecamatan *</label>
                <input type="text" value={address.district} onChange={e => setAddress(a => ({...a, district: e.target.value}))} className="input-field" placeholder="cth: Penjaringan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kota *</label>
                <input type="text" value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Pos</label>
                <input type="text" value={address.postalCode} onChange={e => setAddress(a => ({...a, postalCode: e.target.value}))} className="input-field" placeholder="12345" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Kurir (opsional)</label>
                <input type="text" value={address.notes} onChange={e => setAddress(a => ({...a, notes: e.target.value}))} className="input-field" placeholder="cth: depan warung, gate biru" />
              </div>
            </div>

            {error && step === 'address' && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleGetShipping}
              disabled={loading || !address.fullName || !address.phone || !address.address || !address.district}
              className="btn-primary mt-5 flex items-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Mengecek ongkir...</> : <>Pilih Pengiriman <ChevronRight size={16} /></>}
            </button>
          </div>

          {/* Step 2: Pengiriman */}
          {step !== 'address' && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <Truck size={16} className="text-ocean-600" />
                </div>
                <h2 className="font-display font-bold text-lg text-slate-800">Pilih Pengiriman Ojol</h2>
              </div>

              <div className="space-y-3">
                {shippingOptions.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedShipping?.provider === opt.provider
                      ? 'border-ocean-500 bg-ocean-50'
                      : 'border-slate-200 hover:border-ocean-300'
                  }`}>
                    <input
                      type="radio"
                      name="shipping"
                      className="accent-ocean-600"
                      onChange={() => { setSelectedShipping(opt); setStep('payment') }}
                      checked={selectedShipping?.provider === opt.provider}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-800">{opt.serviceName}</span>
                        {opt.provider === 'gosend' ? '🟢' : '🟡'}
                      </div>
                      <div className="text-sm text-slate-500">
                        Estimasi {opt.estimatedTime} · {opt.distance} km dari toko
                      </div>
                    </div>
                    <div className="font-bold text-ocean-700">{formatRupiah(opt.price)}</div>
                  </label>
                ))}
              </div>

              {error && step === 'shipping' && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <p className="text-xs text-slate-400 mt-3">
                * Estimasi berdasarkan jarak dari toko ke alamat Anda. Ongkir final sesuai tarif driver saat pemesanan.
              </p>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && selectedShipping && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <CreditCard size={16} className="text-ocean-600" />
                </div>
                <h2 className="font-display font-bold text-lg text-slate-800">Pembayaran via Midtrans</h2>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-slate-600 mb-3">Tersedia metode pembayaran:</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {['Transfer Bank', 'Kartu Kredit/Debit', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'Indomaret', 'Alfamart'].map(m => (
                    <span key={m} className="bg-white border border-slate-200 px-2.5 py-1 rounded-full">{m}</span>
                  ))}
                </div>
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                onClick={handlePay}
                disabled={loading}
                className="btn-coral w-full flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                ) : (
                  <><CreditCard size={18} /> Bayar Sekarang {formatRupiah(total)}</>
                )}
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                🔒 Transaksi aman & terenkripsi via Midtrans
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-4">Ringkasan Pesanan</h2>

            {/* Items */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-none">
                    <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} × {formatRupiah(item.product.price)}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 flex-none">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 pb-4 border-b border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim</span>
                <span>
                  {selectedShipping
                    ? formatRupiah(selectedShipping.price)
                    : <span className="text-slate-400 text-xs">Belum dipilih</span>}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-xl font-bold text-ocean-700">{formatRupiah(total)}</span>
            </div>

            {/* User info */}
            <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              {session?.user?.image && (
                <Image src={session.user.image} alt="User" width={28} height={28} className="rounded-full" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{session?.user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
