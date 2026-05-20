'use client'
// app/admin/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DbOrder } from '@/lib/db'
import { formatRupiah } from '@/lib/midtrans'
import {
  TrendingUp, ShoppingBag, Clock, Users,
  Package, ArrowRight, Loader2, Banknote
} from 'lucide-react'

interface Stats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  pendingOrders: number
  totalCustomers: number
}

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  picked_up:  'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  pending:    'Menunggu Bayar',
  paid:       'Dibayar',
  processing: 'Diproses',
  picked_up:  'Dijemput',
  delivered:  'Terkirim',
  cancelled:  'Dibatalkan',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/orders?limit=8').then(r => r.json()),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData)
      setRecentOrders(ordersData.orders || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-ocean-500" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Pesanan',
      value: stats?.totalOrders.toString() || '0',
      icon: ShoppingBag,
      color: 'bg-ocean-500',
      sub: `${stats?.todayOrders || 0} hari ini`,
    },
    {
      label: 'Total Pendapatan',
      value: formatRupiah(stats?.totalRevenue || 0),
      icon: Banknote,
      color: 'bg-emerald-500',
      sub: 'dari pesanan lunas',
    },
    {
      label: 'Menunggu Proses',
      value: stats?.pendingOrders.toString() || '0',
      icon: Clock,
      color: 'bg-amber-500',
      sub: 'perlu ditindaklanjuti',
    },
    {
      label: 'Total Customer',
      value: stats?.totalCustomers.toString() || '0',
      icon: Users,
      color: 'bg-purple-500',
      sub: 'terdaftar via Google',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm">Selamat datang di panel admin Indah Seafood 🐟</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-0.5 leading-tight">
              {card.value}
            </div>
            <div className="text-xs text-slate-500">{card.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
            <Package size={18} className="text-ocean-500" />
            Pesanan Terbaru
          </h2>
          <Link href="/admin/orders" className="text-sm text-ocean-600 hover:text-ocean-800 font-medium flex items-center gap-1 transition-colors">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['ID Pesanan', 'Customer', 'Produk', 'Total', 'Kurir', 'Status', 'Waktu'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : recentOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-ocean-600 hover:text-ocean-800 font-medium">
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{order.user_name || '-'}</p>
                    <p className="text-xs text-slate-400">{order.user_email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-600">
                      {(order.order_items || []).length} jenis
                    </p>
                    <p className="text-xs text-slate-400">
                      {(order.order_items || []).reduce((s, i) => s + i.quantity, 0)} item
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-800">{formatRupiah(order.total)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-slate-600">{order.shipping_service}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats by status */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(STATUS_LABEL).map(([status, label]) => {
          const count = recentOrders.filter(o => o.status === status).length
          return (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[status]}`}>
                  {label}
                </span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-ocean-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{count}</p>
              <p className="text-xs text-slate-400">dari {recentOrders.length} terbaru</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
