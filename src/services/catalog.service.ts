// ============================================================================
// Catalog Service: src/services/catalog.service.ts
// Handles all storefront & admin read queries for products, categories, and
// collections. Uses Supabase PostgreSQL when configured, with automatic
// fallback to the local seed catalog.
// ============================================================================

import { getSupabaseServerAnonClient, getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog } from '@/database/local-store';
import { resolveProductImageUrl } from './storage.service';
import { extractReviewsFromProductRecord } from './review.service';
import { getEffectivePrice } from '@/lib/format';
import { AppConstants } from '@/constants/app.constants';
import type {
  CatalogFilterParams,
  Category,
  Collection,
  Product,
  ProductImage,
  ProductReview,
} from '@/types/domain';

const tables = AppConstants.Services.TABLES;
const catalogConstants = AppConstants.Services.CATALOG;

function normalizeProductImages(images: ProductImage[] | undefined): ProductImage[] {
  if (!images || images.length === 0) return [];
  return [...images]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      ...img,
      image_url: resolveProductImageUrl(img),
    }));
}

function cleanSizeStockMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const clean: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (k !== AppConstants.Services.REVIEWS.REVIEWS_KEY && typeof v === 'number') {
      clean[k] = v;
    }
  }
  return clean;
}

function normalizeSupabaseProduct(row: Record<string, unknown>): Product {
  const rawImages = (row.product_images ?? row.images ?? []) as ProductImage[];
  const reviewStats = extractReviewsFromProductRecord(
    row.size_stock,
    row.reviews as ProductReview[] | undefined
  );
  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ''),
    category_id: row.category_id ? String(row.category_id) : null,
    collection_id: row.collection_id ? String(row.collection_id) : null,
    price: Number(row.price),
    sale_price: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    stock: Number(row.stock ?? 0),
    sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : [],
    size_stock: cleanSizeStockMap(row.size_stock),
    color: String(row.color ?? ''),
    vendor_code: row.vendor_code ? String(row.vendor_code) : null,
    status: (row.status as Product['status']) ?? catalogConstants.STATUS_ACTIVE,
    gdrive_folder_id: row.gdrive_folder_id ? String(row.gdrive_folder_id) : null,
    last_synced_at: row.last_synced_at ? String(row.last_synced_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    category: (row.categories as Category | null) ?? (row.category as Category | null) ?? null,
    collection: (row.collections as Collection | null) ?? (row.collection as Collection | null) ?? null,
    images: normalizeProductImages(rawImages),
    reviews: reviewStats.reviews,
    review_count: reviewStats.review_count,
    average_rating: reviewStats.average_rating,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerAnonClient();
  if (supabase) {
    const { data, error } = await supabase
      .from(tables.CATEGORIES)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      return data as Category[];
    }
  }

  const local = await readLocalCatalog();
  return local.categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = getSupabaseServerAnonClient();
  if (supabase) {
    const { data, error } = await supabase
      .from(tables.COLLECTIONS)
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false });

    if (!error && data) {
      return data as Collection[];
    }
  }

  const local = await readLocalCatalog();
  return local.collections.filter((c) => c.is_active);
}

export async function getProducts(filters: CatalogFilterParams = {}): Promise<Product[]> {
  const {
    categorySlug,
    collectionSlug,
    search,
    size,
    sort = catalogConstants.DEFAULT_SORT,
    includeInactive = false,
  } = filters;

  const supabase = includeInactive
    ? getSupabaseServerAdminClient()
    : getSupabaseServerAnonClient();

  if (supabase) {
    let query = supabase
      .from(tables.PRODUCTS)
      .select('*, categories(*), collections(*), product_images(*)');

    if (!includeInactive) {
      query = query.eq('status', catalogConstants.STATUS_ACTIVE);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      const hydrated = data.map((r) => normalizeSupabaseProduct(r as Record<string, unknown>));
      return applyInMemoryCatalogFilters(hydrated, {
        categorySlug,
        collectionSlug,
        search,
        size,
        sort,
        includeInactive,
      });
    }
  }

  const local = await readLocalCatalog();
  const normalized = local.products.map((p) => {
    const reviewStats = extractReviewsFromProductRecord(p.size_stock, p.reviews);
    return {
      ...p,
      images: normalizeProductImages(p.images),
      reviews: reviewStats.reviews,
      review_count: reviewStats.review_count,
      average_rating: reviewStats.average_rating,
    };
  });

  return applyInMemoryCatalogFilters(normalized, {
    categorySlug,
    collectionSlug,
    search,
    size,
    sort,
    includeInactive,
  });
}

export function applyInMemoryCatalogFilters(
  products: Product[],
  filters: CatalogFilterParams
): Product[] {
  const {
    categorySlug,
    collectionSlug,
    search,
    size,
    sort = catalogConstants.DEFAULT_SORT,
    includeInactive = false,
  } = filters;

  let result = products.filter((p) => (includeInactive ? true : p.status === catalogConstants.STATUS_ACTIVE));

  if (categorySlug && categorySlug !== catalogConstants.ALL_FILTER_VALUE) {
    result = result.filter((p) => p.category?.slug === categorySlug);
  }

  if (collectionSlug && collectionSlug !== catalogConstants.ALL_FILTER_VALUE) {
    result = result.filter((p) => p.collection?.slug === collectionSlug);
  }

  if (size && size !== catalogConstants.ALL_FILTER_VALUE) {
    const targetSize = size.toUpperCase();
    result = result.filter((p) => p.sizes.includes(targetSize));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  result = [...result].sort((a, b) => {
    if (sort === catalogConstants.SORT_PRICE_ASC) {
      return getEffectivePrice(a.price, a.sale_price) - getEffectivePrice(b.price, b.sale_price);
    }
    if (sort === catalogConstants.SORT_PRICE_DESC) {
      return getEffectivePrice(b.price, b.sale_price) - getEffectivePrice(a.price, a.sale_price);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return result;
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getProductsPaginated(
  filters: CatalogFilterParams = {}
): Promise<PaginatedProductsResult> {
  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.max(
    1,
    Math.min(
      AppConstants.Inventory.MAX_PAGE_SIZE,
      Number(filters.limit || AppConstants.Inventory.DEFAULT_PAGE_SIZE)
    )
  );

  const allFiltered = await getProducts(filters);
  const total = allFiltered.length;
  const offset = (page - 1) * limit;
  const products = allFiltered.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    products,
    total,
    page,
    limit,
    hasMore,
  };
}

export async function getProductBySku(
  sku: string,
  options: { includeInactive?: boolean } = {}
): Promise<Product | null> {
  const cleanSku = sku.trim().toUpperCase();
  const all = await getProducts({ includeInactive: options.includeInactive });
  return all.find((p) => p.sku.toUpperCase() === cleanSku) ?? null;
}

export async function getNewCollectionProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts({ collectionSlug: catalogConstants.DEFAULT_COLLECTION_SLUG });
  return products.slice(0, limit);
}

export async function getRelatedProducts(
  currentProduct: Product,
  limit = 4
): Promise<Product[]> {
  const all = await getProducts();
  return all
    .filter(
      (p) =>
        p.sku !== currentProduct.sku &&
        (p.category_id === currentProduct.category_id ||
          p.collection_id === currentProduct.collection_id)
    )
    .slice(0, limit);
}
