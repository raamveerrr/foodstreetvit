-- DigitalFoodStreet: Create missing tables for merchant dashboard
-- Run this in your Supabase Dashboard → SQL Editor

-- ═══════════════════════════════════════════════════════════════
-- 1. menu_items
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.menu_items (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id       text NOT NULL,
  shop_id       text NOT NULL REFERENCES public.shops(shop_id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text DEFAULT '',
  price         numeric(10,2) NOT NULL DEFAULT 0,
  image_url     text,
  cloudinary_public_id text,
  category_id   text DEFAULT '',
  category_name text DEFAULT 'Uncategorised',
  available     boolean DEFAULT true,
  popular       boolean DEFAULT false,
  veg           boolean DEFAULT true,
  ingredients   text DEFAULT '',
  preparation_time text DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(shop_id, item_id)
);

ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 2. categories
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   text NOT NULL,
  shop_id       text NOT NULL REFERENCES public.shops(shop_id) ON DELETE CASCADE,
  name          text NOT NULL,
  image_url     text,
  sort_order    bigint DEFAULT 0,
  UNIQUE(shop_id, category_id)
);

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 3. orders
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id              text NOT NULL UNIQUE,
  order_number          text NOT NULL,
  student_id            text NOT NULL,
  student_name          text DEFAULT 'Student',
  shop_id               text NOT NULL REFERENCES public.shops(shop_id) ON DELETE CASCADE,
  shop_name             text DEFAULT '',
  items                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal              numeric(10,2) DEFAULT 0,
  discount              numeric(10,2) DEFAULT 0,
  platform_commission   numeric(10,2) DEFAULT 0,
  payment_gateway_charges numeric(10,2) DEFAULT 0,
  shop_amount           numeric(10,2) DEFAULT 0,
  total_amount          numeric(10,2) DEFAULT 0,
  currency              text DEFAULT 'INR',
  payment_status        text DEFAULT 'PENDING_PAYMENT',
  order_status          text DEFAULT 'PENDING_PAYMENT',
  receipt_id            text,
  idempotency_key       text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 4. config (platform commission etc.)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.config (
  key           text PRIMARY KEY,
  value         jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.config DISABLE ROW LEVEL SECURITY;

-- Insert default commission config
INSERT INTO public.config (key, value)
VALUES ('platform', '{"commission": {"mode": "PERCENTAGE", "value": 1}}')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 5. Add columns to shops table that the merchant dashboard needs
--    (these may already exist from the edge function, safe to run)
-- ═══════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='logo_url') THEN
    ALTER TABLE public.shops ADD COLUMN logo_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='logo_public_id') THEN
    ALTER TABLE public.shops ADD COLUMN logo_public_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='cover_image_url') THEN
    ALTER TABLE public.shops ADD COLUMN cover_image_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='cover_public_id') THEN
    ALTER TABLE public.shops ADD COLUMN cover_public_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='rating') THEN
    ALTER TABLE public.shops ADD COLUMN rating numeric(3,1) DEFAULT 4.5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='vendor_id') THEN
    ALTER TABLE public.shops ADD COLUMN vendor_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payout_configured') THEN
    ALTER TABLE public.shops ADD COLUMN payout_configured boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='location') THEN
    ALTER TABLE public.shops ADD COLUMN location text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='contact_number') THEN
    ALTER TABLE public.shops ADD COLUMN contact_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='contact_email') THEN
    ALTER TABLE public.shops ADD COLUMN contact_email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='opening_hours') THEN
    ALTER TABLE public.shops ADD COLUMN opening_hours jsonb;
  END IF;
END $$;

-- Done! Now enable Realtime for these tables in the Supabase Dashboard:
-- Go to Database → Replication → enable for: shops, menu_items, categories, orders

-- Allow SUPER_ADMIN to delete shops
CREATE POLICY "Super Admins can delete shops" ON public.shops FOR DELETE USING (public.is_admin(auth.uid()));

