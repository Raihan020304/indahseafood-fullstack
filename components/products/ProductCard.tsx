'use client'
// components/products/ProductCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Plus } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { formatRupiah } from '@/lib/midtrans'
import { useState } from 'react'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/catalog/${product.slug}`} className="card group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Gambar */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-100">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFresh && <span className="badge-fresh">🌊 Segar</span>}
          {product.isFrozen && <span className="badge-frozen">❄️ Frozen</span>}
          {product.isPopular && (
            <span className="inline-flex items-center gap-1 bg-coral-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              🔥 Populer
            </span>
          )}
        </div>
        {/* Stok habis */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-slate-700 text-sm font-medium px-3 py-1 rounded-full">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-xs text-ocean-500 font-medium mb-1 capitalize">
          {product.category.replace(/-/g, ' ')}
        </p>
        <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight mb-1 line-clamp-2 font-sans">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-slate-500">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Harga + Tambah */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800 text-base sm:text-lg">
              {formatRupiah(product.price)}
            </span>
            <span className="text-slate-400 text-xs">/{product.unit}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-ocean-600 hover:bg-ocean-700 text-white'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? <span className="text-xs font-bold">✓</span> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </Link>
  )
}
