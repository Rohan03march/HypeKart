# HypeKart - Complete Production-Ready Architecture

## 1. Technology Stack Overview
- **Mobile App**: Expo (React Native) with TypeScript
- **Backend/Admin Panel**: Next.js (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Clerk (Google Sign-In + Email/Password)
- **File Storage**: Cloudinary (Product images, Avatars, WebP compression)
- **Payments**: Razorpay (UPI, Cards, Net Banking)
- **State Management**: Zustand (Global state), TanStack Query (Server state/Caching)
- **UI/Styling (Mobile)**: StyleSheet / Tailwind (NativeWind) + Reanimated (Animations) + Expo Haptics

---

## 2. Folder Structure

### Mobile Application (`/mobile`)
```text
/mobile
├── /assets                 # Fonts, splash screens, local static images
├── /src
│   ├── /api                # Axios/Fetch setup, TanStack query hooks
│   ├── /components         # Global reusable components
│   │   ├── /ui             # Buttons, Inputs, Cards, Shimmers, Skeleton Loaders
│   │   ├── /product        # ProductCard, ImageCarousel, SizeSelector
│   │   ├── /cart           # CartItem, CheckoutSummary
│   │   └── /navigation     # BottomTabs, TopTabs, CustomHeaders
│   ├── /constants          # Theme, colors, typography, layout dimensions
│   ├── /hooks              # Custom hooks (e.g., useCart, useAuth, useDebounce)
│   ├── /navigation         # React Navigation setup (Root, Auth, Main stacks)
│   ├── /screens            # App screens
│   │   ├── /auth           # Splash, Onboarding, Login, Register
│   │   ├── /home           # Home, Category, Search, ProductDetails
│   │   ├── /cart           # Cart, Checkout
│   │   ├── /profile        # Profile, Orders, Addresses, Settings
│   ├── /store              # Zustand slices (cartStore, authStore, userStore)
│   ├── /types              # TypeScript interfaces and types
│   └── /utils              # Helpers (formatters, validation, Razorpay logic)
├── App.tsx                 # Root entry, Providers (Clerk, Query, Navigation)
└── app.json                # Expo config
```

### Backend & Admin Panel (`/backend`)
```text
/backend
├── /public                 # Static assets
├── /src
│   ├── /app                # Next.js App Router
│   │   ├── /api            # Backend API routes
│   │   │   ├── /webhooks   # Clerk and Razorpay webhooks
│   │   │   ├── /payments   # create-order, verify-payment
│   │   │   └── /admin      # Admin specific API endpoints
│   │   ├── /(admin)        # Admin Panel UI routes
│   │   │   ├── /dashboard  # Revenue, analytics
│   │   │   ├── /products   # Add, edit, inventory
│   │   │   └── /orders     # Order tracking and status management
│   ├── /components         # Admin UI components
│   ├── /lib                # Supabase client, Razorpay instance, Cloudinary config
│   ├── /types              # Database schema types (auto-generated from Supabase)
│   ├── /middleware.ts      # Clerk auth and Role Based Access Control middleware
│   └── /utils              # Server-side utilities
├── tailwind.config.ts      # Tailwind configuration for Admin Panel
├── next.config.mjs         # Next.js config
└── package.json
```

---

## 3. Supabase SQL Schema (PostgreSQL)

```sql
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
```

---

## 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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
-- Admin checks can be done via a function or checking user role
```

---

## 5. Razorpay Backend Integration Example (Next.js)

### `src/app/api/payments/create-order/route.ts`
```typescript
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAuth } from '@clerk/nextjs/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount } = await req.json(); // Amount in INR

    // Verify cart amount against database here before creating order

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: order.amount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
```

### `src/app/api/payments/verify-payment/route.ts`
```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServiceRole } from '@/lib/supabase'; // Bypass RLS

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, shippingAddress, userId } = await req.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
    }

    // Payment is authentic: Create Order in Supabase
    const { data: order, error: orderError } = await supabaseServiceRole
      .from('orders')
      .insert({
        user_id: userId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        total_amount: /* calc total */ 1000,
        shipping_address: shippingAddress,
        status: 'Processing'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 1. Insert order items into 'order_items'
    // 2. Reduce product stock recursively
    // 3. Clear user cart

    return NextResponse.json({ success: true, orderId: order.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
```

---

## 6. Environment Variables

### Mobile App (`/mobile/.env`)
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
EXPO_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Backend & Admin (`/backend/.env`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey... # Keep secret - Bypasses RLS

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 7. Step-by-Step Development Roadmap

1. **Foundations**: Initialize Next.js (Admin/Backend) and Expo (React Native). Set up absolute imports and structure.
2. **Database Setup**: Connect Supabase, execute SQL schemas, enable RLS, configure Cloudinary image storage.
3. **Authentication**: Integrate Clerk across Mobile (OAuth/Email) and Web Admin. Trigger webhooks to insert users into Supabase.
4. **Mobile Skeleton**: Set up Bottom Tab Navigation, Home UI, Zustand/TanStack Query wrapping, responsive typography/spacing.
5. **Backend APIs**: Create core CRUD routes in Next.js Server Actions or Route Handlers for the App to consume (e.g., fetch product catalogs). 
6. **Mobile Products**: Develop dynamic Product Details Page, add-to-cart logic with local MMKV persistence synced with Supabase.
7. **Payments Ecosystem**: Build the Razorpay integrations using Next.js backend, wire it up securely with the Mobile App.
8. **Admin Panel**: Build the React Native web frontend (Next.js components) for Admin actions (Products, Orders, Dashboard).
9. **Polishing**: Refine components visually. Implement React Native Reanimated hero transitions from Home to Details screens.
10. **Test & Ship**: Implement strict error boundaries, verify deployment with Expo EAS, deploy Next.js Admin to Vercel.

---

## 8. Deployment Strategy

- **Mobile App**:
  - Build using Expo Action Services (EAS): `eas build --platform all`.
  - Submit directly to Apple TestFlight/Play Store Internal: `eas submit`.
  - Distribute quick non-native fixes via Expo OTA (Over-The-Air) updates.
- **Backend / Admin Panel**:
  - Deploy to Vercel. Native caching rules (Draft Mode, ISR) ensure top-tier performance on Next.js.
- **Database**:
  - Hosted directly on Supabase PostgreSQL instances with weekly backups securely running.

---

## 9. Scaling Strategy (100K+ Users)

1. **Supabase Optimizations**: Setup Redis (Upstash) or utilize Supabase standard indexing on `clerk_id` and generic high-volume queries. Rate limit aggressively using specific IP blocks depending on deployment choice.
2. **Cloudinary Power**: Always rely on dynamic constraints (e.g., `f_auto,q_auto:good`) for serving images. Never process large raw `.png`/`.jpg` files natively in app runtime.
3. **Caching**: Next.js route caching mechanisms should handle product inventory GET requests, with ISR (Incremental Static Regeneration) ensuring real-time capabilities without hitting DB connections constantly.
4. **Resiliency**: Handle database concurrency smartly. E.g., Razorpay verification API endpoints must be completely idempotent (if called twice abruptly, duplicate order processing is rejected). No race conditions.
