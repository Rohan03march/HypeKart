CREATE OR REPLACE FUNCTION process_order_inventory(order_items jsonb)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
  current_stock int;
BEGIN
  -- We use a FOR loop to iterate through each item in the parsed JSON array
  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    -- Lock the row for update so no other transactions can modify it simultaneously
    SELECT stock INTO current_stock 
    FROM products 
    WHERE id = (item->>'product_id')::uuid 
    FOR UPDATE;
    
    -- Check if we have enough stock
    IF current_stock < (item->>'quantity')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product ID %', item->>'product_id';
    END IF;

    -- Decrement the stock atomically using calculated value
    UPDATE products 
    SET stock = stock - (item->>'quantity')::int 
    WHERE id = (item->>'product_id')::uuid;
  END LOOP;
  
  -- If we successfully drop stock for all items, commit (handled implicitly by PostgreSQL function block)
  RETURN true;
END;
$$;
