-- Enable Cashfree Payments for all shops in sandbox mode
-- This fulfills the Edge Function requirements allowing test checkouts for every merchant
UPDATE shops
SET 
  payment_ready = true,
  cashfree_vendor_id = 'test_vendor'
WHERE cashfree_vendor_id IS NULL;
