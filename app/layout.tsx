// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Indah Seafood – Seafood Segar Pilihan',
    template: '%s | Indah Seafood',
  },
  description:
    'Belanja seafood segar & olahan berkualitas langsung dari nelayan. Ikan, udang, cumi, kepiting – diantar via ojol ke pintu rumah Anda.',
  keywords: ['seafood', 'ikan segar', 'udang', 'kepiting', 'Jakarta', 'pesan antar'],
  openGraph: {
    title: 'Indah Seafood',
    description: 'Seafood Segar Pilihan, Diantar Ke Rumah',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Midtrans Snap.js - sandbox */}
        <script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          async
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
