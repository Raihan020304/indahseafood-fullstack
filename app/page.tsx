// app/page.tsx
import Link from 'next/link'
import { ArrowRight, Star, Truck, ShieldCheck, Clock, Fish } from 'lucide-react'
import { getPopularProducts } from '@/lib/products'
import { ProductCard } from '@/components/products/ProductCard'
import { categories } from '@/lib/products'

export default function HomePage() {
  const popularProducts = getPopularProducts().slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-800 via-ocean-700 to-ocean-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-coral-400 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <Fish size={15} className="text-coral-300" />
              <span className="text-ocean-100">Segar langsung dari nelayan</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
              Seafood Segar,<br />
              <span className="text-coral-300">Diantar ke Rumah</span>
            </h1>
            <p className="text-ocean-100 text-lg md:text-xl mb-8 leading-relaxed">
              Nikmati aneka seafood pilihan berkualitas — ikan, udang, cumi, kepiting 
              dan olahan frozen. Pesan sekarang, antar via GoSend atau GrabExpress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog" className="btn-coral inline-flex items-center justify-center gap-2">
                Belanja Sekarang
                <ArrowRight size={18} />
              </Link>
              <Link href="/catalog" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-xl transition-all">
                Lihat Katalog
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { value: '500+', label: 'Pelanggan Puas' },
                { value: '4.8★', label: 'Rating Rata-rata' },
                { value: '<1 jam', label: 'Estimasi Antar' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-ocean-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L48 52C96 44 192 28 288 26C384 24 480 36 576 42C672 48 768 48 864 42C960 36 1056 24 1152 20C1248 16 1344 20 1392 22L1440 24V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Kategori */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="section-title mb-6">Kategori Produk</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {categories.filter(c => c.id !== 'semua').map(cat => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.id}`}
              className="card p-4 text-center hover:border-ocean-200 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="text-xs font-medium text-slate-600 group-hover:text-ocean-700 transition-colors leading-tight">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Produk Populer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Produk Populer</h2>
          <Link href="/catalog" className="text-ocean-600 hover:text-ocean-800 text-sm font-medium flex items-center gap-1 transition-colors">
            Lihat Semua <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
          {popularProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Keunggulan */}
      <section className="bg-ocean-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">Kenapa Pilih Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Fish,
                title: 'Segar Terjamin',
                desc: 'Langsung dari nelayan ke tangan Anda. Dipilih setiap pagi.',
                color: 'bg-emerald-100 text-emerald-600',
              },
              {
                icon: Truck,
                title: 'Antar Cepat',
                desc: 'Via GoSend & GrabExpress. Estimasi 15-90 menit tiba di rumah.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: ShieldCheck,
                title: 'Bayar Aman',
                desc: 'Payment gateway Midtrans. Transfer, kartu kredit, dompet digital.',
                color: 'bg-ocean-100 text-ocean-600',
              },
              {
                icon: Star,
                title: 'Rating Tinggi',
                desc: 'Dipercaya 500+ pelanggan dengan rating 4.8/5.',
                color: 'bg-amber-100 text-amber-600',
              },
            ].map(item => (
              <div key={item.title} className="card p-6 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2 font-sans">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <div className="text-4xl mb-3">🦐</div>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Siap Pesan Seafood Segar?
          </h2>
          <p className="text-coral-100 mb-6 max-w-md mx-auto">
            Belanja sekarang, bayar mudah via Midtrans, langsung antar via ojol!
          </p>
          <Link href="/catalog" className="inline-flex items-center gap-2 bg-white text-coral-600 font-semibold px-8 py-3 rounded-xl hover:bg-coral-50 transition-colors">
            Mulai Belanja <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
