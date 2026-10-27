// ============================================================================
// Product Image Gallery: src/components/product/ProductGallery.tsx
// Mobile-first swipe/tap multi-image gallery supporting front, back, and model
// shots synced from Google Drive/S3 folders.
// ============================================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="aspect-[3/4] w-full rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
        No product images available
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
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0 pb-1 sm:pb-0">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-[3/4] w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'border-stone-900 ring-2 ring-stone-900/15'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || `${productName} view ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Hero Image (Pre-renders all slides for 0ms instant switching) */}
      <div className="relative aspect-[3/4] w-full flex-1 rounded-2xl overflow-hidden bg-stone-100">
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
              sizes="(max-width: 768px) 100vw, 55vw"
              className={`object-cover object-top transition-opacity duration-150 ${
                isActive
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            />
          );
        })}

        {discountBadge ? (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
            Save {discountBadge}%
          </div>
        ) : null}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 flex items-center justify-center shadow-md hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 flex items-center justify-center shadow-md hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-950/70 text-white text-[11px] font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
