// ============================================================================
// Product Review & Rating Service: src/services/review.service.ts
// - Initially when the store launches, products have 0 reviews (`review_count: 0`,
//   `average_rating: null`), so no rating badge is shown.
// - As soon as a customer leaves a star rating (1-5) and comment, the review is
//   stored on the product record in Supabase PostgreSQL (inside `products.size_stock`
//   JSONB and/or `product_reviews`) as well as the local catalog fallback, and
//   the product's `average_rating` and `review_count` are automatically updated.
// ============================================================================

import crypto from 'crypto';
import { getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog, writeLocalCatalog } from '@/database/local-store';
import type { Product, ProductReview } from '@/types/domain';

export interface CreateProductReviewInput {
  sku: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  selectedSize?: string;
}

export function computeReviewStats(reviews: ProductReview[] | undefined): {
  reviews: ProductReview[];
  review_count: number;
  average_rating: number | null;
} {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return {
      reviews: [],
      review_count: 0,
      average_rating: null,
    };
  }

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const sum = sorted.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avg = Math.round((sum / sorted.length) * 10) / 10;

  return {
    reviews: sorted,
    review_count: sorted.length,
    average_rating: avg,
  };
}

/**
 * Extracts reviews embedded in `size_stock.__reviews` (Supabase JSONB column on `products`)
 * or `product.reviews` so reviews work out-of-the-box on the existing `products` table.
 */
export function extractReviewsFromProductRecord(
  rawSizeStock: unknown,
  explicitReviews?: ProductReview[]
): {
  reviews: ProductReview[];
  review_count: number;
  average_rating: number | null;
} {
  if (explicitReviews && Array.isArray(explicitReviews) && explicitReviews.length > 0) {
    return computeReviewStats(explicitReviews);
  }

  if (rawSizeStock && typeof rawSizeStock === 'object') {
    const record = rawSizeStock as Record<string, unknown>;
    if (Array.isArray(record.__reviews)) {
      return computeReviewStats(record.__reviews as ProductReview[]);
    }
  }

  return {
    reviews: [],
    review_count: 0,
    average_rating: null,
  };
}

export async function addProductReviewBySku(
  input: CreateProductReviewInput
): Promise<{
  review: ProductReview;
  reviews: ProductReview[];
  review_count: number;
  average_rating: number | null;
}> {
  const cleanSku = input.sku.trim().toUpperCase();
  const cleanName = input.customerName.trim();
  const cleanComment = input.comment.trim();
  const numericRating = Math.min(5, Math.max(1, Math.round(Number(input.rating))));

  if (!cleanSku) {
    throw new Error('Product SKU is required');
  }
  if (!cleanName || cleanName.length < 2) {
    throw new Error('Please enter your name');
  }
  if (!cleanComment || cleanComment.length < 3) {
    throw new Error('Please write a short review comment');
  }

  const now = new Date().toISOString();
  const newReview: ProductReview = {
    id: crypto.randomUUID(),
    product_id: cleanSku,
    sku: cleanSku,
    customer_name: cleanName,
    customer_email: input.customerEmail?.trim() || undefined,
    rating: numericRating,
    title: input.title?.trim() || undefined,
    comment: cleanComment,
    selected_size: input.selectedSize?.trim() || undefined,
    created_at: now,
  };

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    try {
      const { data: prodRow, error: lookupErr } = await supabase
        .from('products')
        .select('id, sku, size_stock')
        .eq('sku', cleanSku)
        .maybeSingle();

      if (!lookupErr && prodRow) {
        newReview.product_id = String(prodRow.id);
        const existingSizeStock =
          prodRow.size_stock && typeof prodRow.size_stock === 'object'
            ? (prodRow.size_stock as Record<string, unknown>)
            : {};

        const existingReviews = Array.isArray(existingSizeStock.__reviews)
          ? (existingSizeStock.__reviews as ProductReview[])
          : [];

        const updatedReviews = [newReview, ...existingReviews];
        const nextSizeStock = {
          ...existingSizeStock,
          __reviews: updatedReviews,
        };

        const { error: updateErr } = await supabase
          .from('products')
          .update({ size_stock: nextSizeStock })
          .eq('id', prodRow.id);

        if (!updateErr) {
          const stats = computeReviewStats(updatedReviews);
          return {
            review: newReview,
            ...stats,
          };
        }
      }
    } catch (err) {
      console.warn(
        '[review.service] Supabase review save fell back to local store:',
        err instanceof Error ? err.message : err
      );
    }
  }

  // Fallback: Local Server Store
  const snapshot = await readLocalCatalog();
  const targetProduct: Product | undefined = snapshot.products.find(
    (p) => p.sku.toUpperCase() === cleanSku
  );

  if (!targetProduct) {
    throw new Error(`Product ${cleanSku} not found`);
  }

  newReview.product_id = targetProduct.id;
  const currentStats = extractReviewsFromProductRecord(
    targetProduct.size_stock,
    targetProduct.reviews
  );
  const updatedReviews = [newReview, ...currentStats.reviews];
  const nextStats = computeReviewStats(updatedReviews);

  targetProduct.reviews = nextStats.reviews;
  targetProduct.review_count = nextStats.review_count;
  targetProduct.average_rating = nextStats.average_rating;
  targetProduct.size_stock = {
    ...(targetProduct.size_stock || {}),
    __reviews: nextStats.reviews as unknown as number,
  };
  targetProduct.updated_at = now;

  await writeLocalCatalog(snapshot);

  return {
    review: newReview,
    ...nextStats,
  };
}
