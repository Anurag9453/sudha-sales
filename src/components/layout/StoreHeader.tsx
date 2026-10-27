// ============================================================================
// Header & Mobile Navigation: src/components/layout/StoreHeader.tsx
// - Top-left: Single-line animated "SUDHA SALES" logo with spinning emblem.
// - Top-right: "Namaste <FirstName>" + Circular Profile Avatar button that
//   opens a Right-Side Account Drawer with Orders, Shopping Bag, Saved
//   Addresses, and Logout.
// - No Admin button in the customer header (Admins access `/admin` directly).
// Bound to AppConstants.Storefront.HEADER, AppConstants.Shipping, and AppConstants.Account.
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

const MARQUEE_ITEMS = AppConstants.Storefront.HEADER.MARQUEE_TEMPLATES.map((tmpl, idx) =>
  idx === 1
    ? tmpl(
        publicEnv.storeName,
        formatPrice(AppConstants.Shipping.FREE_SHIPPING_THRESHOLD)
      )
    : tmpl(publicEnv.storeName, '')
);

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

  const firstName =
    customer?.name.split(AppConstants.Account.NAME_SPLIT_SEPARATOR)[0] ||
    customer?.name ||
    '';
  const initialLetter = firstName
    ? firstName.charAt(0).toUpperCase()
    : AppConstants.Storefront.HEADER.COPY.FALLBACK_INITIAL;

  const handleLogoutFromDrawer = async () => {
    await signOutCustomer();
    setAccountDrawerOpen(false);
    router.push(AppConstants.Storefront.HEADER.NAV_LINKS[0].href);
  };

  return (
    <>
      {/* Moving Marquee Ticker Bar */}
      <div className={AppConstants.Storefront.HEADER.CLASSES.MARQUEE_WRAPPER}>
        <div className={AppConstants.Storefront.HEADER.CLASSES.MARQUEE_TRACK}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span
              key={idx}
              className={
                AppConstants.Storefront.HEADER.CLASSES.MARQUEE_ITEM
              }
            >
              <Sparkles
                className={
                  AppConstants.Storefront.HEADER.CLASSES.MARQUEE_ICON
                }
              />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className={AppConstants.Storefront.HEADER.CLASSES.HEADER}>
        <div className={AppConstants.Storefront.HEADER.CLASSES.CONTAINER}>
          {/* Top-Left: Mobile Menu Button + Single-Line SUDHA SALES Logo with Spinner Emblem */}
          <div className={AppConstants.Storefront.HEADER.CLASSES.LEFT_WRAPPER}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={AppConstants.Storefront.HEADER.ARIA.OPEN_NAV}
              className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_TOGGLE}
            >
              <Menu
                className={AppConstants.Storefront.HEADER.CLASSES.TOGGLE_ICON}
              />
            </button>

            <Link
              href={AppConstants.Storefront.HEADER.NAV_LINKS[0].href}
              className={AppConstants.Storefront.HEADER.CLASSES.BRAND_LINK}
            >
              <SudhaSpinnerBadge size="sm" theme="light" />
              <span
                className={AppConstants.Storefront.HEADER.CLASSES.BRAND_TEXT}
              >
                {publicEnv.storeName}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className={AppConstants.Storefront.HEADER.CLASSES.NAV}>
            {AppConstants.Storefront.HEADER.NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href.split('?')[0]) &&
                    link.href === '/shop';

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={AppConstants.Storefront.HEADER.CLASSES.NAV_LINK(
                    isActive
                  )}
                >
                  <span>{link.label}</span>
                  {'badge' in link && link.badge && (
                    <span
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.NAV_BADGE
                      }
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Top-Right: Search, Shopping Bag, Greeting + Circular Drawer Trigger */}
          <div className={AppConstants.Storefront.HEADER.CLASSES.RIGHT_WRAPPER}>
            <Link
              href={AppConstants.Storefront.HEADER.NAV_LINKS[2].href}
              aria-label={AppConstants.Storefront.HEADER.ARIA.SEARCH_CATALOG}
              className={AppConstants.Storefront.HEADER.CLASSES.SEARCH_LINK}
            >
              <Search
                className={AppConstants.Storefront.HEADER.CLASSES.SEARCH_ICON}
              />
            </Link>

            <Link
              href={AppConstants.Storefront.HEADER.DRAWER_OPTIONS.CART_HREF}
              aria-label={AppConstants.Storefront.HEADER.ARIA.BAG}
              className={AppConstants.Storefront.HEADER.CLASSES.BAG_LINK}
            >
              <ShoppingBag
                className={AppConstants.Storefront.HEADER.CLASSES.BAG_ICON}
              />
              <span className={AppConstants.Storefront.HEADER.CLASSES.BAG_COUNT}>
                {isHydrated ? totalQuantity : 0}
              </span>
            </Link>

            {isAuthHydrated && isAuthenticated && customer ? (
              <div
                className={AppConstants.Storefront.HEADER.CLASSES.AUTH_WRAPPER}
              >
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.NAMASTE_PILL
                  }
                >
                  <span
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.ONLINE_DOT
                    }
                  />
                  <span>
                    {AppConstants.Storefront.HEADER.COPY.GREETING_PREFIX}
                    {firstName}
                  </span>
                </button>

                {/* Top-Right Circular Profile Button that opens the Right-Side Drawer */}
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  aria-label={AppConstants.Storefront.HEADER.ARIA.ACCOUNT_MENU}
                  title={`${AppConstants.Storefront.HEADER.COPY.GREETING_PREFIX}${firstName}`}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.AVATAR_BUTTON
                  }
                >
                  <span>{initialLetter}</span>
                  <span
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.STATUS_BADGE
                    }
                  />
                </button>
              </div>
            ) : (
              <div
                className={AppConstants.Storefront.HEADER.CLASSES.AUTH_WRAPPER}
              >
                <Link
                  href={AppConstants.Account.ROUTES.LOGIN}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.SIGN_IN_LINK
                  }
                >
                  <span>{AppConstants.Storefront.HEADER.COPY.SIGN_IN}</span>
                </Link>

                {/* Top-Right Circular Menu Trigger even when signed out */}
                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(true)}
                  aria-label={AppConstants.Storefront.HEADER.ARIA.MENU_DRAWER}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.GUEST_AVATAR_BUTTON
                  }
                >
                  <User
                    className={AppConstants.Storefront.HEADER.CLASSES.USER_ICON}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Left Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_MENU_ROOT}>
          <div
            className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_BACKDROP}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_PANEL}
          >
            <div>
              <div
                className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_HEADER}
              >
                <span
                  className={AppConstants.Storefront.HEADER.CLASSES.BRAND_TEXT}
                >
                  {publicEnv.storeName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={AppConstants.Storefront.HEADER.ARIA.CLOSE_NAV}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.MOBILE_CLOSE_BTN
                  }
                >
                  <X className={AppConstants.Storefront.HEADER.CLASSES.USER_ICON} />
                </button>
              </div>

              <div
                className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_LIST}
              >
                {AppConstants.Storefront.HEADER.NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.MOBILE_LINK
                    }
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {'badge' in link && link.badge && (
                        <span
                          className={
                            AppConstants.Storefront.HEADER.CLASSES.NAV_BADGE
                          }
                        >
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                      }
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div
              className={AppConstants.Storefront.HEADER.CLASSES.MOBILE_FOOTER}
            >
              {isAuthHydrated && isAuthenticated && customer ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAccountDrawerOpen(true);
                  }}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.MOBILE_ACCOUNT_BTN
                  }
                >
                  <span>
                    {AppConstants.Storefront.HEADER.COPY.GREETING_PREFIX}
                    {firstName}
                  </span>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </button>
              ) : (
                <Link
                  href={AppConstants.Account.ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.MOBILE_SIGNIN_LINK
                  }
                >
                  <span className="flex items-center gap-2">
                    <User
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.USER_ICON
                      }
                    />
                    {AppConstants.Storefront.HEADER.COPY.SIGN_IN_GOOGLE}
                  </span>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </Link>
              )}
              <p className="text-[11px] text-stone-500 text-center">
                {AppConstants.Storefront.HEADER.COPY.FOOTER_TAGLINE}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Right-Side Customer Account Drawer */}
      {accountDrawerOpen && (
        <div className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_ROOT}>
          {/* Backdrop */}
          <div
            className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_BACKDROP}
            onClick={() => setAccountDrawerOpen(false)}
          />

          {/* Slide-Over Panel on the Right */}
          <div
            className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_PANEL}
          >
            <div>
              {/* Drawer Header */}
              <div
                className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_HEADER}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.DRAWER_USER_BADGE
                    }
                  >
                    {isAuthHydrated && isAuthenticated && customer ? (
                      <span>{initialLetter}</span>
                    ) : (
                      <User
                        className={
                          AppConstants.Storefront.HEADER.CLASSES.USER_ICON
                        }
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    {isAuthHydrated && isAuthenticated && customer ? (
                      <>
                        <p
                          className={
                            AppConstants.Storefront.HEADER.CLASSES
                              .DRAWER_USER_NAME
                          }
                        >
                          {AppConstants.Storefront.HEADER.COPY.GREETING_PREFIX}
                          {firstName}
                        </p>
                        <p
                          className={
                            AppConstants.Storefront.HEADER.CLASSES
                              .DRAWER_USER_EMAIL
                          }
                        >
                          {customer.email}
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className={
                            AppConstants.Storefront.HEADER.CLASSES
                              .DRAWER_USER_NAME
                          }
                        >
                          {AppConstants.Storefront.HEADER.COPY.WELCOME_GUEST}
                        </p>
                        <p
                          className={
                            AppConstants.Storefront.HEADER.CLASSES
                              .DRAWER_USER_EMAIL
                          }
                        >
                          {AppConstants.Storefront.HEADER.COPY.GUEST_SUBTITLE}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAccountDrawerOpen(false)}
                  aria-label={AppConstants.Storefront.HEADER.ARIA.CLOSE_DRAWER}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_CLOSE_BUTTON
                  }
                >
                  <X
                    className={AppConstants.Storefront.HEADER.CLASSES.USER_ICON}
                  />
                </button>
              </div>

              {/* Drawer Menu Options */}
              <div
                className={
                  AppConstants.Storefront.HEADER.CLASSES.DRAWER_OPTIONS
                }
              >
                <p
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_LABEL
                  }
                >
                  {AppConstants.Storefront.HEADER.COPY.DRAWER_SECTION_TITLE}
                </p>

                {/* Option 1: Orders & Invoices */}
                <Link
                  href={
                    isAuthenticated
                      ? AppConstants.Storefront.HEADER.DRAWER_OPTIONS.ORDERS_HREF
                      : AppConstants.Storefront.HEADER.DRAWER_OPTIONS
                          .ORDERS_LOGIN_HREF
                  }
                  onClick={() => setAccountDrawerOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD
                  }
                >
                  <div
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_LEFT
                    }
                  >
                    <div
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.DRAWER_ICON_WRAP
                      }
                    >
                      <Package
                        className={
                          AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_ICON
                        }
                      />
                    </div>
                    <div>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_TITLE
                        }
                      >
                        {
                          AppConstants.Storefront.HEADER.COPY
                            .DRAWER_ORDERS_TITLE
                        }
                      </p>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_SUBTITLE
                        }
                      >
                        {isAuthenticated
                          ? AppConstants.Storefront.HEADER.COPY.DRAWER_ORDERS_SUBTITLE_AUTHENTICATED(
                              orders.length
                            )
                          : AppConstants.Storefront.HEADER.COPY
                              .DRAWER_ORDERS_SUBTITLE_GUEST}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </Link>

                {/* Option 2: Tax Invoices */}
                <Link
                  href={
                    isAuthenticated
                      ? AppConstants.Storefront.HEADER.DRAWER_OPTIONS.ORDERS_HREF
                      : AppConstants.Storefront.HEADER.DRAWER_OPTIONS
                          .ORDERS_LOGIN_HREF
                  }
                  onClick={() => setAccountDrawerOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD
                  }
                >
                  <div
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_LEFT
                    }
                  >
                    <div
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.DRAWER_ICON_WRAP
                      }
                    >
                      <FileText
                        className={
                          AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_ICON
                        }
                      />
                    </div>
                    <div>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_TITLE
                        }
                      >
                        {
                          AppConstants.Storefront.HEADER.COPY
                            .DRAWER_INVOICES_TITLE
                        }
                      </p>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_SUBTITLE
                        }
                      >
                        {
                          AppConstants.Storefront.HEADER.COPY
                            .DRAWER_INVOICES_SUBTITLE
                        }
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </Link>

                {/* Option 3: Shopping Bag */}
                <Link
                  href={AppConstants.Storefront.HEADER.DRAWER_OPTIONS.CART_HREF}
                  onClick={() => setAccountDrawerOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD
                  }
                >
                  <div
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_LEFT
                    }
                  >
                    <div
                      className={
                        AppConstants.Storefront.HEADER.CLASSES
                          .DRAWER_ICON_WRAP_AMBER
                      }
                    >
                      <ShoppingBag
                        className={
                          AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_ICON
                        }
                      />
                    </div>
                    <div>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_TITLE
                        }
                      >
                        {AppConstants.Storefront.HEADER.COPY.DRAWER_BAG_TITLE(
                          isHydrated ? totalQuantity : 0
                        )}
                      </p>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_SUBTITLE
                        }
                      >
                        {isHydrated && totalQuantity > 0
                          ? AppConstants.Storefront.HEADER.COPY.DRAWER_BAG_SUBTITLE_AUTHENTICATED(
                              formatPrice(subtotalAmount)
                            )
                          : AppConstants.Storefront.HEADER.COPY
                              .DRAWER_BAG_SUBTITLE_EMPTY}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </Link>

                {/* Option 4: Stored Addresses */}
                <Link
                  href={
                    isAuthenticated
                      ? AppConstants.Storefront.HEADER.DRAWER_OPTIONS
                          .ADDRESSES_HREF
                      : AppConstants.Storefront.HEADER.DRAWER_OPTIONS
                          .ADDRESSES_LOGIN_HREF
                  }
                  onClick={() => setAccountDrawerOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD
                  }
                >
                  <div
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_LEFT
                    }
                  >
                    <div
                      className={
                        AppConstants.Storefront.HEADER.CLASSES.DRAWER_ICON_WRAP
                      }
                    >
                      <MapPin
                        className={
                          AppConstants.Storefront.HEADER.CLASSES.DRAWER_CARD_ICON
                        }
                      />
                    </div>
                    <div>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_TITLE
                        }
                      >
                        {
                          AppConstants.Storefront.HEADER.COPY
                            .DRAWER_ADDRESSES_TITLE
                        }
                      </p>
                      <p
                        className={
                          AppConstants.Storefront.HEADER.CLASSES
                            .DRAWER_CARD_SUBTITLE
                        }
                      >
                        {isAuthenticated
                          ? AppConstants.Storefront.HEADER.COPY.DRAWER_ADDRESSES_SUBTITLE_AUTHENTICATED(
                              addresses.length
                            )
                          : AppConstants.Storefront.HEADER.COPY
                              .DRAWER_ADDRESSES_SUBTITLE_GUEST}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={
                      AppConstants.Storefront.HEADER.CLASSES.CHEVRON_ICON
                    }
                  />
                </Link>
              </div>
            </div>

            {/* Drawer Footer: Logout or Sign In */}
            <div
              className={AppConstants.Storefront.HEADER.CLASSES.DRAWER_FOOTER}
            >
              {isAuthHydrated && isAuthenticated && customer ? (
                <button
                  type="button"
                  onClick={handleLogoutFromDrawer}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.LOGOUT_BUTTON
                  }
                >
                  <LogOut
                    className={AppConstants.Storefront.HEADER.CLASSES.USER_ICON}
                  />
                  <span>
                    {AppConstants.Storefront.HEADER.COPY.LOGOUT(firstName)}
                  </span>
                </button>
              ) : (
                <Link
                  href={AppConstants.Account.ROUTES.LOGIN}
                  onClick={() => setAccountDrawerOpen(false)}
                  className={
                    AppConstants.Storefront.HEADER.CLASSES.SIGN_IN_BUTTON
                  }
                >
                  <User
                    className={AppConstants.Storefront.HEADER.CLASSES.USER_ICON}
                  />
                  <span>
                    {AppConstants.Storefront.HEADER.COPY.SIGN_IN_GOOGLE}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
