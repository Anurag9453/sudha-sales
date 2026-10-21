// ============================================================================
// Product Card Component: src/components/product/ProductCard.tsx
// - Clicking the product image opens a compact LANDSCAPE modal anchored near
//   the top of the screen (without covering the entire page) while keeping the
//   background non-clickable.
// - At the bottom of the landscape modal is a stylish frosted-glass pill bar
//   containing glassy dot indicators (0 0 0 0) showing the active photo.
// - Below the product card is the "Add to Cart" button that navigates to
//   `/product/[sku]` (e.g. `/product/SKU005`) for size & quantity selection.
// ============================================================================

'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Images,
  Loader2,
} from 'lucide-react';
import { formatPrice, getDiscountPercentage } from '@/lib/format';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';
import type { Product } from '@/types/domain';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isNavigating, startTransition] = useTransition();

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const discountPct = getDiscountPercentage(product.price, product.sale_price);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Lock page background scrolling and interaction when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) =>
          prev === 0 ? product.images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) =>
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, product.images.length]);

  const openGalleryModal = () => {
    setActiveSlideIndex(0);
    setIsModalOpen(true);
  };

  const activeModalImage =
    product.images[activeSlideIndex] ?? product.images[0];

  return (
    <>
      <article className="group flex flex-col">
        {/* Clickable Product Image -> Opens Landscape Multi-Image Photo Modal */}
        <button
          type="button"
          onClick={openGalleryModal}
          aria-label={`View all photos of ${product.name}`}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 block text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className={`object-cover object-top transition-all duration-500 group-hover:scale-105 ${
                  secondaryImage ? 'group-hover:opacity-0' : ''
                }`}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.image_url}
                  alt={
                    secondaryImage.alt_text || `${product.name} alternate view`
                  }
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-top opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
              No image
            </div>
          )}

          {/* Top-left Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 rounded-full bg-stone-900/90 text-white text-[10px] font-semibold uppercase tracking-wider">
                Sold Out
              </span>
            ) : discountPct ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-700 text-white text-[10px] font-semibold uppercase tracking-wider shadow-xs">
                -{discountPct}% Off
              </span>
            ) : null}

            {!isOutOfStock && product.collection?.slug === 'new-collection' && (
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-semibold uppercase tracking-wider">
                New Drop
              </span>
            )}
          </div>

          {/* Top-right Photo Count Indicator */}
          {product.images.length > 1 && (
            <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-stone-950/75 text-white text-[10px] font-medium backdrop-blur-xs">
              <Images className="w-3 h-3" />
              <span>{product.images.length}</span>
            </div>
          )}

          {/* Bottom Size Strip Overlay */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none">
            <div className="flex flex-wrap gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-stone-200/70">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="text-[10px] font-semibold text-stone-800 px-1"
                >
                  {size}
                </span>
              ))}
            </div>

            {isLowStock && (
              <span className="hidden sm:inline-block bg-amber-950/85 text-amber-100 text-[10px] font-medium px-2 py-1 rounded-lg">
                Only {product.stock} left
              </span>
            )}
          </div>
        </button>

        {/* Product Metadata & Add to Cart Button below card (navigates to /product/[sku]) */}
        <div className="pt-3 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
              <span className="truncate">
                {product.category?.name ?? 'Apparel'}
              </span>
              <span className="font-mono text-[10px] text-stone-400">
                {product.sku}
              </span>
            </div>

            <Link
              href={`/product/${product.sku}`}
              className="mt-0.5 text-sm sm:text-[15px] font-medium text-stone-900 group-hover:text-stone-700 line-clamp-2 leading-snug block"
            >
              {product.name}
            </Link>

            <div className="pt-1 flex items-baseline gap-2">
              {product.sale_price !== null &&
              product.sale_price < product.price ? (
                <>
                  <span className="text-sm sm:text-base font-semibold text-stone-950">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-xs text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-semibold text-stone-950">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button -> Opens /product/[sku] with instant loading spinner */}
          <button
            type="button"
            disabled={isNavigating}
            onClick={() => {
              startTransition(() => {
                router.push(`/product/${product.sku}`);
              });
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.99] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-75 cursor-pointer"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>Opening {product.sku}...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </article>

      {isNavigating && (
        <LuxurySpinner
          fullScreenOverlay
          title={`Opening ${product.name}...`}
          subtitle={`Loading sizes, stock & photos for ${product.sku}`}
        />
      )}

      {/* Top-of-Page LANDSCAPE Photo Modal (Does NOT cover entire page; background non-clickable) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} photo viewer`}
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-[3px] flex items-start justify-center px-4 pt-12 sm:pt-16"
        >
          {/* Landscape Card Container (16:10 / 16:9 ratio, max height ~52vh so page remains visible below) */}
          <div className="relative w-full max-w-2xl rounded-3xl bg-stone-900/95 shadow-2xl border border-white/20 overflow-hidden ring-1 ring-black/40">
            {/* Glassy Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 z-20 px-4 py-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent flex items-center justify-between gap-3">
              <div className="min-w-0 text-white">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300/95 block">
                  {product.sku} • {product.color}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-xs">
                  {product.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close photo viewer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Landscape Photo Stage (16:10 aspect ratio, capped height so it never fills the screen) */}
            <div className="relative aspect-[16/10] max-h-[52vh] w-full bg-stone-950 flex items-center justify-center overflow-hidden">
              {activeModalImage && (
                <>
                  {/* Soft blurred ambient background fill for landscape framing */}
                  <Image
                    src={activeModalImage.image_url}
                    alt=""
                    fill
                    sizes="672px"
                    aria-hidden="true"
                    className="object-cover scale-110 blur-xl opacity-45"
                  />

                  {/* Crisp main product image centered in the landscape frame */}
                  <Image
                    src={activeModalImage.image_url}
                    alt={activeModalImage.alt_text || product.name}
                    fill
                    sizes="(max-width: 640px) 92vw, 672px"
                    className="object-contain z-10 p-2 sm:p-3 drop-shadow-xl"
                  />
                </>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-lg flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-lg flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Bottom Glassmorphism Pill with Glassy Dot Indicators (0 0 0 0) */}
              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20">
                <div
                  role="tablist"
                  aria-label="Photo navigation indicators"
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                >
                  {product.images.map((img, idx) => {
                    const isCurrent = idx === activeSlideIndex;
                    return (
                      <button
                        key={img.id || idx}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`Photo ${idx + 1} of ${product.images.length}`}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'w-3.5 h-3.5 bg-white/95 border-2 border-amber-300 shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-110'
                            : 'w-2.5 h-2.5 bg-white/25 hover:bg-white/50 border border-white/40 backdrop-blur-md'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
