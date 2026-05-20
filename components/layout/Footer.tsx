import Link from 'next/link'
import { Instagram, Phone, Clock } from 'lucide-react'
export function Footer() {
  return (
    <footer className="bg-ocean-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-ocean-500 rounded-xl flex items-center justify-center font-bold font-display text-lg">
                IS
              </div>
              <div>
                <div className="font-display font-bold text-lg">Indah Seafood</div>
                <div className="text-[10px] text-ocean-300 uppercase tracking-widest">Fresh from the ocean</div>
              </div>
            </div>
            <p className="text-ocean-200 text-sm leading-relaxed">
              Seafood segar & olahan berkualitas langsung dari nelayan. 
              Diantar cepat via ojol ke pintu rumah Anda.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-ocean-700 hover:bg-ocean-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-ocean-700 hover:bg-ocean-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-ocean-300 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Katalog Produk', href: '/catalog' },
                { label: 'Keranjang', href: '/cart' },
                { label: 'Pesanan Saya', href: '/orders' },
              ].map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ocean-200 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Toko */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-ocean-300 mb-4">
              Info Toko
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Instagram size={15} className="text-coral-400 mt-0.5 flex-shrink-0" />
                <span className="text-ocean-200 text-sm">
                  Jl. Nelayan No. 1, Muara Baru,<br />Jakarta Utara 14440
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-coral-400 flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-ocean-200 hover:text-white text-sm transition-colors">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="text-coral-400 mt-0.5 flex-shrink-0" />
                <span className="text-ocean-200 text-sm">
                  Senin – Sabtu: 06.00 – 18.00<br />
                  Minggu: 06.00 – 13.00
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ocean-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ocean-400 text-xs">
            © {new Date().getFullYear()} Indah Seafood. Semua hak dilindungi.
          </p>
          <div className="flex gap-4">
            <span className="text-ocean-400 text-xs">Pembayaran via</span>
            <span className="text-ocean-300 text-xs font-medium">Midtrans</span>
            <span className="text-ocean-400 text-xs">·</span>
            <span className="text-ocean-300 text-xs font-medium">GoSend</span>
            <span className="text-ocean-400 text-xs">·</span>
            <span className="text-ocean-300 text-xs font-medium">GrabExpress</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
