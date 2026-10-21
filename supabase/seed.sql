-- ============================================================================
-- Seed Data: supabase/seed.sql
-- Purpose: Realistic clothing store catalog (Categories, Collections, 10 SKUs,
--          and multi-angle product images) for immediate preview & testing.
-- ============================================================================

INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'Kurtis & Tunics', 'kurtis', 'Breathable everyday cottons and artisanal block-printed silhouettes.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80', 1, true),
  ('11111111-1111-4111-8111-111111111102', 'Co-ord Sets', 'co-ord-sets', 'Effortless tailored two-piece sets designed for work to weekend.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 2, true),
  ('11111111-1111-4111-8111-111111111103', 'Festive Suit Sets', 'suit-sets', 'Three-piece handcrafted kurta, trouser, and organza dupatta ensembles.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80', 3, true),
  ('11111111-1111-4111-8111-111111111104', 'Dresses & Midis', 'dresses', 'Fluid resort and evening dresses crafted in linen and mulmul cotton.', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 4, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO collections (id, name, slug, description, banner_url, is_featured, is_active)
VALUES
  ('22222222-2222-4222-8222-222222222201', 'New Collection', 'new-collection', 'Fresh daily warehouse arrivals—handpicked styles ready to ship.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', true, true),
  ('22222222-2222-4222-8222-222222222202', 'Festive Atelier', 'festive-atelier', 'Rich Chanderi silks, zari embroidery, and celebratory silhouettes.', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80', true, true),
  ('22222222-2222-4222-8222-222222222203', 'Everyday Linen & Cotton', 'everyday-essentials', 'Lightweight breathable staples crafted for Indian summers.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80', false, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  id, sku, name, slug, description, category_id, collection_id,
  price, sale_price, stock, sizes, size_stock, color, vendor_code, status
)
VALUES
  (
    '33333333-3333-4333-8333-333333333301',
    'SKU001',
    'Floral Handblock Mulmul Cotton Kurti',
    'floral-handblock-mulmul-cotton-kurti-sku001',
    'Soft 100% Jaipur mulmul cotton straight-fit kurti featuring botanical hand-block prints, delicate shell buttons on the placket, and side pockets.',
    '11111111-1111-4111-8111-111111111101',
    '22222222-2222-4222-8222-222222222201',
    1299.00, 1199.00, 14,
    ARRAY['S', 'M', 'L', 'XL'],
    '{"S": 3, "M": 5, "L": 4, "XL": 2}'::jsonb,
    'Indigo Blue', 'VEND-JPR-01', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    'SKU002',
    'Ivory Chanderi Zari Embroidered Suit Set',
    'ivory-chanderi-zari-embroidered-suit-set-sku002',
    'Luminous three-piece festive suit set in woven Chanderi silk cotton. Paired with straight cigarette trousers and a scalloped organza dupatta.',
    '11111111-1111-4111-8111-111111111103',
    '22222222-2222-4222-8222-222222222202',
    3499.00, 2999.00, 9,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    '{"S": 2, "M": 3, "L": 2, "XL": 1, "XXL": 1}'::jsonb,
    'Ivory Gold', 'VEND-SUR-04', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    'SKU003',
    'Terracotta Linen Relaxed Co-ord Set',
    'terracotta-linen-relaxed-coord-set-sku003',
    'Breathable flax-linen co-ord featuring a drop-shoulder collared tunic shirt and wide-leg elasticated culottes with deep utility pockets.',
    '11111111-1111-4111-8111-111111111102',
    '22222222-2222-4222-8222-222222222201',
    2499.00, 2199.00, 18,
    ARRAY['S', 'M', 'L', 'XL'],
    '{"S": 4, "M": 6, "L": 5, "XL": 3}'::jsonb,
    'Terracotta Rust', 'VEND-BLR-02', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    'SKU004',
    'Sage Green Chikankari Modal Tunic',
    'sage-green-chikankari-modal-tunic-sku004',
    'Hand-embroidered Lucknowi Chikankari short kurti crafted in buttery modal cotton. Ideal for pairing with denim or white palazzos.',
    '11111111-1111-4111-8111-111111111101',
    '22222222-2222-4222-8222-222222222201',
    1699.00, 1449.00, 12,
    ARRAY['XS', 'S', 'M', 'L', 'XL'],
    '{"XS": 2, "S": 3, "M": 4, "L": 2, "XL": 1}'::jsonb,
    'Sage Green', 'VEND-LKO-01', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333305',
    'SKU005',
    'Midnight Botanical Wrap Midi Dress',
    'midnight-botanical-wrap-midi-dress-sku005',
    'Flattering true-wrap midi dress in fluid viscose crepe with flutter sleeves, adjustable waist tie, and a tiered hem.',
    '11111111-1111-4111-8111-111111111104',
    '22222222-2222-4222-8222-222222222201',
    2299.00, NULL, 8,
    ARRAY['S', 'M', 'L'],
    '{"S": 2, "M": 4, "L": 2}'::jsonb,
    'Midnight Navy', 'VEND-DEL-03', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333306',
    'SKU006',
    'Crimson Bandhani Mirrorwork Anarkali Set',
    'crimson-bandhani-mirrorwork-anarkali-set-sku006',
    'Celebratory flared Kalidar Anarkali featuring authentic Bandhani tie-dye notes and real foil mirror embroidery along the neckline.',
    '11111111-1111-4111-8111-111111111103',
    '22222222-2222-4222-8222-222222222202',
    4299.00, 3799.00, 6,
    ARRAY['M', 'L', 'XL', 'XXL'],
    '{"M": 2, "L": 2, "XL": 1, "XXL": 1}'::jsonb,
    'Crimson Red', 'VEND-JPR-01', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333307',
    'SKU007',
    'Monochrome Ikat Tailored Co-ord Set',
    'monochrome-ikat-tailored-coord-set-sku007',
    'Handwoven Pochampally Ikat cotton co-ord featuring a structured V-neck waistcoat top and tapered ankle-grazer pants.',
    '11111111-1111-4111-8111-111111111102',
    '22222222-2222-4222-8222-222222222203',
    2199.00, 1899.00, 15,
    ARRAY['S', 'M', 'L', 'XL'],
    '{"S": 4, "M": 5, "L": 4, "XL": 2}'::jsonb,
    'Charcoal & Ecru', 'VEND-HYD-02', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333308',
    'SKU008',
    'Sunlit Marigold Tiered Cotton Maxi Dress',
    'sunlit-marigold-tiered-cotton-maxi-dress-sku008',
    'Breezy tiered summer maxi dress in Cambric cotton with delicate schiffli lace inserts, smocked bodice, and concealed pockets.',
    '11111111-1111-4111-8111-111111111104',
    '22222222-2222-4222-8222-222222222201',
    1999.00, 1699.00, 11,
    ARRAY['XS', 'S', 'M', 'L'],
    '{"XS": 2, "S": 4, "M": 3, "L": 2}'::jsonb,
    'Marigold Yellow', 'VEND-JPR-01', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333309',
    'SKU009',
    'Dusty Rose Organza Lace Kurta & Palazzo',
    'dusty-rose-organza-lace-kurta-palazzo-sku009',
    'Pastel dusty rose straight kurta accented with vintage crochet lace sleeves and scalloped cotton-silk palazzos.',
    '11111111-1111-4111-8111-111111111103',
    '22222222-2222-4222-8222-222222222202',
    2899.00, 2499.00, 4,
    ARRAY['S', 'M', 'L', 'XL'],
    '{"S": 1, "M": 1, "L": 1, "XL": 1}'::jsonb,
    'Dusty Rose', 'VEND-SUR-04', 'ACTIVE'
  ),
  (
    '33333333-3333-4333-8333-333333333310',
    'SKU010',
    'Kalamkari Artisanal A-Line Everyday Kurti',
    'kalamkari-artisanal-aline-everyday-kurti-sku010',
    'Authentic earthy Kalamkari print A-line kurti with mandarin collar, 3/4th roll-up sleeves, and breathable South cotton weave.',
    '11111111-1111-4111-8111-111111111101',
    '22222222-2222-4222-8222-222222222203',
    1399.00, NULL, 20,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    '{"S": 4, "M": 6, "L": 5, "XL": 3, "XXL": 2}'::jsonb,
    'Earthy Olive', 'VEND-HYD-02', 'ACTIVE'
  )
ON CONFLICT (sku) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed Product Images (Multi-angle: front.jpg, back.jpg, model.jpg per SKU)
-- ----------------------------------------------------------------------------
INSERT INTO product_images (product_id, sku, s3_key, image_url, alt_text, display_order, is_primary)
VALUES
  -- SKU001
  ('33333333-3333-4333-8333-333333333301', 'SKU001', 'SKU001/front.jpg', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', 'Floral Handblock Mulmul Cotton Kurti - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333301', 'SKU001', 'SKU001/model.jpg', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85', 'Floral Handblock Mulmul Cotton Kurti - Editorial Look', 1, false),
  ('33333333-3333-4333-8333-333333333301', 'SKU001', 'SKU001/back.jpg', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', 'Floral Handblock Mulmul Cotton Kurti - Fabric Detail', 2, false),

  -- SKU002
  ('33333333-3333-4333-8333-333333333302', 'SKU002', 'SKU002/front.jpg', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85', 'Ivory Chanderi Zari Embroidered Suit Set - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333302', 'SKU002', 'SKU002/model.jpg', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', 'Ivory Chanderi Zari Embroidered Suit Set - Full Drape', 1, false),
  ('33333333-3333-4333-8333-333333333302', 'SKU002', 'SKU002/back.jpg', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85', 'Ivory Chanderi Zari Embroidered Suit Set - Zari Detail', 2, false),

  -- SKU003
  ('33333333-3333-4333-8333-333333333303', 'SKU003', 'SKU003/front.jpg', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', 'Terracotta Linen Relaxed Co-ord Set - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333303', 'SKU003', 'SKU003/model.jpg', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', 'Terracotta Linen Relaxed Co-ord Set - Side Profile', 1, false),
  ('33333333-3333-4333-8333-333333333303', 'SKU003', 'SKU003/back.jpg', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=85', 'Terracotta Linen Relaxed Co-ord Set - Back View', 2, false),

  -- SKU004
  ('33333333-3333-4333-8333-333333333304', 'SKU004', 'SKU004/front.jpg', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=85', 'Sage Green Chikankari Modal Tunic - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333304', 'SKU004', 'SKU004/model.jpg', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85', 'Sage Green Chikankari Modal Tunic - Close Up', 1, false),

  -- SKU005
  ('33333333-3333-4333-8333-333333333305', 'SKU005', 'SKU005/front.jpg', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85', 'Midnight Botanical Wrap Midi Dress - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333305', 'SKU005', 'SKU005/model.jpg', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85', 'Midnight Botanical Wrap Midi Dress - Movement Shot', 1, false),
  ('33333333-3333-4333-8333-333333333305', 'SKU005', 'SKU005/back.jpg', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85', 'Midnight Botanical Wrap Midi Dress - Back View', 2, false),

  -- SKU006
  ('33333333-3333-4333-8333-333333333306', 'SKU006', 'SKU006/front.jpg', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85', 'Crimson Bandhani Mirrorwork Anarkali Set - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333306', 'SKU006', 'SKU006/model.jpg', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85', 'Crimson Bandhani Mirrorwork Anarkali Set - Full Flare', 1, false),

  -- SKU007
  ('33333333-3333-4333-8333-333333333307', 'SKU007', 'SKU007/front.jpg', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85', 'Monochrome Ikat Tailored Co-ord Set - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333307', 'SKU007', 'SKU007/model.jpg', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85', 'Monochrome Ikat Tailored Co-ord Set - Full Silhouette', 1, false),

  -- SKU008
  ('33333333-3333-4333-8333-333333333308', 'SKU008', 'SKU008/front.jpg', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85', 'Sunlit Marigold Tiered Cotton Maxi Dress - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333308', 'SKU008', 'SKU008/model.jpg', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85', 'Sunlit Marigold Tiered Cotton Maxi Dress - Outdoor Look', 1, false),

  -- SKU009
  ('33333333-3333-4333-8333-333333333309', 'SKU009', 'SKU009/front.jpg', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', 'Dusty Rose Organza Lace Kurta & Palazzo - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333309', 'SKU009', 'SKU009/model.jpg', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85', 'Dusty Rose Organza Lace Kurta & Palazzo - Detail View', 1, false),

  -- SKU010
  ('33333333-3333-4333-8333-333333333310', 'SKU010', 'SKU010/front.jpg', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85', 'Kalamkari Artisanal A-Line Everyday Kurti - Front View', 0, true),
  ('33333333-3333-4333-8333-333333333310', 'SKU010', 'SKU010/model.jpg', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=85', 'Kalamkari Artisanal A-Line Everyday Kurti - Side View', 1, false);
