'use client'
// app/cart/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { formatRupiah } from '@/lib/midtrans'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateNotes } = useCartStore()
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalWeight = items.reduce((sum, i) => sum + i.product.weight * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-display font-bold text-slate-700 mb-2">Keranjang Kosong</h2>
        <p className="text-slate-500 mb-6">Belum ada produk yang ditambahkan ke keranjang.</p>
        <Link href="/catalog" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={18} />
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-slate-800 mb-8">
        Keranjang Belanja
        <span className="text-lg font-sans text-slate-400 ml-2 font-normal">({totalItems} item)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="card p-4 sm:p-5">
              <div className="flex gap-4">
                {/* Gambar */}
                <Link href={`/catalog/${item.product.slug}`} className="flex-none">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/catalog/${item.product.slug}`}>
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight hover:text-ocean-700 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="flex-none text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-ocean-600 font-bold mt-1">
                    {formatRupiah(item.product.price)}
                    <span className="text-slate-400 font-normal text-xs">/{item.product.unit}</span>
                  </p>

                  {/* Qty control */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Notes */}
                  <input
                    type="text"
                    placeholder="Catatan (opsional, misal: fillet, tanpa kepala...)"
                    value={item.notes || ''}
                    onChange={e => updateNotes(item.product.id, e.target.value)}
                    className="mt-2 w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ocean-300 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          ))}

          <Link href="/catalog" className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-800 text-sm font-medium transition-colors">
            ← Lanjut Belanja
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-3 text-sm pb-4 border-b border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} item)</span>
                <span className="font-medium text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Berat</span>
                <span className="font-medium text-slate-800">
                  {totalWeight >= 1000
                    ? `${(totalWeight / 1000).toFixed(1)} kg`
                    : `${totalWeight} gram`}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Ongkos Kirim</span>
                <span className="text-ocean-600 font-medium">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mb-5">
              <span className="font-bold text-slate-800">Total Belanja</span>
              <span className="text-xl font-bold text-ocean-700">{formatRupiah(subtotal)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Lanjut ke Checkout
              <ArrowRight size={18} />
            </Link>

            {/* Info */}
            <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <span className="text-base">🔐</span>
              <span>Anda perlu login dengan Google untuk menyelesaikan checkout.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
