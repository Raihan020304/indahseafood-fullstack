'use client'
// app/catalog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getProductsByCategory } from '@/lib/products'
import { ProductDetail } from '@/components/products/ProductDetail'
import { ProductCard } from '@/components/products/ProductCard'

interface Props {
  params: { slug: string }
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  const related = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-ocean-600 transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-ocean-600 transition-colors">Katalog</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {/* Produk Terkait */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Produk Serupa</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
