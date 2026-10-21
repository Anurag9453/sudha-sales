// ============================================================================
// Shop / Product Listing Page: src/app/(storefront)/shop/page.tsx
// Supports category filtering, collection filtering, size filtering, search,
// and price sorting with mobile-friendly pill filters.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import {
  getCategories,
  getCollections,
  getProducts,
} from '@/services/catalog.service';
import { ProductCard } from '@/components/product/ProductCard';
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
  const activeCategorySlug = params.category || 'all';
  const activeCollectionSlug = params.collection || 'all';
  const activeSize = params.size || 'all';
  const activeSort = params.sort || 'newest';
  const searchQuery = params.q || '';

  const [categories, collections, products] = await Promise.all([
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

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const activeCollection = collections.find((c) => c.slug === activeCollectionSlug);

  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string> = {};
    if (activeCategorySlug !== 'all') merged.category = activeCategorySlug;
    if (activeCollectionSlug !== 'all') merged.collection = activeCollectionSlug;
    if (activeSize !== 'all') merged.size = activeSize;
    if (activeSort !== 'newest') merged.sort = activeSort;
    if (searchQuery) merged.q = searchQuery;

    for (const [k, v] of Object.entries(overrides)) {
      if (!v || v === 'all' || (k === 'sort' && v === 'newest')) {
        delete merged[k];
      } else {
        merged[k] = v;
      }
    }

    const qs = new URLSearchParams(merged).toString();
    return qs ? `/shop?${qs}` : '/shop';
  }

  const hasActiveFilters =
    activeCategorySlug !== 'all' ||
    activeCollectionSlug !== 'all' ||
    activeSize !== 'all' ||
    Boolean(searchQuery);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              {activeCollection ? activeCollection.name : 'Complete Catalog'}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 mt-1">
              {activeCategory
                ? activeCategory.name
                : activeCollection
                  ? activeCollection.name
                  : 'All Clothing & Ensembles'}
            </h1>
            {(activeCategory?.description || activeCollection?.description) && (
              <p className="text-sm text-stone-600 mt-1.5 max-w-2xl">
                {activeCategory?.description ?? activeCollection?.description}
              </p>
            )}
          </div>

          {/* Search Input Form */}
          <form action="/shop" method="GET" className="w-full md:w-72">
            {activeCategorySlug !== 'all' && (
              <input type="hidden" name="category" value={activeCategorySlug} />
            )}
            {activeCollectionSlug !== 'all' && (
              <input type="hidden" name="collection" value={activeCollectionSlug} />
            )}
            {activeSize !== 'all' && (
              <input type="hidden" name="size" value={activeSize} />
            )}
            {activeSort !== 'newest' && (
              <input type="hidden" name="sort" value={activeSort} />
            )}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by name, color, or SKU..."
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>
          </form>
        </div>

        {/* Mobile-first Horizontal Category Filter Pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Link
            href={buildFilterUrl({ category: 'all' })}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategorySlug === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildFilterUrl({ category: cat.slug })}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategorySlug === cat.slug
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Secondary Filter Bar: Collections, Sizes & Sort */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Collection:
            </span>
            <Link
              href={buildFilterUrl({ collection: 'all' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCollectionSlug === 'all'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              All
            </Link>
            {collections.map((col) => (
              <Link
                key={col.id}
                href={buildFilterUrl({ collection: col.slug })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeCollectionSlug === col.slug
                    ? 'bg-amber-100 text-amber-950 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {col.name}
              </Link>
            ))}

            <span className="text-stone-300 mx-1 hidden sm:inline">|</span>

            <span className="text-xs font-medium text-stone-500 ml-1">Size:</span>
            <Link
              href={buildFilterUrl({ size: 'all' })}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                activeSize === 'all'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Any
            </Link>
            {STANDARD_SIZES.map((sz) => (
              <Link
                key={sz}
                href={buildFilterUrl({ size: sz })}
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  activeSize === sz
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {sz}
              </Link>
            ))}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Sort:</span>
            <div className="inline-flex rounded-xl border border-stone-300 bg-white p-0.5">
              <Link
                href={buildFilterUrl({ sort: 'newest' })}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  activeSort === 'newest'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Newest
              </Link>
              <Link
                href={buildFilterUrl({ sort: 'price-asc' })}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  activeSort === 'price-asc'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Price: Low
              </Link>
              <Link
                href={buildFilterUrl({ sort: 'price-desc' })}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  activeSort === 'price-desc'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Price: High
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Clear Filters */}
      <div className="flex items-center justify-between mb-6 text-xs text-stone-600">
        <p>
          Showing <strong className="text-stone-900">{products.length}</strong>{' '}
          {products.length === 1 ? 'style' : 'styles'}
        </p>

        {hasActiveFilters && (
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-stone-900 font-semibold hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </Link>
        )}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="rounded-3xl bg-white border border-stone-200 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <p className="font-serif text-2xl font-semibold text-stone-900">
            No matching styles found
          </p>
          <p className="text-xs text-stone-500 leading-relaxed">
            Try clearing your category or size filter to browse our latest daily
            arrivals.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold"
          >
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
