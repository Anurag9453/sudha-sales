// ============================================================================
// Shop / Product Listing Page: src/app/(storefront)/shop/page.tsx
// Supports category filtering, collection filtering, size filtering, search,
// and price sorting with mobile-friendly pill filters.
// Bound to AppConstants.Storefront.SHOP, AppConstants.Inventory, and AppConstants.Sizes.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import {
  getCategories,
  getCollections,
  getProducts,
} from '@/services/catalog.service';
import { InfiniteProductGrid } from '@/components/product/InfiniteProductGrid';
import { AppConstants } from '@/constants/app.constants';
import { STANDARD_SIZES } from '@/types/domain';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    size?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc';
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategorySlug =
    params.category || AppConstants.Storefront.SHOP.FILTER_ALL;
  const activeCollectionSlug =
    params.collection || AppConstants.Storefront.SHOP.FILTER_ALL;
  const activeSize = params.size || AppConstants.Storefront.SHOP.FILTER_ALL;
  const activeSort =
    params.sort || AppConstants.Storefront.SHOP.SORT_NEWEST;
  const searchQuery = params.q || '';

  const [categories, collections, allProducts] = await Promise.all([
    getCategories(),
    getCollections(),
    getProducts({
      categorySlug: activeCategorySlug,
      collectionSlug: activeCollectionSlug,
      size: activeSize,
      sort: activeSort,
      search: searchQuery,
    }),
  ]);

  const BATCH_SIZE = AppConstants.Inventory.DEFAULT_PAGE_SIZE;
  const initialBatch = allProducts.slice(0, BATCH_SIZE);
  const totalCount = allProducts.length;

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const activeCollection = collections.find((c) => c.slug === activeCollectionSlug);

  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string> = {};
    if (activeCategorySlug !== AppConstants.Storefront.SHOP.FILTER_ALL)
      merged.category = activeCategorySlug;
    if (activeCollectionSlug !== AppConstants.Storefront.SHOP.FILTER_ALL)
      merged.collection = activeCollectionSlug;
    if (activeSize !== AppConstants.Storefront.SHOP.FILTER_ALL)
      merged.size = activeSize;
    if (activeSort !== AppConstants.Storefront.SHOP.SORT_NEWEST)
      merged.sort = activeSort;
    if (searchQuery) merged.q = searchQuery;

    for (const [k, v] of Object.entries(overrides)) {
      if (
        !v ||
        v === AppConstants.Storefront.SHOP.FILTER_ALL ||
        (k === 'sort' && v === AppConstants.Storefront.SHOP.SORT_NEWEST)
      ) {
        delete merged[k];
      } else {
        merged[k] = v;
      }
    }

    const qs = new URLSearchParams(merged).toString();
    return qs ? `/shop?${qs}` : '/shop';
  }

  const hasActiveFilters =
    activeCategorySlug !== AppConstants.Storefront.SHOP.FILTER_ALL ||
    activeCollectionSlug !== AppConstants.Storefront.SHOP.FILTER_ALL ||
    activeSize !== AppConstants.Storefront.SHOP.FILTER_ALL ||
    Boolean(searchQuery);

  return (
    <div className={AppConstants.Storefront.SHOP.CLASSES.PAGE}>
      {/* Page Header */}
      <div className={AppConstants.Storefront.SHOP.CLASSES.HEADER}>
        <div className={AppConstants.Storefront.SHOP.CLASSES.HEADER_TOP}>
          <div>
            <p className={AppConstants.Storefront.SHOP.CLASSES.COLLECTION_TAG}>
              {activeCollection
                ? activeCollection.name
                : AppConstants.Storefront.SHOP.COPY.COMPLETE_CATALOG}
            </p>
            <h1 className={AppConstants.Storefront.SHOP.CLASSES.TITLE}>
              {activeCategory
                ? activeCategory.name
                : activeCollection
                ? activeCollection.name
                : AppConstants.Storefront.SHOP.COPY.ALL_CLOTHING}
            </h1>
            {(activeCategory?.description || activeCollection?.description) && (
              <p className={AppConstants.Storefront.SHOP.CLASSES.DESCRIPTION}>
                {activeCategory?.description ?? activeCollection?.description}
              </p>
            )}
          </div>

          {/* Search Input Form */}
          <form
            action="/shop"
            method="GET"
            className={AppConstants.Storefront.SHOP.CLASSES.SEARCH_FORM}
          >
            {activeCategorySlug !== AppConstants.Storefront.SHOP.FILTER_ALL && (
              <input type="hidden" name="category" value={activeCategorySlug} />
            )}
            {activeCollectionSlug !==
              AppConstants.Storefront.SHOP.FILTER_ALL && (
              <input
                type="hidden"
                name="collection"
                value={activeCollectionSlug}
              />
            )}
            {activeSize !== AppConstants.Storefront.SHOP.FILTER_ALL && (
              <input type="hidden" name="size" value={activeSize} />
            )}
            {activeSort !== AppConstants.Storefront.SHOP.SORT_NEWEST && (
              <input type="hidden" name="sort" value={activeSort} />
            )}
            <div className="relative">
              <Search
                className={AppConstants.Storefront.SHOP.CLASSES.SEARCH_ICON}
              />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder={
                  AppConstants.Storefront.SHOP.COPY.SEARCH_PLACEHOLDER
                }
                className={AppConstants.Storefront.SHOP.CLASSES.SEARCH_INPUT}
              />
            </div>
          </form>
        </div>

        {/* Mobile-first Horizontal Category Filter Pills */}
        <div className={AppConstants.Storefront.SHOP.CLASSES.CAT_BAR}>
          <Link
            href={buildFilterUrl({
              category: AppConstants.Storefront.SHOP.FILTER_ALL,
            })}
            className={AppConstants.Storefront.SHOP.CLASSES.CAT_PILL(
              activeCategorySlug === AppConstants.Storefront.SHOP.FILTER_ALL
            )}
          >
            {AppConstants.Storefront.SHOP.COPY.ALL_CATEGORIES}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildFilterUrl({ category: cat.slug })}
              className={AppConstants.Storefront.SHOP.CLASSES.CAT_PILL(
                activeCategorySlug === cat.slug
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Secondary Filter Bar: Collections, Sizes & Sort */}
        <div className={AppConstants.Storefront.SHOP.CLASSES.SUB_BAR}>
          <div className={AppConstants.Storefront.SHOP.CLASSES.SUB_LEFT}>
            <span
              className={AppConstants.Storefront.SHOP.CLASSES.FILTER_LABEL}
            >
              <SlidersHorizontal
                className={AppConstants.Storefront.SHOP.CLASSES.SLIDERS_ICON}
              />
              {AppConstants.Storefront.SHOP.COPY.COLLECTION_LABEL}
            </span>
            <Link
              href={buildFilterUrl({
                collection: AppConstants.Storefront.SHOP.FILTER_ALL,
              })}
              className={AppConstants.Storefront.SHOP.CLASSES.COL_PILL(
                activeCollectionSlug === AppConstants.Storefront.SHOP.FILTER_ALL
              )}
            >
              {AppConstants.Storefront.SHOP.COPY.ALL}
            </Link>
            {collections.map((col) => (
              <Link
                key={col.id}
                href={buildFilterUrl({ collection: col.slug })}
                className={AppConstants.Storefront.SHOP.CLASSES.COL_PILL_AMBER(
                  activeCollectionSlug === col.slug
                )}
              >
                {col.name}
              </Link>
            ))}

            <span className={AppConstants.Storefront.SHOP.CLASSES.DIVIDER}>
              |
            </span>

            <span className="text-xs font-medium text-stone-500 ml-1">
              {AppConstants.Storefront.SHOP.COPY.SIZE_LABEL}
            </span>
            <Link
              href={buildFilterUrl({
                size: AppConstants.Storefront.SHOP.FILTER_ALL,
              })}
              className={AppConstants.Storefront.SHOP.CLASSES.SIZE_PILL_ANY(
                activeSize === AppConstants.Storefront.SHOP.FILTER_ALL
              )}
            >
              {AppConstants.Storefront.SHOP.COPY.ANY_SIZE}
            </Link>
            {STANDARD_SIZES.map((sz) => (
              <Link
                key={sz}
                href={buildFilterUrl({ size: sz })}
                className={AppConstants.Storefront.SHOP.CLASSES.SIZE_PILL(
                  activeSize === sz
                )}
              >
                {sz}
              </Link>
            ))}
          </div>

          {/* Sort Switcher */}
          <div className={AppConstants.Storefront.SHOP.CLASSES.SORT_BAR}>
            <span className="text-stone-500">
              {AppConstants.Storefront.SHOP.COPY.SORT_LABEL}
            </span>
            <div className={AppConstants.Storefront.SHOP.CLASSES.SORT_BOX}>
              <Link
                href={buildFilterUrl({
                  sort: AppConstants.Storefront.SHOP.SORT_NEWEST,
                })}
                className={AppConstants.Storefront.SHOP.CLASSES.SORT_LINK(
                  activeSort === AppConstants.Storefront.SHOP.SORT_NEWEST
                )}
              >
                {AppConstants.Storefront.SHOP.COPY.SORT_NEWEST}
              </Link>
              <Link
                href={buildFilterUrl({
                  sort: AppConstants.Storefront.SHOP.SORT_PRICE_ASC,
                })}
                className={AppConstants.Storefront.SHOP.CLASSES.SORT_LINK(
                  activeSort === AppConstants.Storefront.SHOP.SORT_PRICE_ASC
                )}
              >
                {AppConstants.Storefront.SHOP.COPY.SORT_PRICE_LOW}
              </Link>
              <Link
                href={buildFilterUrl({
                  sort: AppConstants.Storefront.SHOP.SORT_PRICE_DESC,
                })}
                className={AppConstants.Storefront.SHOP.CLASSES.SORT_LINK(
                  activeSort === AppConstants.Storefront.SHOP.SORT_PRICE_DESC
                )}
              >
                {AppConstants.Storefront.SHOP.COPY.SORT_PRICE_HIGH}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Clear Filters */}
      <div className={AppConstants.Storefront.SHOP.CLASSES.RESULTS_ROW}>
        <p>
          {AppConstants.Storefront.SHOP.COPY.SHOWING}
          <strong className="text-stone-900">{totalCount}</strong>{' '}
          {totalCount === 1
            ? AppConstants.Storefront.SHOP.COPY.STYLE_SINGULAR
            : AppConstants.Storefront.SHOP.COPY.STYLE_PLURAL}
        </p>

        {hasActiveFilters && (
          <Link
            href="/shop"
            className={AppConstants.Storefront.SHOP.CLASSES.RESET_LINK}
          >
            <X className={AppConstants.Storefront.SHOP.CLASSES.RESET_ICON} />
            {AppConstants.Storefront.SHOP.COPY.RESET_FILTERS}
          </Link>
        )}
      </div>

      {/* Product Grid */}
      {totalCount === 0 ? (
        <div className={AppConstants.Storefront.SHOP.CLASSES.EMPTY_BOX}>
          <p className={AppConstants.Storefront.SHOP.CLASSES.EMPTY_TITLE}>
            {AppConstants.Storefront.SHOP.COPY.EMPTY_TITLE}
          </p>
          <p className={AppConstants.Storefront.SHOP.CLASSES.EMPTY_DESC}>
            {AppConstants.Storefront.SHOP.COPY.EMPTY_DESC}
          </p>
          <Link
            href="/shop"
            className={AppConstants.Storefront.SHOP.CLASSES.VIEW_ALL_BTN}
          >
            {AppConstants.Storefront.SHOP.COPY.VIEW_ALL_PRODUCTS}
          </Link>
        </div>
      ) : (
        <InfiniteProductGrid
          initialProducts={initialBatch}
          totalCount={totalCount}
          filterParams={{
            category: activeCategorySlug,
            collection: activeCollectionSlug,
            size: activeSize,
            sort: activeSort,
            q: searchQuery,
          }}
          batchSize={BATCH_SIZE}
        />
      )}
    </div>
  );
}
