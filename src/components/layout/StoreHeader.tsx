// ============================================================================
// Header & Mobile Navigation: src/components/layout/StoreHeader.tsx
// - Top-left: Single-line animated "SUDHA SALES" logo with spinning emblem.
// - Top-right: "Namaste <FirstName>" + Circular Profile Avatar button that
//   opens a Right-Side Account Drawer with Orders, Shopping Bag, Saved
//   Addresses, and Logout.
// - No Admin button in the customer header (Admins access `/admin` directly).
// ============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ShoppingBag,
  Sparkles,
  Search,
  ChevronRight,
  User,
  Package,
  MapPin,
  LogOut,
  FileText,
} from 'lucide-react';
import { useCart } from '@/store/cart-context';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { publicEnv } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { SudhaSpinnerBadge } from '@/components/ui/LuxurySpinner';
import { AppConstants } from '@/constants/app.constants';

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
  `${publicEnv.storeName} — Free Express Shipping Above ${formatPrice(AppConstants.Shipping.FREE_SHIPPING_THRESHOLD)}`,
  `${publicEnv.storeName} — Tap Any Photo to View Full Multi-Angle Gallery`,
  `${publicEnv.storeName} — Direct Loom & Warehouse Prices`,
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalQuantity, subtotalAmount, isHydrated } = useCart();
  const {
    customer,
    isAuthenticated,
    isHydrated: isAuthHydrated,
    orders,
    addresses,
    signOutCustomer,
  } = useCustomerAuth();

  const firstName = customer?.name.split(' ')[0] || customer?.name || '';
  const initialLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const handleLogoutFromDrawer = async () => {
    await signOutCustomer();
    setAccountDrawerOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* Moving Marquee Ticker Bar */}
      <div className="w-full max-w-[100vw] bg-stone-900 text-stone-100 text-[11px] sm:text-xs tracking-wider py-2 overflow-hidden border-b border-stone-800">
        <div className="animate-sudha-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-6 sm:px-8 font-medium whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full max-w-[100vw] bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Top-Left: Mobile Menu Button + Single-Line SUDHA SALES Logo with Spinner Emblem */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-stone-800 hover:bg-stone-100 active:bg-stone-200 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap group"
            >
              <SudhaSpinnerBadge size="sm" theme="light" />
              <span className="font-serif text-[15px] sm:text-xl xl:text-2xl tracking-[0.08em] sm:tracking-[0.14em] font-bold animate-sudha-brand whitespace-nowrap inline-block">
                {publicEnv.storeName}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-stone-700 shrink-0">
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
                  className={`relative py-1 transition-colors hover:text-stone-950 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive ? 'text-stone-950 font-semibold' : ''
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold whitespace-nowrap">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Top-Right: Search, Shopping Bag, Greeting + Circular Drawer Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/shop"
              aria-label="Browse and search catalog"
              className="p-1.5 sm:p-2 rounded-full text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs font-bold tabular-nums">
                {isHydrated ? totalQuantity : 0}
              </span>
            </Link>

            {isAuthHydrated && isAuthenticated && customer ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-stone-950 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Namaste {firstName}</span>
                </button>

                {/* Top-Right Circular Profile Button that opens the Right-Side Drawer */}
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  aria-label="Open customer account menu drawer"
                  title={`Namaste ${firstName} — Click to open Orders, Bag & Account Drawer`}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 font-serif font-bold text-xs sm:text-sm flex items-center justify-center shadow-md ring-2 ring-amber-400/50 transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <span>{initialLetter}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <span>Sign In</span>
                </Link>

                {/* Top-Right Circular Menu Trigger even when signed out */}
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  aria-label="Open customer menu drawer"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shadow-md ring-2 ring-stone-200 transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Left Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-[84%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-2">
                <span className="font-serif text-lg tracking-[0.14em] font-bold animate-sudha-brand whitespace-nowrap">
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAccountDrawerOpen(true);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-stone-950 text-xs font-bold cursor-pointer"
                >
                  <span>Namaste {firstName}</span>
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>
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
              <p className="text-[11px] text-stone-500 text-center">
                Fresh styles curated daily • Pan-India Delivery
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Right-Side Customer Account Drawer (Opened by clicking the Top-Right Circle) */}
      {accountDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/55 backdrop-blur-xs"
            onClick={() => setAccountDrawerOpen(false)}
          />

          {/* Slide-Over Panel on the Right */}
          <div className="relative w-[88%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="p-5 bg-stone-900 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 font-serif font-bold text-base flex items-center justify-center shrink-0">
                    {isAuthHydrated && isAuthenticated && customer ? (
                      <span>{initialLetter}</span>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {isAuthHydrated && isAuthenticated && customer ? (
                      <>
                        <p className="font-serif text-lg font-semibold text-white truncate">
                          Namaste {firstName}
                        </p>
                        <p className="text-xs text-stone-300 truncate">
                          {customer.email}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-serif text-lg font-semibold text-white">
                          Welcome Guest
                        </p>
                        <p className="text-xs text-stone-300">
                          Sign in to shop &amp; track orders
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(false)}
                  aria-label="Close customer drawer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Menu Options */}
              <div className="p-4 space-y-2">
                <p className="px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                  Your Account &amp; Shopping
                </p>

                {/* Option 1: Orders & Invoices */}
                <Link
                  href={isAuthenticated ? '/account?tab=orders' : '/login?next=/account'}
                  onClick={() => setAccountDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-800 flex items-center justify-center transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-950">
                        My Orders &amp; Delivery Status
                      </p>
                      <p className="text-xs text-stone-500">
                        {isAuthenticated
                          ? `${orders.length} past ${orders.length === 1 ? 'order' : 'orders'} & tracking`
                          : 'Track dispatches & delivered dates'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                </Link>

                {/* Option 2: Tax Invoices */}
                <Link
                  href={isAuthenticated ? '/account?tab=orders' : '/login?next=/account'}
                  onClick={() => setAccountDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-800 flex items-center justify-center transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-950">
                        GST / Tax Invoices
                      </p>
                      <p className="text-xs text-stone-500">
                        View &amp; print order bills
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                </Link>

                {/* Option 3: Shopping Bag */}
                <Link
                  href="/cart"
                  onClick={() => setAccountDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 group-hover:bg-stone-900 group-hover:text-white text-amber-950 flex items-center justify-center transition-colors">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-950">
                        Shopping Bag ({isHydrated ? totalQuantity : 0})
                      </p>
                      <p className="text-xs text-stone-500">
                        {isHydrated && totalQuantity > 0
                          ? `Subtotal: ${formatPrice(subtotalAmount)} — Proceed to buy`
                          : 'View items in your bag'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                </Link>

                {/* Option 4: Stored Addresses */}
                <Link
                  href={
                    isAuthenticated
                      ? '/account?tab=addresses'
                      : '/login?next=/account?tab=addresses'
                  }
                  onClick={() => setAccountDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-800 flex items-center justify-center transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-950">
                        Saved Addresses
                      </p>
                      <p className="text-xs text-stone-500">
                        {isAuthenticated
                          ? `${addresses.length} saved delivery ${addresses.length === 1 ? 'address' : 'addresses'}`
                          : 'Add or edit delivery addresses'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                </Link>
              </div>
            </div>

            {/* Drawer Footer: Logout or Sign In */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2.5">
              {isAuthHydrated && isAuthenticated && customer ? (
                <button
                  type="button"
                  onClick={handleLogoutFromDrawer}
                  className="w-full h-11 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({firstName})</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setAccountDrawerOpen(false)}
                  className="w-full h-11 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
