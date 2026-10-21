-- ============================================================================
-- Migration: 0001_initial_schema.sql
-- Purpose: Production e-commerce schema for clothing retailer with SKU-first
--          Google Drive -> S3 -> Supabase synchronization support.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'COD'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- Updated_at Trigger Helper
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON categories(is_active, display_order);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 2. collections
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  banner_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active_featured ON collections(is_active, is_featured);

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. products
--    `sku` is the unique business key matching products.csv and Drive folder names
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price <= price)),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sizes TEXT[] NOT NULL DEFAULT '{}',
  size_stock JSONB NOT NULL DEFAULT '{}'::jsonb,
  color VARCHAR(64) NOT NULL DEFAULT '',
  vendor_code VARCHAR(64),
  status product_status NOT NULL DEFAULT 'ACTIVE',
  gdrive_folder_id VARCHAR(128),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_collection_status ON products(collection_id, status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. product_images
--    Stores S3 keys & CDN/image URLs ONLY (never binary blobs in PostgreSQL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(64) NOT NULL,
  s3_key TEXT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_order ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_sku ON product_images(sku);

-- ----------------------------------------------------------------------------
-- 5. customers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(64) NOT NULL DEFAULT 'IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON customers(auth_user_id);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(32) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(128),
  subtotal_amount NUMERIC(10, 2) NOT NULL CHECK (subtotal_amount >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(100),
  notes TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku VARCHAR(64) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  selected_size VARCHAR(32) NOT NULL,
  color VARCHAR(64),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current JWT belongs to an admin user
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read access for active catalog items
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true OR is_admin_user());

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Public can read active collections"
  ON collections FOR SELECT
  USING (is_active = true OR is_admin_user());

CREATE POLICY "Admins can manage collections"
  ON collections FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (status = 'ACTIVE' OR is_admin_user());

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Public can read images of active products"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND (p.status = 'ACTIVE' OR is_admin_user())
    )
  );

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Customers & Orders: Allow storefront checkout creation and profile/order access
CREATE POLICY "Storefront and customers can manage customer records"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Storefront and customers can manage orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Storefront and customers can manage order items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);
