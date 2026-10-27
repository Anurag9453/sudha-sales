// ============================================================================
// Product Detail Page: src/app/(storefront)/product/[sku]/page.tsx
// Displays multi-image gallery, SKU badge, regular & sale price, size selector,
// stock availability, quantity selector, Add to Bag, and related products.
// Bound to AppConstants.Product.DETAIL and AppConstants.Product.ROUTES.
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
import { AppConstants } from '@/constants/app.constants';

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

  const relatedProducts = await getRelatedProducts(
    product,
    AppConstants.Product.DETAIL.RELATED_PRODUCTS_LIMIT
  );
  const discountPct = getDiscountPercentage(product.price, product.sale_price);

  return (
    <div className={AppConstants.Product.DETAIL.CLASSES.PAGE}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label={AppConstants.Product.DETAIL.ARIA.BREADCRUMB}
        className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB}
      >
        <Link
          href={AppConstants.Product.ROUTES.HOME}
          className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_LINK}
        >
          {AppConstants.Product.DETAIL.COPY.HOME}
        </Link>
        <ChevronRight
          className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_ICON}
        />
        <Link
          href={AppConstants.Product.ROUTES.SHOP}
          className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_LINK}
        >
          {AppConstants.Product.DETAIL.COPY.SHOP}
        </Link>
        {product.category && (
          <>
            <ChevronRight
              className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_ICON}
            />
            <Link
              href={AppConstants.Product.ROUTES.SHOP_CATEGORY(
                product.category.slug
              )}
              className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_LINK}
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight
          className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_ICON}
        />
        <span className={AppConstants.Product.DETAIL.CLASSES.BREADCRUMB_CURRENT}>
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className={AppConstants.Product.DETAIL.CLASSES.LAYOUT_GRID}>
        {/* Left: Multi-Image Gallery */}
        <div className={AppConstants.Product.DETAIL.CLASSES.GALLERY_COL}>
          <ProductGallery
            images={product.images}
            productName={product.name}
            discountBadge={discountPct}
          />
        </div>

        {/* Right: Product Info & Purchase Controls */}
        <div className={AppConstants.Product.DETAIL.CLASSES.INFO_COL}>
          <div className={AppConstants.Product.DETAIL.CLASSES.TAGS_ROW}>
            <div className={AppConstants.Product.DETAIL.CLASSES.TAGS_LEFT}>
              {product.collection && (
                <Link
                  href={AppConstants.Product.ROUTES.SHOP_COLLECTION(
                    product.collection.slug
                  )}
                  className={
                    AppConstants.Product.DETAIL.CLASSES.COLLECTION_BADGE
                  }
                >
                  <Sparkles
                    className={
                      AppConstants.Product.DETAIL.CLASSES.SPARKLE_ICON
                    }
                  />
                  {product.collection.name}
                </Link>
              )}
              {product.category && (
                <span
                  className={AppConstants.Product.DETAIL.CLASSES.CATEGORY_TEXT}
                >
                  {product.category.name}
                </span>
              )}
            </div>

            <span className={AppConstants.Product.DETAIL.CLASSES.SKU_BADGE}>
              {AppConstants.Product.DETAIL.COPY.SKU_PREFIX}
              {product.sku}
            </span>
          </div>

          <h1 className={AppConstants.Product.DETAIL.CLASSES.TITLE}>
            {product.name}
          </h1>

          {/* Only render Average Rating summary if at least 1 real customer review exists */}
          {product.review_count &&
          product.review_count > 0 &&
          product.average_rating ? (
            <a
              href={`#${AppConstants.Product.REVIEWS.SECTION_ID}`}
              className={AppConstants.Product.DETAIL.CLASSES.RATING_LINK}
            >
              <span
                className={AppConstants.Product.DETAIL.CLASSES.RATING_STARS}
              >
                {AppConstants.Product.REVIEWS.STARS.map((star) => (
                  <Star
                    key={star}
                    className={AppConstants.Product.DETAIL.CLASSES.STAR_ICON(
                      star <= Math.round(product.average_rating!)
                    )}
                  />
                ))}
              </span>
              <span className={AppConstants.Product.DETAIL.CLASSES.RATING_AVG}>
                {AppConstants.Product.DETAIL.COPY.RATING_OUT_OF_5(
                  product.average_rating.toFixed(1)
                )}
              </span>
              <span className={AppConstants.Product.DETAIL.CLASSES.RATING_DOT}>
                •
              </span>
              <span
                className={
                  AppConstants.Product.DETAIL.CLASSES.RATING_COUNT_TEXT
                }
              >
                {product.review_count}{' '}
                {product.review_count === 1
                  ? AppConstants.Product.DETAIL.COPY.CUSTOMER_REVIEW
                  : AppConstants.Product.DETAIL.COPY.CUSTOMER_REVIEWS}
              </span>
            </a>
          ) : null}

          {/* Pricing Block */}
          <div className={AppConstants.Product.DETAIL.CLASSES.PRICE_ROW}>
            {product.sale_price !== null &&
            product.sale_price < product.price ? (
              <>
                <span className={AppConstants.Product.DETAIL.CLASSES.PRICE_SALE}>
                  {formatPrice(product.sale_price)}
                </span>
                <span
                  className={AppConstants.Product.DETAIL.CLASSES.PRICE_REGULAR}
                >
                  {formatPrice(product.price)}
                </span>
                {discountPct && (
                  <span
                    className={
                      AppConstants.Product.DETAIL.CLASSES.PRICE_DISCOUNT_BADGE
                    }
                  >
                    {AppConstants.Product.DETAIL.COPY.SAVE_PCT(discountPct)}
                  </span>
                )}
              </>
            ) : (
              <span
                className={AppConstants.Product.DETAIL.CLASSES.PRICE_NORMAL}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className={AppConstants.Product.DETAIL.CLASSES.TAX_NOTE}>
            {AppConstants.Product.DETAIL.COPY.TAX_SHIPPING_NOTE}
          </p>

          {/* Color Pill */}
          {product.color && (
            <div className={AppConstants.Product.DETAIL.CLASSES.COLOR_ROW}>
              <Layers
                className={AppConstants.Product.DETAIL.CLASSES.LAYERS_ICON}
              />
              <span>{AppConstants.Product.DETAIL.COPY.COLOR_SHADE_LABEL}</span>
              <strong
                className={AppConstants.Product.DETAIL.CLASSES.COLOR_VALUE}
              >
                {product.color}
              </strong>
            </div>
          )}

          {/* Interactive Size, Quantity, Stock & Add to Cart */}
          <ProductPurchasePanel product={product} />

          {/* Product Story & Fabric Details */}
          <div className={AppConstants.Product.DETAIL.CLASSES.STORY_SECTION}>
            <div>
              <h2
                className={
                  AppConstants.Product.DETAIL.CLASSES.DESCRIPTION_HEADING
                }
              >
                {AppConstants.Product.DETAIL.COPY.DESCRIPTION_HEADING}
              </h2>
              <p
                className={AppConstants.Product.DETAIL.CLASSES.DESCRIPTION_TEXT}
              >
                {product.description}
              </p>
            </div>

            <div className={AppConstants.Product.DETAIL.CLASSES.SPECS_BOX}>
              <div className={AppConstants.Product.DETAIL.CLASSES.SPEC_ROW}>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_LABEL}>
                  {AppConstants.Product.DETAIL.COPY.SPEC_SKU_LABEL}
                </span>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_SKU}>
                  {product.sku}
                </span>
              </div>
              <div className={AppConstants.Product.DETAIL.CLASSES.SPEC_ROW}>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_LABEL}>
                  {AppConstants.Product.DETAIL.COPY.SPEC_SIZES_LABEL}
                </span>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_SIZES}>
                  {product.sizes.join(', ')}
                </span>
              </div>
              <div className={AppConstants.Product.DETAIL.CLASSES.SPEC_ROW}>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_LABEL}>
                  {AppConstants.Product.DETAIL.COPY.SPEC_WASH_CARE_LABEL}
                </span>
                <span className={AppConstants.Product.DETAIL.CLASSES.SPEC_CARE}>
                  {AppConstants.Product.DETAIL.COPY.SPEC_WASH_CARE_VALUE}
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
        <section
          className={AppConstants.Product.DETAIL.CLASSES.RELATED_SECTION}
        >
          <h2
            className={AppConstants.Product.DETAIL.CLASSES.RELATED_HEADING}
          >
            {AppConstants.Product.DETAIL.COPY.RELATED_HEADING}
          </h2>
          <div className={AppConstants.Product.DETAIL.CLASSES.RELATED_GRID}>
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
