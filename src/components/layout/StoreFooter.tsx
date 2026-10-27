// ============================================================================
// Store Footer: src/components/layout/StoreFooter.tsx
// Bound to AppConstants.Storefront.FOOTER and AppConstants.Shipping.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { publicEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';

export function StoreFooter() {
  return (
    <footer className={AppConstants.Storefront.FOOTER.CLASSES.FOOTER}>
      <div className={AppConstants.Storefront.FOOTER.CLASSES.CONTAINER}>
        <div className={AppConstants.Storefront.FOOTER.CLASSES.GRID}>
          {/* Brand Column */}
          <div className={AppConstants.Storefront.FOOTER.CLASSES.BRAND_COL}>
            <p className={AppConstants.Storefront.FOOTER.CLASSES.BRAND_NAME}>
              {publicEnv.storeName}
            </p>
            <p className={AppConstants.Storefront.FOOTER.CLASSES.BRAND_TEXT}>
              {AppConstants.Storefront.FOOTER.COPY.BRAND_STORY}
            </p>
            <div className={AppConstants.Storefront.FOOTER.CLASSES.BRAND_SHIPPING}>
              <p>
                {AppConstants.Shipping.DISPATCH_TIMELINE}
                {AppConstants.Storefront.FOOTER.COPY.DISPATCH_ACROSS_INDIA}
              </p>
              <p>
                {AppConstants.Shipping.EXCHANGE_POLICY}
                {AppConstants.Storefront.FOOTER.COPY.EXCHANGE_AND_SECURE}
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className={AppConstants.Storefront.FOOTER.CLASSES.COL_TITLE}>
              {AppConstants.Storefront.FOOTER.COPY.HEADING_CATEGORIES}
            </h3>
            <ul className={AppConstants.Storefront.FOOTER.CLASSES.LINKS_LIST}>
              {AppConstants.Storefront.FOOTER.CATEGORIES_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={AppConstants.Storefront.FOOTER.CLASSES.LINK}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={AppConstants.Storefront.FOOTER.CLASSES.COL_TITLE}>
              {AppConstants.Storefront.FOOTER.COPY.HEADING_CUSTOMER_CARE}
            </h3>
            <ul className={AppConstants.Storefront.FOOTER.CLASSES.LINKS_LIST}>
              {AppConstants.Storefront.FOOTER.CARE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={AppConstants.Storefront.FOOTER.CLASSES.LINK}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={AppConstants.Storefront.FOOTER.CLASSES.BOTTOM_BAR}>
          <p>
            © {new Date().getFullYear()} {publicEnv.storeName}
            {AppConstants.Storefront.FOOTER.COPY.RIGHTS_RESERVED}
          </p>
          <p>{AppConstants.Storefront.FOOTER.COPY.TAGLINE_BOTTOM}</p>
        </div>
      </div>
    </footer>
  );
}
