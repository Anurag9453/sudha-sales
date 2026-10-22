// ============================================================================
// Domain Types: src/types/domain.ts
// Strict TypeScript definitions aligned with Supabase PostgreSQL schema and
// the future Google Drive CSV + Amazon S3 synchronization pipeline.
// ============================================================================

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD';

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'FREE';

export const STANDARD_SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  sku: string;
  /** Relative key in Amazon S3 bucket, e.g. "SKU001/front.jpg" */
  s3_key: string | null;
  /** Full resolved CDN/S3 URL or external image URL */
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  sku: string;
  customer_name: string;
  customer_email?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  selected_size?: string;
  created_at: string;
}

export interface Product {
  id: string;
  /** Unique business key connecting products.csv and Google Drive/S3 image folder */
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  collection_id: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  /** Array of available sizes (parsed from pipe-delimited CSV e.g. M|L|XL) */
  sizes: string[];
  /** Optional size-level stock breakdown for future granular inventory */
  size_stock: Record<string, number>;
  color: string;
  vendor_code: string | null;
  status: ProductStatus;
  gdrive_folder_id: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  /** Hydrated relations */
  category?: Category | null;
  collection?: Collection | null;
  images: ProductImage[];
  /** Customer reviews & computed average rating (empty/null until a customer leaves a review) */
  reviews?: ProductReview[];
  average_rating?: number | null;
  review_count?: number;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressSnapshot {
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  sku: string;
  product_name: string;
  selected_size: string;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  subtotal_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: ShippingAddressSnapshot;
  tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  delivered_at?: string | null;
  items?: OrderItem[];
}

export interface CustomerStoredAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  provider: 'google';
  created_at: string;
}

export interface CartItem {
  sku: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  color: string;
  size: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  maxStock: number;
}

export interface CatalogFilterParams {
  categorySlug?: string;
  collectionSlug?: string;
  search?: string;
  size?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
  includeInactive?: boolean;
}

/**
 * Represents a row in the future Google Drive `products.csv` file:
 * SKU,Product_Name,Category,Collection,Description,Price,Sale_Price,Stock,Size,Color,Status
 */
export interface GoogleDriveCsvProductRow {
  SKU: string;
  Product_Name: string;
  Category: string;
  Collection: string;
  Description: string;
  Price: string;
  Sale_Price?: string;
  Stock: string;
  Size: string; // Pipe-delimited e.g. "M|L|XL"
  Color: string;
  Status: ProductStatus;
}
