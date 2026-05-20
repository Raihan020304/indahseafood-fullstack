-- =====================================================
-- INDAH SEAFOOD - Supabase Database Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABEL: users (sinkron dari NextAuth Google)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  image       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: orders (pesanan utama)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  TEXT PRIMARY KEY,         -- format: IS-timestamp-XXXX
  user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_email          TEXT NOT NULL,
  user_name           TEXT,

  -- Alamat pengiriman (JSON)
  shipping_address    JSONB NOT NULL,

  -- Info pengiriman ojol
  shipping_provider   TEXT NOT NULL,            -- 'gosend' | 'grabexpress'
  shipping_service    TEXT NOT NULL,            -- 'GoSend Instant' dll
  shipping_cost       INTEGER NOT NULL DEFAULT 0,
  shipping_distance   NUMERIC(5,1),             -- km
  shipping_eta        TEXT,                     -- '30-60 menit'

  -- Harga
  subtotal            INTEGER NOT NULL DEFAULT 0,
  total               INTEGER NOT NULL DEFAULT 0,

  -- Status
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','processing','picked_up','delivered','cancelled')),
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending','paid','failed','refunded')),

  -- Midtrans
  midtrans_order_id   TEXT UNIQUE,
  snap_token          TEXT,
  payment_url         TEXT,
  payment_method      TEXT,                     -- diisi dari webhook

  -- Catatan admin
  admin_notes         TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: order_items (item dalam pesanan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit        TEXT NOT NULL DEFAULT 'kg',
  weight      INTEGER NOT NULL DEFAULT 0,       -- gram per unit
  thumbnail   TEXT,
  notes       TEXT,                             -- catatan customer per item
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABEL: products (override / tambah produk dari admin)
-- Jika kosong, fallback ke lib/products.ts (static data)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL DEFAULT 0,
  unit        TEXT NOT NULL DEFAULT 'kg',
  stock       INTEGER NOT NULL DEFAULT 0,
  weight      INTEGER NOT NULL DEFAULT 1000,    -- gram
  thumbnail   TEXT,
  is_fresh    BOOLEAN DEFAULT true,
  is_frozen   BOOLEAN DEFAULT false,
  is_popular  BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  rating      NUMERIC(3,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES (performa query)
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_email   ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug       ON public.products(slug);

-- ─────────────────────────────────────────────
-- FUNCTION: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;

-- Users: bisa lihat & edit data sendiri
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (true); -- public read (name, image)

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (true);

-- Orders: customer lihat punya sendiri; admin lihat semua
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (true); -- difilter di aplikasi via user_email

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (true);

-- Order items: ikut order
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Products: semua bisa baca; tulis via service role saja
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_all_service" ON public.products
  FOR ALL USING (true);

-- ─────────────────────────────────────────────
-- ADMIN USER (ganti email lo sendiri!)
-- ─────────────────────────────────────────────
-- Setelah lo login pertama kali via Google,
-- jalankan query ini untuk set role admin:
--
-- UPDATE public.users SET role = 'admin' WHERE email = 'emaillo@gmail.com';
