// ============================================================================
// Central Application Constants Class: src/constants/app.constants.ts
// Single source of truth for all business rules, thresholds, brand metadata,
// shipping carriers, payment providers, and default values across Sudha Sales.
// ============================================================================

import { AccountConstants } from './pages/account.constants';
import { AdminConstants } from './pages/admin.constants';
import { ApiConstants } from './pages/api.constants';
import { CartConstants } from './pages/cart.constants';
import { LoginConstants } from './pages/login.constants';
import { ProductConstants } from './pages/product.constants';
import { ServicesConstants } from './pages/services.constants';
import { StorefrontConstants } from './pages/storefront.constants';

const STORE_NAME = 'Sudha Sales';
const WELCOME_TITLE_PREFIX = 'Welcome to';

export class AppConstants {
  /** Page / module scoped constant groups (see src/constants/pages) */
  public static readonly Account = AccountConstants;
  public static readonly Admin = AdminConstants;
  public static readonly Api = ApiConstants;
  public static readonly Cart = CartConstants;
  public static readonly Login = LoginConstants;
  public static readonly Product = ProductConstants;
  public static readonly Services = ServicesConstants;
  public static readonly Storefront = StorefrontConstants;

  /**
   * Brand & Storefront Metadata
   */
  public static readonly Store = {
    NAME: STORE_NAME,
    TAGLINE: 'Heritage Handcrafts & Festive Ethnic Ensembles',
    LEGAL_NAME: 'Sudha Sales Retail Private Limited',
    DEFAULT_CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
    DEFAULT_COUNTRY: 'IN',
    SUPPORT_PHONE: '+91 94530 00000',
    SUPPORT_EMAIL: 'support@sudhasales.com',
  } as const;

  /**
   * Welcome Splash Screen: behavior, copy, accessibility attributes & styling.
   * Page-scoped constants for src/components/layout/WelcomeSplashScreen.tsx
   */
  public static readonly WelcomeSplash = {
    // Session storage behavior
    SESSION_KEY: 'sudha_sales_welcome_splash_seen_v1',
    SESSION_SEEN_VALUE: '1',

    // Timing (milliseconds)
    FADE_OUT_DELAY_MS: 1800,
    REMOVE_DELAY_MS: 2450,
    DISMISS_EARLY_DELAY_MS: 450,

    // Copy
    TITLE_PREFIX: WELCOME_TITLE_PREFIX,
    SUBTITLE: 'Handpicked Bandhej, Sarees & Festive Collections',

    // Accessibility
    ARIA_ROLE: 'dialog',
    ARIA_LABEL: `${WELCOME_TITLE_PREFIX} ${STORE_NAME}`,
    ARIA_HIDDEN: true,

    // Logo badge props
    BADGE_SIZE: 'lg',
    BADGE_THEME: 'dark',

    // Class names
    CLASSES: {
      ROOT_BASE:
        'fixed inset-0 z-[100] bg-stone-950 text-white flex flex-col items-center justify-center px-6 select-none cursor-pointer transition-all duration-700 ease-out',
      ROOT_VISIBLE: 'opacity-100 scale-100',
      ROOT_FADING: 'opacity-0 scale-105 pointer-events-none',
      GLOW:
        'absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none',
      CONTENT:
        'relative z-10 flex flex-col items-center text-center max-w-md space-y-6',
      BRAND_WRAPPER: 'flex flex-col items-center gap-4',
      LOGO_RING:
        'p-4 rounded-full bg-white/5 border border-amber-300/25 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
      BRAND_MARK:
        'font-serif text-xl sm:text-2xl tracking-[0.22em] font-bold animate-sudha-brand whitespace-nowrap',
      DIVIDER: 'flex items-center gap-3 text-amber-300/80',
      DIVIDER_LINE_LEFT:
        'w-10 sm:w-14 h-px bg-gradient-to-r from-transparent to-amber-300/70',
      DIVIDER_LINE_RIGHT:
        'w-10 sm:w-14 h-px bg-gradient-to-l from-transparent to-amber-300/70',
      DIVIDER_ICON: 'w-4 h-4 animate-pulse',
      MESSAGE_WRAPPER: 'space-y-2',
      TITLE:
        'font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-white',
      SUBTITLE: 'text-xs sm:text-sm text-stone-300 tracking-wider uppercase',
      PROGRESS_TRACK: 'w-40 h-1 rounded-full bg-stone-800 overflow-hidden mt-2',
      PROGRESS_BAR:
        'h-full w-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 animate-pulse origin-left',
    },
  } as const;

