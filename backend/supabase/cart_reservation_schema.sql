-- Create the reserved_stock table
CREATE TABLE IF NOT EXISTS public.reserved_stock (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_clerk_id varchar(255) NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    quantity int NOT NULL CHECK (quantity > 0),
    expires_at timestamp with time zone NOT NULL,
    status varchar(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.reserved_stock ENABLE ROW LEVEL SECURITY;

-- Create an RPC to safely reserve stock (atomically checks effective stock)
CREATE OR REPLACE FUNCTION reserve_cart_item(
    p_user_id varchar, 
    p_product_id uuid, 
    p_quantity int, 
    p_minutes int DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_physical_stock int;
    v_reserved_stock int;
    v_effective_stock int;
BEGIN
    -- 1. Lock the product row to prevent race conditions during calculation
    SELECT stock INTO v_physical_stock 
    FROM products 
    WHERE id = p_product_id 
    FOR UPDATE;

    -- 2. Calculate currently active reservations (that haven't expired)
    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_stock 
    FROM reserved_stock 
    WHERE product_id = p_product_id 
    AND status = 'ACTIVE' 
    AND expires_at > now();

    -- 3. Calculate what's actually available to add to cart
    v_effective_stock := v_physical_stock - v_reserved_stock;

    -- 4. Check if there is enough effective stock to grant this reservation
    IF v_effective_stock >= p_quantity THEN
        -- Insert the reservation
        INSERT INTO reserved_stock (user_clerk_id, product_id, quantity, expires_at, status)
        VALUES (p_user_id, p_product_id, p_quantity, now() + (p_minutes || ' minutes')::interval, 'ACTIVE');
        
        RETURN true;
    ELSE
        RETURN false; -- Not enough stock available right now
    END IF;
END;
$$;

-- Create a function that pg_cron can call to clean up expired reservations
-- And actually return the stock so WebSockets fire if we use triggers.
-- Actually, the easiest way to fire the WebSockets for clients listening to `products`
-- is to run an empty UPDATE on products when a reservation expires.
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT product_id 
        FROM reserved_stock 
        WHERE status = 'ACTIVE' AND expires_at <= now()
        FOR UPDATE
    LOOP
        -- Mark as expired
        UPDATE reserved_stock SET status = 'EXPIRED' WHERE product_id = r.product_id AND status = 'ACTIVE' AND expires_at <= now();
        
        -- Touch the products table to force a Realtime WebSocket broadcast
        -- This tells the mobile apps to re-fetch/re-calculate or just triggers their listeners
        UPDATE products SET stock = stock WHERE id = r.product_id;
    END LOOP;
END;
$$;

-- NOTE: To fully automate this, the user must run this in Supabase SQL editor:
-- Function to force a real-time broadcast so clients see the adjusted stock
CREATE OR REPLACE FUNCTION trigger_product_update(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Just update it to itself to trigger the Postgres Wal/Realtime engine
    UPDATE products SET stock = stock WHERE id = p_product_id;
END;
$$;
--    select release_expired_reservations();
-- $$);
