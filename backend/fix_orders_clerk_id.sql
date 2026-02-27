-- ============================================================
-- HypeKart — Fix: Link Orders to Clerk Users
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Add clerk_user_id column (if not already added)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Step 2: Verify — run this to see your existing orders
-- SELECT id, user_id, clerk_user_id, total_amount, status, created_at
-- FROM public.orders
-- ORDER BY created_at DESC;

-- Step 3: Backfill all existing orders with YOUR Clerk user ID.
-- Find your Clerk ID in: Clerk Dashboard → Users → click your user → copy the ID (starts with user_)
-- Then run:
UPDATE public.orders
  SET clerk_user_id = 'PASTE_YOUR_CLERK_USER_ID_HERE'
  WHERE clerk_user_id IS NULL;

-- Example:
-- UPDATE public.orders
--   SET clerk_user_id = 'user_2abc123XYZ...'
--   WHERE clerk_user_id IS NULL;
