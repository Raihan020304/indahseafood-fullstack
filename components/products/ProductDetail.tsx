'use client'
// components/products/ProductDetail.tsx
import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'
import { formatRupiah } from '@/lib/midtrans'
import { Star, ShoppingCart, Minus, Plus, Truck, Shield } from 'lucide-react'

export function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  function handleAdd() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Gambar */}
      <div className="relative h-72 sm:h-96 md:h-[500px] rounded-2xl overflow-hidden bg-slate-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isFresh && <span className="badge-fresh text-sm px-3 py-1">🌊 Segar</span>}
          {product.isFrozen && <span className="badge-frozen text-sm px-3 py-1">❄️ Frozen</span>}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <p className="text-ocean-500 font-medium text-sm capitalize mb-1">
          {product.category.replace(/-/g, ' ')}
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 mb-3">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                size={16}
                className={i <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
              />
            ))}
          </div>
          <span className="text-slate-600 text-sm font-medium">{product.rating}</span>
          <span className="text-slate-400 text-sm">({product.reviewCount} ulasan)</span>
        </div>

        {/* Harga */}
        <div className="bg-ocean-50 rounded-xl p-4 mb-5">
          <div className="text-3xl font-bold text-ocean-700">
            {formatRupiah(product.price)}
          </div>
          <div className="text-ocean-500 text-sm">per {product.unit}</div>
        </div>

        {/* Deskripsi */}
        <p className="text-slate-600 leading-relaxed mb-5">{product.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {product.tags.map(tag => (
            <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Qty + Add */}
        {product.stock > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-600 font-medium">Jumlah:</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-slate-400">(Stok: {product.stock} {product.unit})</span>
            </div>

            <div className="text-right text-sm text-slate-500 mb-4">
              Total: <span className="text-lg font-bold text-slate-800">{formatRupiah(product.price * qty)}</span>
            </div>

            <button
              onClick={handleAdd}
              className={`btn-primary w-full flex items-center justify-center gap-2 text-base ${
                added ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              }`}
            >
              <ShoppingCart size={20} />
              {added ? '✓ Ditambahkan ke Keranjang!' : 'Tambah ke Keranjang'}
            </button>
          </>
        ) : (
          <div className="bg-red-50 text-red-600 text-center py-3 rounded-xl font-medium">
            Stok Habis
          </div>
        )}

        {/* Garansi info */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
            <Truck size={16} className="text-ocean-500 flex-shrink-0" />
            Antar via GoSend / GrabExpress
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-3">
            <Shield size={16} className="text-emerald-500 flex-shrink-0" />
            Bayar aman via Midtrans
          </div>
        </div>
      </div>
    </div>
  )
}
