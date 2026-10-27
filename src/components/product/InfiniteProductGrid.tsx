// ============================================================================
// Infinite Product Grid with In-Memory Caching & Lazy Loading
// File: src/components/product/InfiniteProductGrid.tsx
//
// Key Capabilities:
// 1. Initial Batch (e.g. 8 styles) rendered on server for instant first-paint & SEO.
// 2. Automatically triggers next batch as user scrolls down via IntersectionObserver.
// 3. In-Memory Client Cache: Keeps all loaded products preserved in memory so when
//    the user scrolls back UP, zero data is reloaded, with 0 layout shifts or jumps.
// 4. Smooth "Back to Top" navigation and completion indicator when all styles loaded.
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ArrowUp, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { AppConstants } from '@/constants/app.constants';
import type { Product } from '@/types/domain';

interface FilterParams {
  category?: string;
  collection?: string;
  size?: string;
  sort?: string;
  q?: string;
}

interface InfiniteProductGridProps {
  initialProducts: Product[];
  totalCount: number;
  filterParams: FilterParams;
  batchSize?: number;
}

interface CachedGridState {
  products: Product[];
  page: number;
  hasMore: boolean;
}

// Module-level in-memory cache preserved across component re-renders and back-navigation
const gridMemoryCache = new Map<string, CachedGridState>();

function buildCacheKey(filters: FilterParams): string {
  return [
    filters.category || 'all',
    filters.collection || 'all',
    filters.size || 'all',
    filters.sort || 'newest',
    (filters.q || '').trim().toLowerCase(),
  ].join('::');
}

export function InfiniteProductGrid({
  initialProducts,
  totalCount,
  filterParams,
  batchSize = AppConstants.Inventory.DEFAULT_PAGE_SIZE,
}: InfiniteProductGridProps) {
  const cacheKey = buildCacheKey(filterParams);

  // Initialize from client cache if user previously scrolled this category/filter
  const cached = gridMemoryCache.get(cacheKey);

  const [products, setProducts] = useState<Product[]>(() => {
    if (cached && cached.products.length >= initialProducts.length) {
      return cached.products;
    }
    return initialProducts;
  });

  const [page, setPage] = useState<number>(() => {
    return cached ? cached.page : 1;
  });

  const [hasMore, setHasMore] = useState<boolean>(() => {
    if (cached) return cached.hasMore;
    return initialProducts.length < totalCount;
  });

  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync state if initial server products or filters changed
  useEffect(() => {
    const freshKey = buildCacheKey(filterParams);
    const existing = gridMemoryCache.get(freshKey);

    if (existing && existing.products.length >= initialProducts.length) {
      setProducts(existing.products);
      setPage(existing.page);
      setHasMore(existing.hasMore);
    } else {
      setProducts(initialProducts);
      setPage(1);
      const more = initialProducts.length < totalCount;
      setHasMore(more);
      gridMemoryCache.set(freshKey, {
        products: initialProducts,
        page: 1,
        hasMore: more,
      });
    }
  }, [cacheKey, initialProducts, totalCount, filterParams]);

  // Fetches next paginated batch
  const loadNextBatch = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setLoadError(null);

    const nextPage = page + 1;
    const query = new URLSearchParams();
    query.set('page', String(nextPage));
    query.set('limit', String(batchSize));
    if (filterParams.category && filterParams.category !== 'all') {
      query.set('category', filterParams.category);
    }
    if (filterParams.collection && filterParams.collection !== 'all') {
      query.set('collection', filterParams.collection);
    }
    if (filterParams.size && filterParams.size !== 'all') {
      query.set('size', filterParams.size);
    }
    if (filterParams.sort && filterParams.sort !== 'newest') {
      query.set('sort', filterParams.sort);
    }
    if (filterParams.q) {
      query.set('q', filterParams.q);
    }

    try {
      const res = await fetch(`/api/products?${query.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load more products (status: ${res.status})`);
      }

      const data = (await res.json()) as {
        ok: boolean;
        products: Product[];
        hasMore: boolean;
        total: number;
      };

      if (data.ok && Array.isArray(data.products)) {
        setProducts((prev) => {
          // De-duplicate by SKU
          const seen = new Set(prev.map((p) => p.sku));
          const uniqueNew = data.products.filter((p) => !seen.has(p.sku));
          const merged = [...prev, ...uniqueNew];

          // Save in client memory cache
          gridMemoryCache.set(cacheKey, {
            products: merged,
            page: nextPage,
            hasMore: data.hasMore,
          });

          return merged;
        });

        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Unable to load more styles'
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, batchSize, filterParams, cacheKey]);

  // IntersectionObserver to auto-load when sentinel enters viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          loadNextBatch();
        }
      },
      {
        root: null,
        // Trigger before reaching the exact bottom for seamless feel
        rootMargin: AppConstants.Inventory.SCROLL_TRIGGER_MARGIN,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextBatch]);

  const handleScrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id || `${product.sku}-${index}`}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Lazy Loading Sentinel */}
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

      {/* Loading Skeleton & Spinner */}
      {isLoadingMore && (
        <div className="py-6 flex flex-col items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-medium shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Discovering more handcrafted styles...</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="rounded-2xl bg-stone-100 aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Retry CTA */}
      {loadError && (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-rose-700 font-medium">{loadError}</p>
          <button
            type="button"
            onClick={() => loadNextBatch()}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Retry Loading More
          </button>
        </div>
      )}

      {/* Manual Fallback Button (if user has high-speed scroll) */}
      {!isLoadingMore && hasMore && (
        <div className="py-4 text-center">
          <button
            type="button"
            onClick={() => loadNextBatch()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:border-stone-900 hover:bg-stone-50 transition-all shadow-2xs"
          >
            <span>Load More Styles</span>
            <span className="text-stone-400">
              ({products.length} of {totalCount} shown)
            </span>
          </button>
        </div>
      )}

      {/* End of Catalog Indicator & Back to Top */}
      {!hasMore && products.length > 0 && (
        <div className="pt-8 pb-4 border-t border-stone-200 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>
              You&apos;ve viewed all {products.length} styles in this collection
            </span>
          </div>
          <div>
            <button
              type="button"
              onClick={handleScrollToTop}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer group"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
