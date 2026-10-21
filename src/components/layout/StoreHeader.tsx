// ============================================================================
// Header & Mobile Navigation: src/components/layout/StoreHeader.tsx
// Features a continuously moving "SUDHA SALES" announcement ticker bar plus
// an animated shimmering/floating "SUDHA SALES" brand mark in the sticky header.
// ============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Search,
  ChevronRight,
  User,
} from 'lucide-react';
import { useCart } from '@/store/cart-context';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { publicEnv } from '@/lib/env';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop?collection=new-collection', label: 'New Collection', badge: 'Daily Drop' },
  { href: '/shop', label: 'All Styles' },
  { href: '/shop?category=kurtis', label: 'Kurtis' },
  { href: '/shop?category=co-ord-sets', label: 'Co-ord Sets' },
  { href: '/shop?category=suit-sets', label: 'Suit Sets' },
  { href: '/shop?category=dresses', label: 'Dresses' },
];

const MARQUEE_ITEMS = [
  `${publicEnv.storeName} — Fresh Warehouse Collections Added Daily`,
  `${publicEnv.storeName} — Free Express Shipping Above ₹1,499`,
  `${publicEnv.storeName} — Tap Any Photo to View Full Multi-Angle Gallery`,
  `${publicEnv.storeName} — Direct Loom & Warehouse Prices`,
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalQuantity, isHydrated } = useCart();
  const {
    customer,
    isAuthenticated,
    isHydrated: isAuthHydrated,
  } = useCustomerAuth();

  const firstName = customer?.name.split(' ')[0] || customer?.name || '';

  return (
    <>
      {/* Moving Marquee Ticker Bar */}
      <div className="bg-stone-900 text-stone-100 text-xs tracking-wider py-2 overflow-hidden border-b border-stone-800">
        <div className="animate-sudha-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-8 font-medium whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Button + Animated Moving Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-stone-800 hover:bg-stone-100 active:bg-stone-200 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href="/"
              className="font-serif text-xl sm:text-2xl tracking-[0.16em] font-bold animate-sudha-brand inline-block"
            >
              {publicEnv.storeName}
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href.split('?')[0]) &&
                    link.href === '/shop';

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 transition-colors hover:text-stone-950 flex items-center gap-1.5 ${
                    isActive ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Customer Greeting / Login, Admin Link, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/shop"
              aria-label="Browse and search catalog"
              className="p-2 rounded-full text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isAuthHydrated && isAuthenticated && customer ? (
              <Link
                href="/account"
                title="View previous orders, invoices, shopping bag & saved addresses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-stone-950 text-xs font-semibold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  Namaste &apos;{firstName}&apos;
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-950 px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold tabular-nums">
                {isHydrated ? totalQuantity : 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-[84%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                <span className="font-serif text-lg tracking-[0.16em] font-bold animate-sudha-brand">
                  {publicEnv.storeName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-stone-800 hover:bg-stone-100 font-medium text-sm transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.badge && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2.5">
              {isAuthHydrated && isAuthenticated && customer ? (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-stone-950 text-xs font-bold"
                >
                  <span>Namaste &apos;{firstName}&apos; (My Account)</span>
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sign In with Google
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-300" />
                </Link>
              )}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                  Store Admin Portal
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <p className="text-[11px] text-stone-500 text-center">
                Fresh styles curated daily • Pan-India Delivery
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
