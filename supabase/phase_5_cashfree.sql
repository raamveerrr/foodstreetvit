-- Phase 5: Cashfree Secure Checkout Migration
-- Includes tables for exact payment tracking, strict receipt issuance, and webhook idempotency.

-- ═══════════════════════════════════════════════════════════════
-- 1. payments
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_order_id          uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  student_id            text NOT NULL,
  shop_id               text NOT NULL REFERENCES public.shops(shop_id),
  cashfree_order_id     text UNIQUE NOT NULL,
  cashfree_payment_id   text,
  payment_session_id    text,
  amount                numeric(10,2) NOT NULL,
  currency              text DEFAULT 'INR',
  payment_status        text DEFAULT 'PENDING',
  payment_method        text,
  student_email         text,
  student_phone         text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid()::text = student_id);

CREATE POLICY "Shop owners can read their shop payments" 
  ON public.payments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.shop_id = payments.shop_id 
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- Only service role (Edge Functions) can insert/update payments
-- No insert/update policies for browser roles.

-- ═══════════════════════════════════════════════════════════════
-- 2. receipts
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.receipts (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number        text UNIQUE NOT NULL,
  order_id              uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  student_id            text NOT NULL,
  shop_id               text NOT NULL REFERENCES public.shops(shop_id),
  status                text DEFAULT 'ACTIVE',
  redeemed_at           timestamptz,
  redeemed_by           text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Unique constraint ensuring 1 receipt per order maximum
CREATE UNIQUE INDEX IF NOT EXISTS receipts_order_idx ON public.receipts(order_id);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own receipts" 
  ON public.receipts 
  FOR SELECT 
  USING (auth.uid()::text = student_id);

CREATE POLICY "Shop owners can read their shop receipts" 
  ON public.receipts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.shop_id = receipts.shop_id 
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- Shop owner can update status to REDEEMED (but not insert or delete)
CREATE POLICY "Shop owners can redeem receipts"
  ON public.receipts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.shop_id = receipts.shop_id 
      AND shops.owner_uid = auth.uid()::text
    )
  )
  WITH CHECK (
    status = 'REDEEMED' 
    AND EXISTS (
      SELECT 1 FROM public.shops 
      WHERE shops.shop_id = receipts.shop_id 
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. payment_webhook_events (Idempotency)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id              text UNIQUE NOT NULL,
  event_type            text NOT NULL,
  cashfree_order_id     text NOT NULL,
  payload_hash          text,
  processing_status     text DEFAULT 'PENDING',
  received_at           timestamptz DEFAULT now(),
  processed_at          timestamptz
);

-- Webhook table has no RLS policies, it is strictly server-side managed.
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 4. Extend shops table for Easy Split Vendor Tracking
-- ═══════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='cashfree_vendor_id') THEN
    ALTER TABLE public.shops ADD COLUMN cashfree_vendor_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='cashfree_vendor_status') THEN
    ALTER TABLE public.shops ADD COLUMN cashfree_vendor_status text DEFAULT 'PENDING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_ready') THEN
    ALTER TABLE public.shops ADD COLUMN payment_ready boolean DEFAULT false;
  END IF;
END $$;
