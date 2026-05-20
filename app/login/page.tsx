'use client'
// app/login/page.tsx
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function LoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/checkout'

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg mx-auto mb-4">
            IS
          </div>

          <h1 className="text-2xl font-display font-bold text-slate-800 mb-1">
            Masuk ke Indah Seafood
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Login diperlukan untuk menyelesaikan pesanan Anda
          </p>

          {/* Checkout reminder */}
          <div className="bg-ocean-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <p className="text-sm font-medium text-ocean-800">Keranjang Anda tersimpan</p>
                <p className="text-xs text-ocean-600 mt-0.5">
                  Setelah login, Anda akan langsung diarahkan ke halaman checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-xl transition-all active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <p className="text-xs text-slate-400 mt-6">
            Dengan masuk, Anda menyetujui syarat & ketentuan kami.
            Kami tidak menyimpan password Anda.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
