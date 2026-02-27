-- HypeKart Orders Table Migration
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Add payment_id column (Razorpay payment reference)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 2. Add order_items as a JSONB array: [{product_id, name, image, size, color, price, quantity}]
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_items JSONB DEFAULT '[]'::jsonb;

-- 3. Add shipping_address as JSONB: {full_name, phone, address, city, state, pincode}
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;

-- 4. Add clerk_user_id for direct mobile querying (no FK join needed)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- 5. Drop old status constraint and replace with updated list (includes 'Placed', 'Out for Delivery')
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested'));

-- 6. Update any existing 'Pending' rows to 'Placed'
UPDATE public.orders SET status = 'Placed' WHERE status = 'Pending';

-- 7. Update default value for status
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Placed';

-- ─── BACKFILL clerk_user_id for existing orders ──────────────────────────────
-- After running the above, run this to link existing orders to clerk users.
-- Replace each 'user_clerk_id_here' with the actual Clerk user ID (starts with 'user_').
-- You can find your Clerk user ID in the Clerk Dashboard → Users section.
--
-- Example (run for each user who has placed orders):
-- UPDATE public.orders
--   SET clerk_user_id = 'user_xxxxxxxxxxxxxxxxxxxxxxxx'
--   WHERE user_id = (SELECT id FROM public.users WHERE clerk_id = 'user_xxxxxxxxxxxxxxxxxxxxxxxx');
