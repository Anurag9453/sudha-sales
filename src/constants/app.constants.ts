// ============================================================================
// Central Application Constants Class: src/constants/app.constants.ts
// Single source of truth for all business rules, thresholds, brand metadata,
// shipping carriers, payment providers, and default values across Sudha Sales.
// ============================================================================

export class AppConstants {
  /**
   * Brand & Storefront Metadata
   */
  public static readonly Store = {
    NAME: 'Sudha Sales',
    TAGLINE: 'Heritage Handcrafts & Festive Ethnic Ensembles',
    LEGAL_NAME: 'Sudha Sales Retail Private Limited',
    DEFAULT_CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
    DEFAULT_COUNTRY: 'IN',
    SUPPORT_PHONE: '+91 94530 00000',
    SUPPORT_EMAIL: 'support@sudhasales.com',
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
    FALLBACK_PRODUCT_IMAGE:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    FALLBACK_CATEGORY_IMAGE:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
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