  /**
   * Shipping, Logistics & Delivery Rules
   */
  public static readonly Shipping = {
    FREE_SHIPPING_THRESHOLD: 1499,
    STANDARD_FEE: 99,
    DEFAULT_CARRIER: 'Delhivery Express',
    DISPATCH_TIMELINE: '24–48hr Dispatch',
    EXCHANGE_POLICY: '7-Day Size Exchange',
    QUALITY_ASSURANCE: 'Quality Checked',
    DEFAULT_NOTES_ONLINE: 'Order confirmed via Razorpay — preparing warehouse dispatch',
    DEFAULT_NOTES_COD: 'Cash on Delivery order confirmed — awaiting warehouse dispatch',
  } as const;

  /**
   * Inventory, Stock Display & Quantity Limits
   */
  public static readonly Inventory = {
    /** When stock is below this number, the product page and bag warn the user */
    LOW_STOCK_THRESHOLD: 10,
    /** Critical stock threshold for urgent warning highlights */
    CRITICAL_STOCK_THRESHOLD: 5,
    /** Maximum quantity a customer can select in a single order line */
    MAX_LINE_QUANTITY: 10,
    /** Maximum allowed warehouse stock per SKU in catalog validation */
    MAX_STOCK_LIMIT: 100000,
    /** Default page size for catalog pagination and infinite scroll batches */
    DEFAULT_PAGE_SIZE: 8,
    /** Maximum allowed page size query limit */
    MAX_PAGE_SIZE: 100,
    /** Distance in pixels before bottom to trigger auto-fetch next batch */
    SCROLL_TRIGGER_MARGIN: '350px',
  } as const;

  /**
   * Payment Provider Identifiers & Labels
   */
  public static readonly Payments = {
    METHOD_RAZORPAY: 'razorpay',
    METHOD_COD: 'cod',
    PROVIDER_LABEL_RAZORPAY: 'Razorpay (UPI / Card / NetBanking)',
    PROVIDER_LABEL_COD: 'Cash on Delivery (Pay at Doorstep)',
  } as const;

  /**
   * Image Names & Storage Assets
   */
  public static readonly Assets = {
    FRONT_IMAGE: 'front.jpg',
    MODEL_IMAGE: 'model.jpg',
    BACK_IMAGE: 'back.jpg',
    FALLBACK_PRODUCT_IMAGE: '/products/sku-001-navy-blue.jpg',
    FALLBACK_CATEGORY_IMAGE: '/products/sku-002-royal-plum.jpg',
  } as const;

  /**
   * Order Statuses
   */
  public static readonly OrderStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
  } as const;

  /**
   * Payment Statuses
   */
  public static readonly PaymentStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    COD: 'COD',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  } as const;

  /**
   * Product Catalog Statuses
   */
  public static readonly ProductStatus = {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT',
    ARCHIVED: 'ARCHIVED',
  } as const;

  /**
   * Standard Apparel Sizes
   */
  public static readonly Sizes = {
    XS: 'XS',
    S: 'S',
    M: 'M',
    L: 'L',
    XL: 'XL',
    XXL: 'XXL',
    FREE_SIZE: 'FREE SIZE',
    STANDARD_LIST: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const,
  } as const;
}
