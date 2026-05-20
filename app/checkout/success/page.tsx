'use client'
// app/checkout/success/page.tsx
import Link from 'next/link'
import { useSearchParams, Suspense } from 'next/navigation'
import { CheckCircle, Clock, Package, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order')
  const status = params.get('status')
  const isPending = status === 'pending'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="card p-8 sm:p-10">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPending ? 'bg-amber-100' : 'bg-emerald-100'
          }`}>
            {isPending
              ? <Clock size={36} className="text-amber-500" />
              : <CheckCircle size={36} className="text-emerald-500" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 mb-2">
            {isPending ? 'Menunggu Pembayaran' : 'Pesanan Berhasil! 🎉'}
          </h1>

          <p className="text-slate-500 mb-6">
            {isPending
              ? 'Pesanan Anda sedang menunggu konfirmasi pembayaran. Selesaikan pembayaran sesuai instruksi yang dikirim.'
              : 'Terima kasih! Pesanan Anda sudah kami terima dan sedang diproses.'}
          </p>

          {orderId && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-400 mb-1">Nomor Pesanan</p>
              <p className="font-mono font-bold text-slate-800 text-sm break-all">{orderId}</p>
            </div>
          )}

          {/* Steps */}
          <div className="text-left space-y-3 mb-8">
            {[
              { icon: '✅', label: 'Pesanan diterima', done: true },
              { icon: '🐟', label: 'Seafood dipersiapkan & dikemas', done: !isPending },
              { icon: '🛵', label: 'Driver ojol menjemput pesanan', done: false },
              { icon: '🏠', label: 'Pesanan tiba di rumah Anda', done: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 ${item.done ? 'opacity-100' : 'opacity-40'}`}>
                <span className="text-xl">{item.icon}</span>
                <span className={`text-sm ${item.done ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {item.label}
                </span>
                {item.done && <span className="ml-auto text-emerald-500 text-xs font-medium">✓</span>}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Kembali ke Beranda
            </Link>
            <Link href="/catalog" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Belanja Lagi <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 bg-ocean-50 rounded-xl p-4 flex items-start gap-3 text-left">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-sm font-medium text-ocean-800">Pantau pesanan Anda</p>
              <p className="text-xs text-ocean-600 mt-0.5">
                Driver akan menghubungi Anda via WA/telepon saat menjemput pesanan.
                Nomor HP yang digunakan: nomor yang Anda masukkan saat checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
