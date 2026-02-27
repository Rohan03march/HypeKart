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

-- 4. Drop old status constraint and replace with updated list (includes 'Placed', 'Out for Delivery')
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

-- 5. Update any existing 'Pending' rows to 'Placed' (renames the initial state)
UPDATE public.orders SET status = 'Placed' WHERE status = 'Pending';

-- 6. Update default value for status
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'Placed';
