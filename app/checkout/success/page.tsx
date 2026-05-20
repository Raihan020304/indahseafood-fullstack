'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle, Clock, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order')
  const status = params.get('status')
  const isPending = status === 'pending'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="card p-8 sm:p-10">

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
              ? 'Pesanan Anda sedang menunggu konfirmasi pembayaran.'
              : 'Terima kasih! Pesanan Anda sudah kami terima.'}
          </p>

          {orderId && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-400 mb-1">Nomor Pesanan</p>
              <p className="font-mono font-bold text-slate-800 text-sm break-all">
                {orderId}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="btn-secondary flex-1">
              Kembali ke Beranda
            </Link>
            <Link href="/catalog" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Belanja Lagi <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessContent />
    </Suspense>
  )
}