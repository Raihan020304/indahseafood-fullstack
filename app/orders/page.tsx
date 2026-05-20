'use client'
// app/orders/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DbOrder } from '@/lib/db'
import { formatRupiah } from '@/lib/midtrans'
import {
  Package, Clock, CheckCircle, Truck, Home,
  XCircle, ChevronRight, Loader2, ShoppingBag
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:     { label: 'Menunggu Pembayaran', color: 'text-amber-600 bg-amber-50 border-amber-200',   icon: Clock },
  paid:        { label: 'Dibayar',             color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: CheckCircle },
  processing:  { label: 'Diproses',            color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package },
  picked_up:   { label: 'Dijemput Driver',     color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered:   { label: 'Terkirim',            color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Home },
  cancelled:   { label: 'Dibatalkan',          color: 'text-red-600 bg-red-50 border-red-200',          icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending:  { label: 'Belum Dibayar', color: 'text-amber-600 bg-amber-50' },
    paid:     { label: 'Lunas',         color: 'text-emerald-600 bg-emerald-50' },
    failed:   { label: 'Gagal',         color: 'text-red-600 bg-red-50' },
    refunded: { label: 'Refunded',      color: 'text-slate-600 bg-slate-100' },
  }
  const cfg = config[status] || config.pending
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/orders')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .finally(() => setLoading(false))
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-ocean-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
          <Package size={20} className="text-ocean-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Pesanan Saya</h1>
          <p className="text-sm text-slate-500">{session?.user?.email}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-display font-bold text-slate-700 mb-2">Belum ada pesanan</h2>
          <p className="text-slate-500 mb-6">Yuk mulai belanja seafood segar pilihan!</p>
          <Link href="/catalog" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} />
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card p-5 block hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Kiri */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {order.id}
                    </span>
                    <StatusBadge status={order.status} />
                    <PaymentBadge status={order.payment_status} />
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(order.order_items || []).slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                    {(order.order_items || []).length > 3 && (
                      <span className="text-xs text-slate-400 px-2 py-0.5">
                        +{(order.order_items || []).length - 3} lainnya
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      🛵 {order.shipping_service}
                    </span>
                    <span>·</span>
                    <span>{new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Kanan */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-ocean-700 text-lg">{formatRupiah(order.total)}</div>
                    <div className="text-xs text-slate-400">
                      {(order.order_items || []).reduce((s, i) => s + i.quantity, 0)} item
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-ocean-500 transition-colors" />
                </div>
              </div>

              {/* Payment action jika belum bayar */}
              {order.payment_status === 'pending' && order.payment_url && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <a
                    href={order.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    💳 Selesaikan Pembayaran
                  </a>
                  <span className="text-xs text-slate-400 ml-3">Sebelum pesanan kedaluwarsa</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
