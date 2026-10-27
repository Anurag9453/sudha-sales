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
  Star,
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
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

            <div className="pt-1 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
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

              {/* Only show average rating badge when at least 1 customer review exists */}
              {product.review_count &&
              product.review_count > 0 &&
              product.average_rating ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-stone-900 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{product.average_rating.toFixed(1)}</span>
                  <span className="text-stone-400 font-normal">
                    ({product.review_count})
                  </span>
                </span>
              ) : null}
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

      {/* Top-of-Page Frosted Glass LANDSCAPE Photo Modal (Background non-clickable) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} photo viewer`}
          className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-md flex items-start justify-center px-3 sm:px-4 pt-12 sm:pt-16"
        >
          {/* Outer Frosted Glass Frame (True Glassmorphism) */}
          <div className="relative w-full max-w-2xl rounded-[28px] bg-white/35 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-white/70 ring-1 ring-white/40 p-2 sm:p-3 overflow-hidden">
            {/* Subtle top glass reflection highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/50 to-transparent"
            />

            {/* Inner Glassy Landscape Stage */}
            <div
              onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                if (touchStartX === null || product.images.length <= 1) return;
                const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX;
                const deltaX = touchStartX - touchEndX;
                if (Math.abs(deltaX) > 40) {
                  if (deltaX > 0) {
                    setActiveSlideIndex((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    );
                  } else {
                    setActiveSlideIndex((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    );
                  }
                }
                setTouchStartX(null);
              }}
              className="relative aspect-[16/10] max-h-[52vh] w-full rounded-2xl bg-white/30 backdrop-blur-xl border border-white/60 flex items-center justify-center overflow-hidden touch-pan-y shadow-inner"
            >
              {/* Glassy Top Bar Overlay */}
              <div className="absolute top-2.5 inset-x-2.5 z-20 px-3.5 py-2 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-sm flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-900 font-semibold block">
                    {product.sku} • {product.color}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-950 truncate">
                    {product.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close photo viewer"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-white backdrop-blur-md border border-white/80 text-stone-900 flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeModalImage && (
                <>
                  {/* Soft translucent ambient color glow behind the garment */}
                  <Image
                    src={activeModalImage.image_url}
                    alt=""
                    fill
                    sizes="672px"
                    aria-hidden="true"
                    className="object-cover scale-125 blur-2xl opacity-30"
                  />

                  {/* Crisp main product image floating inside the frosted glass frame */}
                  <Image
                    src={activeModalImage.image_url}
                    alt={activeModalImage.alt_text || product.name}
                    fill
                    sizes="(max-width: 640px) 92vw, 672px"
                    className="object-contain z-10 pt-12 pb-11 px-2 sm:px-4 drop-shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
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
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-stone-900 shadow-lg flex items-center justify-center transition-all cursor-pointer"
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
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-stone-900 shadow-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Bottom Glassmorphism Pill with Glassy Dot Indicators (0 0 0 0) */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20">
                <div
                  role="tablist"
                  aria-label="Photo navigation indicators"
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/55 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
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
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                          isCurrent
                            ? 'w-3.5 h-3.5 bg-stone-900 border-2 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)] scale-110'
                            : 'w-2.5 h-2.5 bg-stone-900/25 hover:bg-stone-900/50 border border-white/80 backdrop-blur-md'
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
