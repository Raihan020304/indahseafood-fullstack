// app/admin/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, ChevronRight, Fish } from 'lucide-react'

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/orders',   label: 'Pesanan',    icon: ShoppingBag },
  { href: '/admin/products', label: 'Produk',     icon: Fish },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Sidebar */}
      <aside className="w-56 flex-none bg-ocean-900 text-white hidden md:flex flex-col">
        <div className="px-4 py-5 border-b border-ocean-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center text-sm font-bold">IS</div>
            <div>
              <p className="text-sm font-bold">Indah Seafood</p>
              <p className="text-[10px] text-ocean-400 uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-ocean-600 text-white'
                    : 'text-ocean-200 hover:bg-ocean-800 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-ocean-800">
          <Link href="/" className="text-xs text-ocean-400 hover:text-white transition-colors">
            ← Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ocean-900 border-t border-ocean-800 flex">
        {NAV.map(item => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                active ? 'text-white' : 'text-ocean-400'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
