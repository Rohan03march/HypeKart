-- Supabase HypeKart Schema Definition
-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Create the Users Table (Public profiles extending auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID ON DELETE CASCADE PRIMARY KEY,
    clerk_id TEXT, -- Legacy ID or internal tracking
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    onboarding_completed BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_new_arrival BOOLEAN DEFAULT true,
    brand TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Set up Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Product Policies (Everyone can read, only Admins can write - though our server uses Service Role Key which bypasses RLS)
CREATE POLICY "Products are viewable by everyone." 
ON public.products FOR SELECT USING (true);
