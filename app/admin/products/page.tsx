'use client'
// app/admin/products/page.tsx
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { products as staticProducts, categories } from '@/lib/products'
import { formatRupiah } from '@/lib/midtrans'
import { Search, Plus, Star, Package, Eye, EyeOff, Loader2, Fish } from 'lucide-react'

// Untuk sekarang tampilkan produk statis dari lib/products.ts
// Di produksi, bisa fetch dari Supabase + merge

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('semua')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = staticProducts.filter(p => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'semua' || p.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Manajemen Produk</h1>
          <p className="text-slate-500 text-sm">{staticProducts.length} produk terdaftar</p>
        </div>
        <button className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCatFilter(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                catFilter === cat.id
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-ocean-300'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Image */}
            <div className="relative h-40 bg-slate-100">
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {product.isFresh && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Segar</span>}
                {product.isFrozen && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Frozen</span>}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-xs text-ocean-500 font-medium mb-0.5 capitalize">
                {product.category.replace(/-/g, ' ')}
              </p>
              <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500">{product.rating} ({product.reviewCount})</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-slate-800">{formatRupiah(product.price)}</span>
                  <span className="text-slate-400 text-xs">/{product.unit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">Stok: {product.stock}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 text-xs border border-slate-200 hover:border-ocean-300 hover:text-ocean-600 text-slate-600 py-1.5 rounded-lg transition-colors font-medium">
                  Edit
                </button>
                <button
                  className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    product.isPopular
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={product.isPopular ? 'Tampil di Populer' : 'Sembunyikan dari Populer'}
                >
                  {product.isPopular ? <Eye size={12} /> : <EyeOff size={12} />}
                  {product.isPopular ? 'Populer' : 'Non-populer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Fish size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Tidak ada produk ditemukan</p>
        </div>
      )}

      {/* Info box */}
      <div className="bg-ocean-50 border border-ocean-100 rounded-2xl p-5">
        <h3 className="font-semibold text-ocean-800 mb-2 flex items-center gap-2">
          <Fish size={16} />
          Tentang Manajemen Produk
        </h3>
        <p className="text-sm text-ocean-700">
          Produk saat ini dimuat dari <code className="bg-ocean-100 px-1.5 py-0.5 rounded text-xs font-mono">lib/products.ts</code>.
          Untuk mengelola produk via database, sync produk ke tabel <code className="bg-ocean-100 px-1.5 py-0.5 rounded text-xs font-mono">products</code> di Supabase
          menggunakan tombol di bawah, lalu edit langsung dari dashboard ini.
        </p>
        <button className="mt-3 bg-ocean-600 hover:bg-ocean-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sync Produk ke Supabase
        </button>
      </div>
    </div>
  )
}
