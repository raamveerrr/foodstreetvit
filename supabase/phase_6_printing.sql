-- ================================================================
-- Phase 6: Thermal Receipt Printing Engine — Database Migration
-- Run in Supabase Dashboard → SQL Editor
-- ================================================================

-- ================================================================
-- 1. printers
-- Tracks paired thermal printers per shop. One shop can have
-- multiple printers (e.g., kitchen + checkout counter).
-- ================================================================
CREATE TABLE IF NOT EXISTS public.printers (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id                 text NOT NULL REFERENCES public.shops(shop_id) ON DELETE CASCADE,
  name                    text NOT NULL DEFAULT 'Printer',
  connection_type         text NOT NULL DEFAULT 'USB', -- 'USB' | 'LAN'
  connection_address      text,                        -- null for USB, IP:port for LAN
  status                  text NOT NULL DEFAULT 'OFFLINE', -- 'ONLINE' | 'OFFLINE' | 'ERROR'
  pairing_code            text,                        -- one-time 6-digit code, cleared after use
  pairing_code_expires_at timestamptz,
  auth_token_hash         text,                        -- hashed bearer token for print agent
  last_seen_at            timestamptz,
  created_at              timestamptz DEFAULT now()
);

-- RLS for printers
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

-- Shop owners can read/update their own printers
CREATE POLICY "Shop owners can read their printers"
  ON public.printers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = printers.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

CREATE POLICY "Shop owners can update their printers"
  ON public.printers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = printers.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

CREATE POLICY "Shop owners can insert printers"
  ON public.printers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = printers.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- ================================================================
-- 2. print_jobs
-- Queue of receipt print requests. UNIQUE on order_id ensures
-- idempotency: one order can never produce more than one print job.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.print_jobs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  receipt_id      uuid REFERENCES public.receipts(id) ON DELETE SET NULL,
  shop_id         text NOT NULL REFERENCES public.shops(shop_id) ON DELETE CASCADE,
  printer_id      uuid REFERENCES public.printers(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'QUEUED', -- QUEUED | PRINTING | PRINTED | FAILED | CANCELLED
  attempt_count   int NOT NULL DEFAULT 0,
  priority        int NOT NULL DEFAULT 0,         -- higher = more urgent (future use)
  last_error      text,
  locked_at       timestamptz,                    -- set when agent claims job (prevents dual-printing)
  is_test         boolean NOT NULL DEFAULT false, -- test prints don't have a real order
  created_at      timestamptz DEFAULT now(),
  started_at      timestamptz,
  printed_at      timestamptz,
  failed_at       timestamptz
);

-- Critical: One print job per real order maximum (idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS print_jobs_order_id_idx
  ON public.print_jobs(order_id)
  WHERE order_id IS NOT NULL;

-- Index for agent polling: find queued jobs for a specific shop
CREATE INDEX IF NOT EXISTS print_jobs_shop_status_idx
  ON public.print_jobs(shop_id, status, created_at);

-- RLS for print_jobs
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

-- Shop owners can see all jobs for their shop
CREATE POLICY "Shop owners can read their print jobs"
  ON public.print_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = print_jobs.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- Shop owners can cancel/manage their jobs
CREATE POLICY "Shop owners can update their print jobs"
  ON public.print_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = print_jobs.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- Shop owners can insert test print jobs
CREATE POLICY "Shop owners can insert test print jobs"
  ON public.print_jobs FOR INSERT
  WITH CHECK (
    is_test = true
    AND EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = print_jobs.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

-- ================================================================
-- 3. Stale job cleanup function
-- Auto-releases jobs that have been in PRINTING state for > 5 mins
-- (crash recovery: agent died mid-print, job gets re-queued)
-- ================================================================
CREATE OR REPLACE FUNCTION public.release_stale_print_jobs()
RETURNS void AS $$
BEGIN
  UPDATE public.print_jobs
  SET
    status = 'QUEUED',
    locked_at = NULL,
    last_error = 'Auto-released after stale lock timeout'
  WHERE
    status = 'PRINTING'
    AND locked_at < NOW() - INTERVAL '5 minutes'
    AND attempt_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- DONE
-- Next: Run verify-cashfree-payment and cashfree-webhook updates
-- to automatically INSERT print_jobs on successful payment.
-- ================================================================

-- Shop owners can delete their printers
CREATE POLICY "Shop owners can delete their printers"
  ON public.printers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.shop_id = printers.shop_id
      AND shops.owner_uid = auth.uid()::text
    )
  );

