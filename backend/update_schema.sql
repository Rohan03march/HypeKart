-- Supabase HypeKart Schema Update
-- Run this in your Supabase Dashboard -> SQL Editor to enable the new Granular Roles

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin', 'super_admin', 'inventory_manager'));
