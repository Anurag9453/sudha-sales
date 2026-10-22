// ============================================================================
// Product Detail Page: src/app/(storefront)/product/[sku]/page.tsx
// Displays multi-image gallery, SKU badge, regular & sale price, size selector,
// stock availability, quantity selector, Add to Bag, and related products.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Sparkles, Layers, Star } from 'lucide-react';
import { getProductBySku, getRelatedProducts } from '@/services/catalog.service';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice, getDiscountPercentage } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ sku: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { sku } = await params;
  const product = await getProductBySku(sku);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4);
  const discountPct = getDiscountPercentage(product.price, product.sale_price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-stone-500 mb-6 overflow-x-auto whitespace-nowrap"
      >
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/shop" className="hover:text-stone-900">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-stone-900"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            productName={product.name}
            discountBadge={discountPct}
          />
        </div>

        {/* Right: Product Info & Purchase Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {product.collection && (
                <Link
                  href={`/shop?collection=${product.collection.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  {product.collection.name}
                </Link>
              )}
              {product.category && (
                <span className="text-xs font-medium text-stone-500">
                  {product.category.name}
                </span>
              )}
            </div>

            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
              SKU: {product.sku}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-950 leading-tight">
            {product.name}
          </h1>

          {/* Only render Average Rating summary if at least 1 real customer review exists */}
          {product.review_count &&
          product.review_count > 0 &&
          product.average_rating ? (
            <a
              href="#customer-reviews"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-xs font-semibold text-stone-900 transition-colors"
            >
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.average_rating!)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </span>
              <span className="font-bold">
                {product.average_rating.toFixed(1)} out of 5
              </span>
              <span className="text-stone-400">•</span>
              <span className="underline text-stone-700">
                {product.review_count}{' '}
                {product.review_count === 1 ? 'Customer Review' : 'Customer Reviews'}
              </span>
            </a>
          ) : null}

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3 pt-1">
            {product.sale_price !== null && product.sale_price < product.price ? (
              <>
                <span className="text-2xl sm:text-3xl font-bold text-stone-950">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-base text-stone-400 line-through">
                  {formatPrice(product.price)}
                </span>
                {discountPct && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                    Save {discountPct}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-stone-950">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 -mt-3">
            Inclusive of all taxes • Free shipping on orders over ₹1,499
          </p>

          {/* Color Pill */}
          {product.color && (
            <div className="pt-1 flex items-center gap-2 text-xs text-stone-700">
              <Layers className="w-4 h-4 text-stone-500" />
              <span>Color / Shade:</span>
              <strong className="text-stone-950">{product.color}</strong>
            </div>
          )}

          {/* Interactive Size, Quantity, Stock & Add to Cart */}
          <ProductPurchasePanel product={product} />

          {/* Product Story & Fabric Details */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2">
                Description &amp; Craftsmanship
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100/80 border border-stone-200/80 p-4 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-500">Product Code (SKU)</span>
                <span className="font-mono font-semibold text-stone-900">
                  {product.sku}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Available Sizes</span>
                <span className="font-semibold text-stone-900">
                  {product.sizes.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Wash Care</span>
                <span className="font-medium text-stone-900">
                  Gentle cold hand wash or dry clean
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ProductReviewsSection product={product} />

      {/* Related Styles Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-12 border-t border-stone-200">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
