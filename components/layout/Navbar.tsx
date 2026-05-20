'use client'
// components/layout/Navbar.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/store/cart'
import { ShoppingCart, User, ChevronDown, LogOut, Package } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const items = useCartStore(s => s.items)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const [userOpen, setUserOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-xl flex items-center justify-center text-white text-lg font-bold font-display shadow-sm">
            IS
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-ocean-800 leading-tight text-lg">
              Indah Seafood
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">
              Fresh from the ocean
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors font-medium">
            Beranda
          </Link>
          <Link href="/catalog" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors font-medium">
            Katalog
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-ocean-50 rounded-xl transition-colors"
          >
            <ShoppingCart size={22} className="text-slate-600" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-coral-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* User */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-ocean-600" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <Package size={15} />
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setUserOpen(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 btn-primary py-2 px-4 text-sm"
            >
              <User size={15} />
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
