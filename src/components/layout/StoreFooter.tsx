// ============================================================================
// Store Footer: src/components/layout/StoreFooter.tsx
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { publicEnv } from '@/lib/env';

export function StoreFooter() {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <p className="font-serif text-xl tracking-[0.14em] font-semibold text-white whitespace-nowrap">
              {publicEnv.storeName}
            </p>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Curated contemporary Indian ethnic and resort wear. Sourced directly from
              artisan looms and partner warehouses with fresh collections dropping daily.
            </p>
            <div className="pt-1 text-xs text-stone-400 space-y-1">
              <p>Dispatch within 24–48 hours across India</p>
              <p>Easy 7-day size exchange • Secure online checkout</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Shop Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/shop?collection=new-collection" className="hover:text-white transition-colors">
                  New Collection (Daily Drop)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kurtis" className="hover:text-white transition-colors">
                  Kurtis &amp; Tunics
                </Link>
              </li>
              <li>
                <Link href="/shop?category=co-ord-sets" className="hover:text-white transition-colors">
                  Tailored Co-ord Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=suit-sets" className="hover:text-white transition-colors">
                  Festive Suit Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="hover:text-white transition-colors">
                  Dresses &amp; Midis
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  View Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Orders &amp; Invoices
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Browse Full Catalog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {publicEnv.storeName}. All rights reserved.</p>
          <p>SKU-Driven Catalog • Built for Mobile &amp; WhatsApp Shoppers</p>
        </div>
      </div>
    </footer>
  );
}
