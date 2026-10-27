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
// Bound to AppConstants.Product.GRID and AppConstants.Product.API.
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
    filters.category || AppConstants.Product.GRID.DEFAULT_CATEGORY,
    filters.collection || AppConstants.Product.GRID.DEFAULT_COLLECTION,
    filters.size || AppConstants.Product.GRID.DEFAULT_SIZE,
    filters.sort || AppConstants.Product.GRID.DEFAULT_SORT,
    (filters.q || '').trim().toLowerCase(),
  ].join(AppConstants.Product.GRID.KEY_SEPARATOR);
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
    query.set(AppConstants.Product.GRID.QUERY_PARAMS.PAGE, String(nextPage));
    query.set(AppConstants.Product.GRID.QUERY_PARAMS.LIMIT, String(batchSize));
    if (
      filterParams.category &&
      filterParams.category !== AppConstants.Product.GRID.DEFAULT_CATEGORY
    ) {
      query.set(
        AppConstants.Product.GRID.QUERY_PARAMS.CATEGORY,
        filterParams.category
      );
    }
    if (
      filterParams.collection &&
      filterParams.collection !== AppConstants.Product.GRID.DEFAULT_COLLECTION
    ) {
      query.set(
        AppConstants.Product.GRID.QUERY_PARAMS.COLLECTION,
        filterParams.collection
      );
    }
    if (
      filterParams.size &&
      filterParams.size !== AppConstants.Product.GRID.DEFAULT_SIZE
    ) {
      query.set(AppConstants.Product.GRID.QUERY_PARAMS.SIZE, filterParams.size);
    }
    if (
      filterParams.sort &&
      filterParams.sort !== AppConstants.Product.GRID.DEFAULT_SORT
    ) {
      query.set(AppConstants.Product.GRID.QUERY_PARAMS.SORT, filterParams.sort);
    }
    if (filterParams.q) {
      query.set(AppConstants.Product.GRID.QUERY_PARAMS.Q, filterParams.q);
    }

    try {
      const res = await fetch(
        `${AppConstants.Product.API.PRODUCTS}?${query.toString()}`
      );
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
        err instanceof Error
          ? err.message
          : AppConstants.Product.GRID.COPY.ERROR_DEFAULT
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
    <div className={AppConstants.Product.GRID.CLASSES.WRAPPER}>
      {/* Product Cards Grid */}
      <div className={AppConstants.Product.GRID.CLASSES.GRID}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id || `${product.sku}-${index}`}
            product={product}
            priority={index < AppConstants.Product.GRID.SKELETON_COUNT}
          />
        ))}
      </div>

      {/* Lazy Loading Sentinel */}
      <div
        ref={sentinelRef}
        className={AppConstants.Product.GRID.CLASSES.SENTINEL}
        aria-hidden="true"
      />

      {/* Loading Skeleton & Spinner */}
      {isLoadingMore && (
        <div className={AppConstants.Product.GRID.CLASSES.LOADING_BOX}>
          <div className={AppConstants.Product.GRID.CLASSES.LOADING_PILL}>
            <Loader2 className={AppConstants.Product.GRID.CLASSES.LOADER_ICON} />
            <span>{AppConstants.Product.GRID.COPY.LOADING_MORE}</span>
          </div>
          <div className={AppConstants.Product.GRID.CLASSES.SKELETON_GRID}>
            {Array.from({
              length: AppConstants.Product.GRID.SKELETON_COUNT,
            }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className={AppConstants.Product.GRID.CLASSES.SKELETON_CARD}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Retry CTA */}
      {loadError && (
        <div className={AppConstants.Product.GRID.CLASSES.ERROR_BOX}>
          <p className={AppConstants.Product.GRID.CLASSES.ERROR_TEXT}>
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => loadNextBatch()}
            className={AppConstants.Product.GRID.CLASSES.RETRY_BUTTON}
          >
            {AppConstants.Product.GRID.COPY.RETRY}
          </button>
        </div>
      )}

      {/* Manual Fallback Button (if user has high-speed scroll) */}
      {!isLoadingMore && hasMore && (
        <div className={AppConstants.Product.GRID.CLASSES.MANUAL_LOAD_BOX}>
          <button
            type="button"
            onClick={() => loadNextBatch()}
            className={AppConstants.Product.GRID.CLASSES.MANUAL_LOAD_BUTTON}
          >
            <span>{AppConstants.Product.GRID.COPY.MANUAL_LOAD_MORE}</span>
            <span className={AppConstants.Product.GRID.CLASSES.MANUAL_LOAD_MUTED}>
              {AppConstants.Product.GRID.COPY.SHOWN_COUNT(
                products.length,
                totalCount
              )}
            </span>
          </button>
        </div>
      )}

      {/* End of Catalog Indicator & Back to Top */}
      {!hasMore && products.length > 0 && (
        <div className={AppConstants.Product.GRID.CLASSES.END_BOX}>
          <div className={AppConstants.Product.GRID.CLASSES.END_PILL}>
            <Sparkles className={AppConstants.Product.GRID.CLASSES.SPARKLE_ICON} />
            <span>
              {AppConstants.Product.GRID.COPY.ALL_VIEWED(products.length)}
            </span>
          </div>
          <div>
            <button
              type="button"
              onClick={handleScrollToTop}
              className={AppConstants.Product.GRID.CLASSES.BACK_TO_TOP_BUTTON}
            >
              <span>{AppConstants.Product.GRID.COPY.BACK_TO_TOP}</span>
              <ArrowUp
                className={AppConstants.Product.GRID.CLASSES.ARROW_UP_ICON}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
