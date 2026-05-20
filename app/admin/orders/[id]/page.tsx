'use client'
// app/admin/orders/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DbOrder } from '@/lib/db'
import { formatRupiah } from '@/lib/midtrans'
import { ArrowLeft, Save, Loader2, MapPin, Truck } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pending',    label: '⏳ Menunggu Pembayaran' },
  { value: 'paid',       label: '✅ Dibayar' },
  { value: 'processing', label: '🐟 Sedang Diproses' },
  { value: 'picked_up',  label: '🛵 Dijemput Driver' },
  { value: 'delivered',  label: '🏠 Terkirim' },
  { value: 'cancelled',  label: '❌ Dibatalkan' },
]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<DbOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setOrder(d.order)
        setStatus(d.order?.status || 'pending')
        setNotes(d.order?.admin_notes || '')
      })
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Update local state
    setOrder(o => o ? { ...o, status, admin_notes: notes } : o)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-ocean-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-500">Pesanan tidak ditemukan</p>
        <Link href="/admin/orders" className="btn-primary mt-4 inline-flex">Kembali</Link>
      </div>
    )
  }

  const addr = order.shipping_address

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-slate-800">Detail Pesanan</h1>
          <p className="font-mono text-sm text-slate-500">{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              saved ? 'bg-emerald-500 text-white' : 'bg-ocean-600 hover:bg-ocean-700 text-white'
            } disabled:opacity-50`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-display font-bold text-slate-800">
                Produk ({(order.order_items || []).reduce((s, i) => s + i.quantity, 0)} item)
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {(order.order_items || []).map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.thumbnail ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-none">
                      <Image src={item.thumbnail} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-none">🐟</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} {item.unit} × {formatRupiah(item.price)}</p>
                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-0.5">Catatan: {item.notes}</p>
                    )}
                  </div>
                  <p className="font-bold text-slate-800 flex-none">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-800 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-ocean-700">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3">Catatan Admin</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan internal (tidak terlihat oleh customer)..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 resize-none"
            />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3">Customer</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-slate-800">{order.user_name || '-'}</p>
              <p className="text-slate-500">{order.user_email}</p>
            </div>
          </div>

          {/* Pengiriman */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Truck size={15} className="text-ocean-500" /> Pengiriman
            </h3>
            <div className="text-sm space-y-1 text-slate-600">
              <p className="font-medium">{order.shipping_service}</p>
              {order.shipping_distance && <p>Jarak: {order.shipping_distance} km</p>}
              {order.shipping_eta && <p>Estimasi: {order.shipping_eta}</p>}
              <p className="font-semibold">{formatRupiah(order.shipping_cost)}</p>
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MapPin size={15} className="text-ocean-500" /> Alamat
            </h3>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-medium text-slate-800">{addr.fullName}</p>
              <p>{addr.phone}</p>
              <p>{addr.address}</p>
              <p>{addr.district}, {addr.city}</p>
              <p>{addr.province} {addr.postalCode}</p>
              {addr.notes && <p className="text-slate-400 italic mt-1">"{addr.notes}"</p>}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-display font-bold text-slate-800 mb-3">Pembayaran</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium ${
                  order.payment_status === 'paid' ? 'text-emerald-600' :
                  order.payment_status === 'failed' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {order.payment_status === 'paid' ? '✓ Lunas' :
                   order.payment_status === 'failed' ? '✗ Gagal' : '⏳ Pending'}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Pesan pada</span>
                <span className="text-xs">{new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
