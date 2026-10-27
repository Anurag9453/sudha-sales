// ============================================================================
// Product Card Component: src/components/product/ProductCard.tsx
// - Clicking the product image opens a compact LANDSCAPE modal anchored near
//   the top of the screen (without covering the entire page) while keeping the
//   background non-clickable.
// - At the bottom of the landscape modal is a stylish frosted-glass pill bar
//   containing glassy dot indicators (0 0 0 0) showing the active photo.
// - Below the product card is the "Add to Cart" button that navigates to
//   `/product/[sku]` (e.g. `/product/SKU005`) for size & quantity selection.
// All visual copy, SVG attributes, CSS class names, and image dimensions
// are bound to AppConstants.Product.CARD and AppConstants.Product.ROUTES.
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
import { AppConstants } from '@/constants/app.constants';
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
  const isLowStock =
    product.stock > 0 &&
    product.stock <= AppConstants.Inventory.LOW_STOCK_THRESHOLD;

  // Lock page background scrolling and interaction when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = AppConstants.Product.CARD.OVERFLOW_HIDDEN;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === AppConstants.Product.CARD.KEY_ESCAPE) {
        setIsModalOpen(false);
      } else if (e.key === AppConstants.Product.CARD.KEY_ARROW_LEFT) {
        setActiveSlideIndex((prev) =>
          prev === 0 ? product.images.length - 1 : prev - 1
        );
      } else if (e.key === AppConstants.Product.CARD.KEY_ARROW_RIGHT) {
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

  const preloadAllProductImages = () => {
    if (typeof window === 'undefined') return;
    for (const img of product.images) {
      if (img?.image_url) {
        const preloader = new window.Image();
        preloader.src = img.image_url;
      }
    }
  };

  const openGalleryModal = () => {
    preloadAllProductImages();
    setActiveSlideIndex(0);
    setIsModalOpen(true);
  };

  return (
    <>
      <article
        className={AppConstants.Product.CARD.CLASSES.ARTICLE}
        onMouseEnter={preloadAllProductImages}
        onTouchStart={preloadAllProductImages}
      >
        {/* Clickable Product Image -> Opens Landscape Multi-Image Photo Modal */}
        <button
          type="button"
          onClick={openGalleryModal}
          aria-label={AppConstants.Product.CARD.ARIA.VIEW_ALL_PHOTOS(product.name)}
          className={AppConstants.Product.CARD.CLASSES.IMAGE_BUTTON}
        >
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                sizes={AppConstants.Product.CARD.SIZES_IMAGE}
                priority={priority}
                className={AppConstants.Product.CARD.CLASSES.IMAGE_PRIMARY(
                  Boolean(secondaryImage)
                )}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.image_url}
                  alt={
                    secondaryImage.alt_text ||
                    AppConstants.Product.CARD.COPY.ALTERNATE_VIEW(product.name)
                  }
                  fill
                  sizes={AppConstants.Product.CARD.SIZES_IMAGE}
                  className={AppConstants.Product.CARD.CLASSES.IMAGE_SECONDARY}
                />
              )}
            </>
          ) : (
            <div className={AppConstants.Product.CARD.CLASSES.NO_IMAGE}>
              {AppConstants.Product.CARD.COPY.NO_IMAGE}
            </div>
          )}

          {/* Top-left Badges */}
          <div className={AppConstants.Product.CARD.CLASSES.BADGE_CONTAINER}>
            {isOutOfStock ? (
              <span className={AppConstants.Product.CARD.CLASSES.BADGE_SOLD_OUT}>
                {AppConstants.Product.CARD.COPY.SOLD_OUT}
              </span>
            ) : discountPct ? (
              <span className={AppConstants.Product.CARD.CLASSES.BADGE_DISCOUNT}>
                {AppConstants.Product.CARD.COPY.DISCOUNT_BADGE(discountPct)}
              </span>
            ) : null}

            {!isOutOfStock &&
              product.collection?.slug ===
                AppConstants.Product.COLLECTIONS.NEW_COLLECTION_SLUG && (
                <span className={AppConstants.Product.CARD.CLASSES.BADGE_NEW_DROP}>
                  {AppConstants.Product.CARD.COPY.NEW_DROP}
                </span>
              )}
          </div>

          {/* Top-right Photo Count Indicator */}
          {product.images.length > 1 && (
            <div className={AppConstants.Product.CARD.CLASSES.COUNT_BADGE}>
              <Images className={AppConstants.Product.CARD.CLASSES.COUNT_ICON} />
              <span>{product.images.length}</span>
            </div>
          )}

          {/* Bottom Size Strip Overlay */}
          <div className={AppConstants.Product.CARD.CLASSES.SIZE_STRIP_WRAPPER}>
            <div className={AppConstants.Product.CARD.CLASSES.SIZE_STRIP}>
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className={AppConstants.Product.CARD.CLASSES.SIZE_BADGE}
                >
                  {size}
                </span>
              ))}
            </div>

            {isLowStock && (
              <span className={AppConstants.Product.CARD.CLASSES.LOW_STOCK_BADGE}>
                {AppConstants.Product.CARD.COPY.ONLY_LEFT(product.stock)}
              </span>
            )}
          </div>
        </button>

        {/* Product Metadata & Add to Cart Button below card (navigates to /product/[sku]) */}
        <div className={AppConstants.Product.CARD.CLASSES.META_CONTAINER}>
          <div>
            <div className={AppConstants.Product.CARD.CLASSES.META_HEADER}>
              <span className={AppConstants.Product.CARD.CLASSES.CATEGORY}>
                {product.category?.name ??
                  AppConstants.Product.CARD.DEFAULT_CATEGORY}
              </span>
              <span className={AppConstants.Product.CARD.CLASSES.SKU}>
                {product.sku}
              </span>
            </div>

            <Link
              href={AppConstants.Product.ROUTES.PRODUCT(product.sku)}
              className={AppConstants.Product.CARD.CLASSES.NAME_LINK}
            >
              {product.name}
            </Link>

            <div className={AppConstants.Product.CARD.CLASSES.PRICE_ROW}>
              <div className={AppConstants.Product.CARD.CLASSES.PRICE_GROUP}>
                {product.sale_price !== null &&
                product.sale_price < product.price ? (
                  <>
                    <span className={AppConstants.Product.CARD.CLASSES.PRICE_SALE}>
                      {formatPrice(product.sale_price)}
                    </span>
                    <span
                      className={AppConstants.Product.CARD.CLASSES.PRICE_REGULAR}
                    >
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className={AppConstants.Product.CARD.CLASSES.PRICE_NORMAL}>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Only show average rating badge when at least 1 customer review exists */}
              {product.review_count &&
              product.review_count > 0 &&
              product.average_rating ? (
                <span className={AppConstants.Product.CARD.CLASSES.RATING_BADGE}>
                  <Star className={AppConstants.Product.CARD.CLASSES.RATING_STAR} />
                  <span>{product.average_rating.toFixed(1)}</span>
                  <span className={AppConstants.Product.CARD.CLASSES.RATING_COUNT}>
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
                router.push(AppConstants.Product.ROUTES.PRODUCT(product.sku));
              });
            }}
            className={AppConstants.Product.CARD.CLASSES.CTA_BUTTON}
          >
            {isNavigating ? (
              <>
                <Loader2
                  className={AppConstants.Product.CARD.CLASSES.CTA_SPINNER}
                />
                <span>
                  {AppConstants.Product.CARD.COPY.OPENING_SKU(product.sku)}
                </span>
              </>
            ) : (
              <>
                <ShoppingBag
                  className={AppConstants.Product.CARD.CLASSES.CTA_ICON}
                />
                <span>{AppConstants.Product.CARD.COPY.ADD_TO_CART}</span>
              </>
            )}
          </button>
        </div>
      </article>

      {isNavigating && (
        <LuxurySpinner
          fullScreenOverlay
          title={AppConstants.Product.CARD.COPY.SPINNER_TITLE(product.name)}
          subtitle={AppConstants.Product.CARD.COPY.SPINNER_SUBTITLE(product.sku)}
        />
      )}

      {/* Centered Pure Frosted-Glass Photo Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={AppConstants.Product.CARD.ARIA.PHOTO_VIEWER(product.name)}
          className={AppConstants.Product.CARD.CLASSES.MODAL_BACKDROP}
        >
          {/* Pure Translucent Frosted Glass Card */}
          <div
            onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              if (touchStartX === null || product.images.length <= 1) return;
              const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX;
              const deltaX = touchStartX - touchEndX;
              if (
                Math.abs(deltaX) >
                AppConstants.Product.CARD.SWIPE_THRESHOLD_PX
              ) {
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
            className={AppConstants.Product.CARD.CLASSES.MODAL_CARD}
          >
            {/* Floating Glassy Close (X) Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label={AppConstants.Product.CARD.ARIA.CLOSE_VIEWER}
              className={AppConstants.Product.CARD.CLASSES.CLOSE_BUTTON}
            >
              <X className={AppConstants.Product.CARD.CLASSES.CLOSE_ICON} />
            </button>

            {/* Pre-rendered Stack of All Product Photos for 0ms Instant Switching */}
            {product.images.map((img, idx) => {
              const isActive = idx === activeSlideIndex;
              return (
                <Image
                  key={img.id || idx}
                  src={img.image_url}
                  alt={
                    img.alt_text ||
                    AppConstants.Product.GALLERY.COPY.VIEW_N(
                      product.name,
                      idx + 1
                    )
                  }
                  fill
                  priority
                  loading="eager"
                  sizes={AppConstants.Product.CARD.MODAL_IMAGE_SIZES}
                  className={AppConstants.Product.CARD.CLASSES.MODAL_IMAGE(
                    isActive
                  )}
                />
              );
            })}

            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSlideIndex((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  aria-label={AppConstants.Product.CARD.ARIA.PREV_PHOTO}
                  className={AppConstants.Product.CARD.CLASSES.NAV_PREV}
                >
                  <ChevronLeft
                    className={AppConstants.Product.CARD.CLASSES.NAV_ICON}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSlideIndex((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  aria-label={AppConstants.Product.CARD.ARIA.NEXT_PHOTO}
                  className={AppConstants.Product.CARD.CLASSES.NAV_NEXT}
                >
                  <ChevronRight
                    className={AppConstants.Product.CARD.CLASSES.NAV_ICON}
                  />
                </button>
              </>
            )}

            {/* Bottom Glassmorphism Pill with Glassy Dot Indicators */}
            <div className={AppConstants.Product.CARD.CLASSES.DOTS_WRAPPER}>
              <div
                role="tablist"
                aria-label={AppConstants.Product.CARD.ARIA.TABLIST}
                className={AppConstants.Product.CARD.CLASSES.DOTS_BAR}
              >
                {product.images.map((img, idx) => {
                  const isCurrent = idx === activeSlideIndex;
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      aria-label={AppConstants.Product.CARD.ARIA.PHOTO_TAB(
                        idx + 1,
                        product.images.length
                      )}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={AppConstants.Product.CARD.CLASSES.DOT(isCurrent)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
