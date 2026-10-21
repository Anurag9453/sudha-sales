// ============================================================================
// Home Page: src/app/(storefront)/page.tsx
// Mobile-first fashion storefront highlighting the New Collection daily drops,
// visual category navigation, and full featured collection.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  getCategories,
  getNewCollectionProducts,
  getProducts,
} from '@/services/catalog.service';
import { ProductCard } from '@/components/product/ProductCard';
import { SudhaSpinnerBadge } from '@/components/ui/LuxurySpinner';
import { publicEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, newCollectionProducts, allProducts] = await Promise.all([
    getCategories(),
    getNewCollectionProducts(4),
    getProducts(),
  ]);

  const curatedProducts = allProducts.slice(0, 8);

  return (
    <div className="space-y-14 sm:space-y-20">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 z-10">
            {/* Signature SUDHA SALES Spinning Emblem Badge on Home Page */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-lg">
              <SudhaSpinnerBadge size="sm" theme="dark" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-serif text-xs sm:text-sm font-bold tracking-[0.18em] text-amber-300 whitespace-nowrap">
                  {publicEnv.storeName}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-amber-100 text-xs font-medium tracking-wide">
                  Ready to Ship Today
                </span>
              </div>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]">
              Effortless Silhouettes for Every Occasion.
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Explore our newest handpicked Kurtis, tailored Co-ord Sets, and festive
              Chanderi ensembles. New collections arrive daily straight from our partner
              looms.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop?collection=new-collection"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-950 font-semibold text-sm hover:bg-stone-100 transition-colors"
              >
                <span>Shop New Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/15 transition-colors"
              >
                <span>View All Styles</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85"
                alt="Handblock Mulmul Cotton Collection"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 mt-6 sm:mt-10">
              <Image
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=85"
                alt="Festive Chanderi Suit Collection"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Collection Section (Daily Arrivals) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <SudhaSpinnerBadge size="md" theme="light" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Just Arrived at {publicEnv.storeName}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-0.5">
                New Collection — Daily Drop
              </h2>
            </div>
          </div>
          <Link
            href="/shop?collection=new-collection"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors"
          >
            <span>Explore all new arrivals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newCollectionProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      {/* Shop by Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Curated Wardrobes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1">
              Shop by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200 block"
            >
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-4 inset-x-4 text-white">
                <h3 className="font-serif text-lg sm:text-xl font-semibold">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-200 mt-0.5 inline-flex items-center gap-1">
                  <span>Explore styles</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Complete Edit
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1">
              Trending Styles This Week
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors"
          >
            <span>View all {allProducts.length} products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {curatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Value Proposition Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-100 border border-stone-200/80 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Direct Warehouse Dispatch
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Every SKU is stocked in our partner warehouses and dispatched within
                24–48 hours with live tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Authentic Fabrics &amp; True Sizing
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                100% pure mulmul cotton, breathable linen, and handloom Chanderi weaves
                inspected before shipping.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Hassle-Free Size Exchanges
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Need a different size? Request a quick 7-day size exchange with doorstep
                pickup support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
