// app/catalog/page.tsx
'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { products, categories } from '@/lib/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Suspense } from 'react'

function CatalogContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'semua'

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const filtered = useMemo(() => {
    let list = [...products]

    if (selectedCategory !== 'semua') {
      list = list.filter(p => p.category === selectedCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      )
    }

    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break
      case 'price-desc': list.sort((a, b) => b.price - a.price); break
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break
      case 'popular':    list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)); break
    }

    return list
  }, [selectedCategory, search, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-800 mb-1">Katalog Produk</h1>
        <p className="text-slate-500">Temukan seafood segar pilihan terbaik kami</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field pl-9 pr-8 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="default">Urutan Default</option>
            <option value="popular">Paling Populer</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="price-asc">Harga Terendah</option>
            <option value="price-desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Kategori Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-ocean-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-ocean-300'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> produk
        {selectedCategory !== 'semua' && (
          <> dalam kategori <span className="font-semibold text-ocean-600">
            {categories.find(c => c.id === selectedCategory)?.label}
          </span></>
        )}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Produk tidak ditemukan</h3>
          <p className="text-slate-500 text-sm">Coba kata kunci lain atau pilih kategori berbeda</p>
        </div>
      )}
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-400">Memuat...</div>}>
      <CatalogContent />
    </Suspense>
  )
}
