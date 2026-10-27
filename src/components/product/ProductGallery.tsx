// ============================================================================
// Product Image Gallery: src/components/product/ProductGallery.tsx
// Mobile-first swipe/tap multi-image gallery supporting front, back, and model
// shots synced from Google Drive/S3 folders.
// Bound to AppConstants.Product.GALLERY.
// ============================================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppConstants } from '@/constants/app.constants';
import type { ProductImage } from '@/types/domain';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  discountBadge?: number | null;
}

export function ProductGallery({
  images,
  productName,
  discountBadge,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={AppConstants.Product.GALLERY.CLASSES.EMPTY}>
        {AppConstants.Product.GALLERY.COPY.EMPTY}
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={AppConstants.Product.GALLERY.CLASSES.WRAPPER}>
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className={AppConstants.Product.GALLERY.CLASSES.THUMB_STRIP}>
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={AppConstants.Product.GALLERY.CLASSES.THUMB_BUTTON(
                  isSelected
                )}
              >
                <Image
                  src={img.image_url}
                  alt={
                    img.alt_text ||
                    AppConstants.Product.GALLERY.COPY.VIEW_N(
                      productName,
                      idx + 1
                    )
                  }
                  fill
                  sizes={AppConstants.Product.GALLERY.THUMB_SIZES}
                  className={AppConstants.Product.GALLERY.CLASSES.THUMB_IMAGE}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Hero Image */}
      <div className={AppConstants.Product.GALLERY.CLASSES.HERO_WRAPPER}>
        {images.map((img, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <Image
              key={img.id || idx}
              src={img.image_url}
              alt={img.alt_text || productName}
              fill
              priority
              loading="eager"
              sizes={AppConstants.Product.GALLERY.HERO_SIZES}
              className={AppConstants.Product.GALLERY.CLASSES.HERO_IMAGE(
                isActive
              )}
            />
          );
        })}

        {discountBadge ? (
          <div className={AppConstants.Product.GALLERY.CLASSES.DISCOUNT_BADGE}>
            {AppConstants.Product.GALLERY.COPY.SAVE_PCT(discountBadge)}
          </div>
        ) : null}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label={AppConstants.Product.GALLERY.COPY.PREV_ARIA}
              className={AppConstants.Product.GALLERY.CLASSES.NAV_PREV}
            >
              <ChevronLeft
                className={AppConstants.Product.GALLERY.CLASSES.NAV_ICON}
              />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={AppConstants.Product.GALLERY.COPY.NEXT_ARIA}
              className={AppConstants.Product.GALLERY.CLASSES.NAV_NEXT}
            >
              <ChevronRight
                className={AppConstants.Product.GALLERY.CLASSES.NAV_ICON}
              />
            </button>

            <div className={AppConstants.Product.GALLERY.CLASSES.PAGER_PILL}>
              {AppConstants.Product.GALLERY.COPY.PAGER(
                selectedIndex + 1,
                images.length
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
