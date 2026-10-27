// ============================================================================
// Home Page: src/app/(storefront)/page.tsx
// Mobile-first fashion storefront highlighting the New Collection daily drops,
// visual category navigation, and full featured collection.
// Bound to AppConstants.Storefront.HOME and AppConstants.Product.ROUTES.
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
import { AppConstants } from '@/constants/app.constants';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, newCollectionProducts, allProducts] = await Promise.all([
    getCategories(),
    getNewCollectionProducts(
      AppConstants.Storefront.HOME.NEW_COLLECTION_LIMIT
    ),
    getProducts(),
  ]);

  const curatedProducts = allProducts.slice(
    0,
    AppConstants.Storefront.HOME.CURATED_PRODUCTS_LIMIT
  );

  return (
    <div className={AppConstants.Storefront.HOME.CLASSES.CONTAINER}>
      {/* Editorial Hero Banner */}
      <section
        className={AppConstants.Storefront.HOME.CLASSES.HERO_SECTION}
      >
        <div className={AppConstants.Storefront.HOME.CLASSES.HERO_GRID}>
          <div className={AppConstants.Storefront.HOME.CLASSES.HERO_LEFT}>
            <div
              className={AppConstants.Storefront.HOME.CLASSES.HERO_TAG}
            >
              <Sparkles
                className={AppConstants.Storefront.HOME.CLASSES.TAG_ICON}
              />
              <span>{AppConstants.Storefront.HOME.HERO.TAG}</span>
            </div>

            <h1
              className={AppConstants.Storefront.HOME.CLASSES.HERO_TITLE}
            >
              {AppConstants.Storefront.HOME.HERO.TITLE}
            </h1>

            <p className={AppConstants.Storefront.HOME.CLASSES.HERO_DESC}>
              {AppConstants.Storefront.HOME.HERO.DESCRIPTION}
            </p>

            <div
              className={AppConstants.Storefront.HOME.CLASSES.HERO_BUTTONS}
            >
              <Link
                href={AppConstants.Product.ROUTES.SHOP_COLLECTION(
                  AppConstants.Storefront.DEFAULT_COLLECTION_SLUG
                )}
                className={
                  AppConstants.Storefront.HOME.CLASSES.PRIMARY_BUTTON
                }
              >
                <span>
                  {AppConstants.Storefront.HOME.HERO.CTA_NEW_COLLECTION}
                </span>
                <ArrowRight
                  className={AppConstants.Storefront.HOME.CLASSES.ARROW_ICON}
                />
              </Link>
              <Link
                href={AppConstants.Product.ROUTES.SHOP}
                className={
                  AppConstants.Storefront.HOME.CLASSES.SECONDARY_BUTTON
                }
              >
                <span>
                  {AppConstants.Storefront.HOME.HERO.CTA_ALL_STYLES}
                </span>
              </Link>
            </div>
          </div>

          <div
            className={
              AppConstants.Storefront.HOME.CLASSES.HERO_IMAGES_GRID
            }
          >
            <div
              className={
                AppConstants.Storefront.HOME.CLASSES.HERO_IMAGE_WRAPPER_1
              }
            >
              <Image
                src={AppConstants.Storefront.HOME.HERO.IMAGE_1_SRC}
                alt={AppConstants.Storefront.HOME.HERO.IMAGE_1_ALT}
                fill
                priority
                sizes={AppConstants.Storefront.HOME.HERO.IMAGE_SIZES}
                className={AppConstants.Storefront.HOME.CLASSES.HERO_IMAGE}
              />
            </div>
            <div
              className={
                AppConstants.Storefront.HOME.CLASSES.HERO_IMAGE_WRAPPER_2
              }
            >
              <Image
                src={AppConstants.Storefront.HOME.HERO.IMAGE_2_SRC}
                alt={AppConstants.Storefront.HOME.HERO.IMAGE_2_ALT}
                fill
                priority
                sizes={AppConstants.Storefront.HOME.HERO.IMAGE_SIZES}
                className={AppConstants.Storefront.HOME.CLASSES.HERO_IMAGE}
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Collection Section (Daily Arrivals) */}
      <section className={AppConstants.Storefront.HOME.CLASSES.SECTION}>
        <div
          className={AppConstants.Storefront.HOME.CLASSES.SECTION_HEADER}
        >
          <div>
            <span
              className={AppConstants.Storefront.HOME.CLASSES.TAG_AMBER}
            >
              {AppConstants.Storefront.HOME.NEW_COLLECTION.TAG}
            </span>
            <h2
              className={AppConstants.Storefront.HOME.CLASSES.SECTION_TITLE}
            >
              {AppConstants.Storefront.HOME.NEW_COLLECTION.TITLE}
            </h2>
          </div>
          <Link
            href={AppConstants.Product.ROUTES.SHOP_COLLECTION(
              AppConstants.Storefront.DEFAULT_COLLECTION_SLUG
            )}
            className={AppConstants.Storefront.HOME.CLASSES.HEADER_LINK}
          >
            <span>
              {AppConstants.Storefront.HOME.NEW_COLLECTION.LINK}
            </span>
            <ArrowRight
              className={AppConstants.Storefront.HOME.CLASSES.ARROW_ICON}
            />
          </Link>
        </div>

        <div
          className={AppConstants.Storefront.HOME.CLASSES.PRODUCTS_GRID}
        >
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
      <section className={AppConstants.Storefront.HOME.CLASSES.SECTION}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span
              className={AppConstants.Storefront.HOME.CLASSES.TAG_MUTED}
            >
              {AppConstants.Storefront.HOME.CATEGORIES.TAG}
            </span>
            <h2
              className={AppConstants.Storefront.HOME.CLASSES.SECTION_TITLE}
            >
              {AppConstants.Storefront.HOME.CATEGORIES.TITLE}
            </h2>
          </div>
        </div>

        <div className={AppConstants.Storefront.HOME.CLASSES.CAT_GRID}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={AppConstants.Product.ROUTES.SHOP_CATEGORY(cat.slug)}
              className={AppConstants.Storefront.HOME.CLASSES.CAT_CARD}
            >
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes={
                    AppConstants.Storefront.HOME.CATEGORIES.IMAGE_SIZES
                  }
                  className={AppConstants.Storefront.HOME.CLASSES.CAT_IMAGE}
                />
              )}
              <div
                className={AppConstants.Storefront.HOME.CLASSES.CAT_OVERLAY}
              />
              <div
                className={
                  AppConstants.Storefront.HOME.CLASSES.CAT_TEXT_WRAP
                }
              >
                <h3 className={AppConstants.Storefront.HOME.CLASSES.CAT_NAME}>
                  {cat.name}
                </h3>
                <p
                  className={
                    AppConstants.Storefront.HOME.CLASSES.CAT_SUBTEXT
                  }
                >
                  <span>
                    {AppConstants.Storefront.HOME.CATEGORIES.EXPLORE_STYLES}
                  </span>
                  <ArrowRight
                    className={
                      AppConstants.Storefront.HOME.CLASSES.CAT_ARROW
                    }
                  />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Catalog Grid */}
      <section className={AppConstants.Storefront.HOME.CLASSES.SECTION}>
        <div
          className={AppConstants.Storefront.HOME.CLASSES.SECTION_HEADER}
        >
          <div>
            <span
              className={AppConstants.Storefront.HOME.CLASSES.TAG_MUTED}
            >
              {AppConstants.Storefront.HOME.TRENDING.TAG}
            </span>
            <h2
              className={AppConstants.Storefront.HOME.CLASSES.SECTION_TITLE}
            >
              {AppConstants.Storefront.HOME.TRENDING.TITLE}
            </h2>
          </div>
          <Link
            href={AppConstants.Product.ROUTES.SHOP}
            className={AppConstants.Storefront.HOME.CLASSES.HEADER_LINK}
          >
            <span>
              {AppConstants.Storefront.HOME.TRENDING.VIEW_ALL(
                allProducts.length
              )}
            </span>
            <ArrowRight
              className={AppConstants.Storefront.HOME.CLASSES.ARROW_ICON}
            />
          </Link>
        </div>

        <div
          className={
            AppConstants.Storefront.HOME.CLASSES.PRODUCTS_GRID.replace(
              'grid-cols-2 md:grid-cols-4',
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            )
          }
        >
          {curatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Value Proposition Strip */}
      <section className={AppConstants.Storefront.HOME.CLASSES.SECTION}>
        <div className={AppConstants.Storefront.HOME.CLASSES.VALUE_GRID}>
          <div className={AppConstants.Storefront.HOME.CLASSES.VALUE_ITEM}>
            <div
              className={
                AppConstants.Storefront.HOME.CLASSES.VALUE_ICON_BOX
              }
            >
              <Truck
                className={AppConstants.Storefront.HOME.CLASSES.VALUE_ICON}
              />
            </div>
            <div>
              <h3
                className={
                  AppConstants.Storefront.HOME.CLASSES.VALUE_TITLE
                }
              >
                {AppConstants.Storefront.HOME.VALUE_PROPS[0].title}
              </h3>
              <p className={AppConstants.Storefront.HOME.CLASSES.VALUE_DESC}>
                {AppConstants.Storefront.HOME.VALUE_PROPS[0].description}
              </p>
            </div>
          </div>

          <div className={AppConstants.Storefront.HOME.CLASSES.VALUE_ITEM}>
            <div
              className={
                AppConstants.Storefront.HOME.CLASSES.VALUE_ICON_BOX
              }
            >
              <ShieldCheck
                className={AppConstants.Storefront.HOME.CLASSES.VALUE_ICON}
              />
            </div>
            <div>
              <h3
                className={
                  AppConstants.Storefront.HOME.CLASSES.VALUE_TITLE
                }
              >
                {AppConstants.Storefront.HOME.VALUE_PROPS[1].title}
              </h3>
              <p className={AppConstants.Storefront.HOME.CLASSES.VALUE_DESC}>
                {AppConstants.Storefront.HOME.VALUE_PROPS[1].description}
              </p>
            </div>
          </div>

          <div className={AppConstants.Storefront.HOME.CLASSES.VALUE_ITEM}>
            <div
              className={
                AppConstants.Storefront.HOME.CLASSES.VALUE_ICON_BOX
              }
            >
              <RefreshCw
                className={AppConstants.Storefront.HOME.CLASSES.VALUE_ICON}
              />
            </div>
            <div>
              <h3
                className={
                  AppConstants.Storefront.HOME.CLASSES.VALUE_TITLE
                }
              >
                {AppConstants.Storefront.HOME.VALUE_PROPS[2].title}
              </h3>
              <p className={AppConstants.Storefront.HOME.CLASSES.VALUE_DESC}>
                {AppConstants.Storefront.HOME.VALUE_PROPS[2].description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
