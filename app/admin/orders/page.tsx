'use client'
// app/admin/orders/page.tsx
import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { DbOrder } from '@/lib/db'
import { formatRupiah } from '@/lib/midtrans'
import { Loader2, Search, Filter, ChevronRight, ChevronLeft } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  paid:       'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  picked_up:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
}

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Semua Status' },
  { value: 'pending',    label: '⏳ Menunggu Bayar' },
  { value: 'paid',       label: '✅ Dibayar' },
  { value: 'processing', label: '🐟 Diproses' },
  { value: 'picked_up',  label: '🛵 Dijemput' },
  { value: 'delivered',  label: '🏠 Terkirim' },
  { value: 'cancelled',  label: '❌ Dibatalkan' },
]

const PAGE_SIZE = 15

function OrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusFilter = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1')

  const [orders, setOrders] = useState<DbOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      status: statusFilter,
      limit: PAGE_SIZE.toString(),
      offset: ((page - 1) * PAGE_SIZE).toString(),
    })
    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.count || 0)
    setLoading(false)
  }, [statusFilter, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filtered = search.trim()
    ? orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.user_email.toLowerCase().includes(search.toLowerCase()) ||
        (o.user_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : orders

  function setStatus(s: string) {
    router.push(`/admin/orders?status=${s}&page=1`)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Manajemen Pesanan</h1>
          <p className="text-slate-500 text-sm">{total} total pesanan</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari ID, nama, atau email..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400 bg-white min-w-[180px]"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-ocean-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['ID Pesanan', 'Customer', 'Item', 'Total', 'Kurir', 'Status', 'Bayar', 'Waktu', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Tidak ada pesanan ditemukan
                    </td>
                  </tr>
                ) : filtered.map(order => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-ocean-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-600">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700 max-w-[120px] truncate">{order.user_name || '-'}</p>
                      <p className="text-xs text-slate-400 max-w-[120px] truncate">{order.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">
                        {(order.order_items || []).reduce((s, i) => s + i.quantity, 0)} item
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{formatRupiah(order.total)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 max-w-[80px]">{order.shipping_service}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {STATUS_OPTIONS.find(s => s.value === order.status)?.label?.replace(/^.\s/, '') || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status === 'paid' ? 'Lunas' : order.payment_status === 'failed' ? 'Gagal' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-ocean-600 hover:text-ocean-800 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Halaman {page} dari {totalPages} ({total} pesanan)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => router.push(`/admin/orders?status=${statusFilter}&page=${page - 1}`)}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => router.push(`/admin/orders?status=${statusFilter}&page=${page + 1}`)}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-ocean-400" /></div>}>
      <OrdersContent />
    </Suspense>
  )
}
