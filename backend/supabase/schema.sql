-- ENUMS
CREATE TYPE gender_enum AS ENUM ('Men', 'Women', 'Kids', 'All');
CREATE TYPE order_status AS ENUM ('Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled');

-- USERS Table (Synced with Clerk via Webhooks)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Matches Clerk user ID mapping (or use string if storing clerk directly)
  clerk_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  avatar_url VARCHAR,
  gender_preference gender_enum,
  onboarding_completed BOOLEAN DEFAULT false,
  role VARCHAR DEFAULT 'customer', -- 'customer' or 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  image_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  images JSONB NOT NULL, -- Array of Cloudinary URLs
  sizes TEXT[] NOT NULL, -- e.g., ['S', 'M', 'L', 'XL']
  colors TEXT[] NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  is_trending BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR, -- 'Home', 'Work'
  full_name VARCHAR,
  phone VARCHAR,
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR,
  state VARCHAR,
  pincode VARCHAR,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CART ITEMS Table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_size VARCHAR,
  selected_color VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITES Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ORDERS Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR UNIQUE,
  razorpay_payment_id VARCHAR UNIQUE,
  razorpay_signature VARCHAR,
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  status order_status DEFAULT 'Processing',
  shipping_address JSONB NOT NULL, -- Snapshot of address at time of order
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  selected_size VARCHAR,
  selected_color VARCHAR
);

-- REVIEWS Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- USERS: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = clerk_id);

-- ADDRESSES: Users can manage only their own addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- CART ITEMS: Users can manage their own cart
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ORDERS: Users can view their own orders. Only Service Role (Backend) can INSERT.
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
-- No INSERT/UPDATE policy for users on orders. API manages this using service_role key.

-- PRODUCTS: Anyone can read, only admin can manage
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
