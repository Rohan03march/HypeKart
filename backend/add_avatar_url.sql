-- Run this in your Supabase Dashboard -> SQL Editor to fix the sync issue

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
