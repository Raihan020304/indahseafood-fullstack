'use client'
// app/orders/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { DbOrder } from '@/lib/db'
import { formatRupiah } from '@/lib/midtrans'
import { ArrowLeft, MapPin, Truck, CreditCard, Loader2, Package } from 'lucide-react'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Pesanan Dibuat',     icon: '📋' },
  { key: 'paid',       label: 'Pembayaran Diterima', icon: '✅' },
  { key: 'processing', label: 'Sedang Diproses',     icon: '🐟' },
  { key: 'picked_up',  label: 'Dijemput Driver',     icon: '🛵' },
  { key: 'delivered',  label: 'Terkirim',             icon: '🏠' },
]

const STATUS_ORDER = ['pending', 'paid', 'processing', 'picked_up', 'delivered']

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700">Pesanan Dibatalkan</p>
          <p className="text-xs text-red-500">Hubungi kami jika ada pertanyaan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-400'
              } ${active ? 'ring-4 ring-ocean-200' : ''}`}>
                {done ? step.icon : i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${done && i < currentIdx ? 'bg-ocean-400' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pt-1 pb-5">
              <p className={`text-sm font-medium ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </p>
              {active && <p className="text-xs text-ocean-500 mt-0.5 animate-pulse">● Sedang berlangsung...</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<DbOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetch(`/api/orders/${params.id}`)
        .then(r => r.json())
        .then(d => setOrder(d.order || null))
        .finally(() => setLoading(false))
    }
  }, [status, params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-ocean-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Pesanan tidak ditemukan</h2>
        <Link href="/orders" className="btn-primary">Kembali ke Pesanan</Link>
      </div>
    )
  }

  const addr = order.shipping_address
  const totalQty = (order.order_items || []).reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-ocean-600 transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Kembali ke Pesanan
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Detail Pesanan</h1>
          <p className="font-mono text-sm text-slate-500 mt-0.5">{order.id}</p>
        </div>
        {order.payment_status === 'pending' && order.payment_url && (
          <a
            href={order.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coral flex items-center gap-2"
          >
            💳 Bayar Sekarang
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: timeline + items */}
        <div className="md:col-span-2 space-y-5">

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-ocean-500" /> Status Pesanan
            </h2>
            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="card p-5">
            <h2 className="font-display font-bold text-slate-800 mb-4">
              Produk ({totalQty} item)
            </h2>
            <div className="space-y-3">
              {(order.order_items || []).map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  {item.thumbnail ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-none">
                      <Image src={item.thumbnail} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-2xl flex-none">🐟</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                    {item.notes && <p className="text-xs text-slate-400">Catatan: {item.notes}</p>}
                    <p className="text-xs text-slate-500">{item.quantity} {item.unit} × {formatRupiah(item.price)}</p>
                  </div>
                  <p className="font-semibold text-slate-800 flex-none">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: info sidebar */}
        <div className="space-y-5">
          {/* Ringkasan harga */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3">Ringkasan Biaya</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-ocean-700">{formatRupiah(order.total)}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Status Bayar</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {order.payment_status === 'paid' ? '✓ Lunas' :
                 order.payment_status === 'failed' ? '✗ Gagal' : '⏳ Menunggu'}
              </span>
            </div>
            {order.payment_method && (
              <p className="text-xs text-slate-400 mt-1">Metode: {order.payment_method}</p>
            )}
          </div>

          {/* Pengiriman */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Truck size={16} className="text-ocean-500" /> Pengiriman
            </h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-medium text-slate-800">{order.shipping_service}</p>
              {order.shipping_distance && <p>Jarak: {order.shipping_distance} km</p>}
              {order.shipping_eta && <p>Estimasi: {order.shipping_eta}</p>}
              <p className="font-medium">{formatRupiah(order.shipping_cost)}</p>
            </div>
          </div>

          {/* Alamat */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-ocean-500" /> Alamat Pengiriman
            </h3>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-medium text-slate-800">{addr.fullName}</p>
              <p>{addr.phone}</p>
              <p>{addr.address}</p>
              <p>{addr.district}, {addr.city}</p>
              <p>{addr.province} {addr.postalCode}</p>
              {addr.notes && <p className="text-slate-400 italic">"{addr.notes}"</p>}
            </div>
          </div>

          {/* Waktu */}
          <div className="card p-4">
            <p className="text-xs text-slate-500">Dipesan pada</p>
            <p className="text-sm font-medium text-slate-700">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
