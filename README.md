# 🐟 Indah Seafood — Full Website

Website e-commerce seafood dengan Next.js 15, NextAuth (Google Login), Midtrans, dan Ojol (GoSend/GrabExpress).

---

## 🚀 Cara Setup & Jalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file `.env.local`
Copy dari `.env.example` lalu isi nilainya:
```bash
cp .env.example .env.local
```

### 3. Setup Google OAuth
1. Buka https://console.cloud.google.com/
2. Buat project baru atau pilih yang ada
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy **Client ID** dan **Client Secret** ke `.env.local`

### 4. Setup Midtrans Sandbox
1. Daftar di https://dashboard.sandbox.midtrans.com/
2. Settings → Access Keys
3. Copy **Snap Client Key** dan **Server Key** ke `.env.local`

### 5. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Paste hasilnya ke `NEXTAUTH_SECRET` di `.env.local`

### 6. Jalankan development server
```bash
npm run dev
```

Buka http://localhost:3000

---

## 🏗️ Struktur Project

```
indah-seafood/
├── app/
│   ├── page.tsx              # Homepage (Hero, kategori, produk populer)
│   ├── catalog/
│   │   ├── page.tsx          # Katalog semua produk (filter, search, sort)
│   │   └── [slug]/page.tsx   # Detail produk
│   ├── cart/page.tsx         # Keranjang belanja
│   ├── checkout/
│   │   ├── page.tsx          # Checkout (alamat → ongkir → Midtrans)
│   │   └── success/page.tsx  # Halaman sukses bayar
│   ├── login/page.tsx        # Login dengan Google
│   └── api/
│       ├── auth/             # NextAuth routes
│       ├── shipping/         # Kalkulasi ongkir ojol
│       ├── checkout/         # Buat transaksi Midtrans
│       └── midtrans/webhook/ # Webhook notifikasi Midtrans
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── products/
│       ├── ProductCard.tsx
│       └── ProductDetail.tsx
├── lib/
│   ├── products.ts           # Data produk & helpers
│   ├── auth.ts               # NextAuth config
│   ├── midtrans.ts           # Midtrans integration
│   └── shipping.ts           # Kalkulasi ongkir (Haversine + estimasi tarif)
├── store/
│   └── cart.ts               # Zustand cart store (persist ke localStorage)
└── types/
    └── index.ts              # TypeScript types
```

---

## 💳 Flow Pembelian

```
Katalog → Tambah ke Keranjang → Checkout
  └─ Belum login? → Redirect ke /login → Google OAuth
  └─ Sudah login? → Isi Alamat → Cek Ongkir (GoSend/GrabExpress)
                 → Pilih Kurir → Bayar via Midtrans Snap
                 → Success Page
```

---

## 🛵 Sistem Pengiriman

Ongkos kirim dihitung otomatis berdasarkan:
- **Jarak** dari toko (Muara Baru, Jakarta Utara) ke alamat customer
- Geocoding via **Nominatim OpenStreetMap** (gratis, tanpa API key)
- **GoSend Instant**: Base Rp 13.000 + Rp 2.500/km (max 25km)
- **GrabExpress Instant**: Base Rp 15.000 + Rp 3.000/km (max 30km)

> Untuk produksi: integrasikan GoSend API via **Goapix** (https://developer.goapix.com/) atau GrabExpress API untuk tarif real-time.

---

## 💰 Metode Pembayaran (Midtrans Sandbox)

- Transfer Bank (BCA, BNI, BRI, Mandiri, Permata)
- Kartu Kredit / Debit
- GoPay, OVO, Dana, ShopeePay
- Indomaret, Alfamart

**Test card sandbox**: 4811 1111 1111 1114 (expired: masa depan, CVV: 123, OTP: 112233)

---

## 📦 Next Steps (Produksi)

- [ ] Tambah database (Supabase / PlanetScale / Neon) untuk menyimpan order
- [ ] Prisma ORM untuk query database
- [ ] Halaman "Pesanan Saya" dengan tracking status
- [ ] Admin dashboard (tambah/edit produk, lihat order)
- [ ] Integrasi GoSend API real (Goapix)
- [ ] Upload gambar produk ke Cloudinary / Supabase Storage
- [ ] Email konfirmasi (Resend / SendGrid)
- [ ] Deploy ke Vercel
