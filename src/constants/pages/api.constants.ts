// ============================================================================
// Page/Domain-Scoped Constants: src/constants/pages/api.constants.ts
// Centralized constants for all API endpoints, schemas, validation and headers.
// ============================================================================

export const ApiConstants = {
  ROUTES: {
    SYNC: '/api/admin/sync',
    CART_VALIDATE: '/api/cart/validate',
    ORDERS_COD: '/api/orders/cod',
    PAYMENTS_CREATE_ORDER: '/api/payments/razorpay/create-order',
    PAYMENTS_VERIFY: '/api/payments/razorpay/verify',
    PRODUCTS: '/api/products',
    REVIEWS: '/api/reviews',
  },

  HEADERS: {
    CACHE_CONTROL: 'Cache-Control',
    CACHE_CONTROL_PRODUCTS: 'public, s-maxage=30, stale-while-revalidate=60',
    AUTHORIZATION: 'authorization',
    BEARER_PREFIX: 'Bearer ',
  },

  DEFAULTS: {
    SYNC_WEBHOOK_SECRET: 'sudha-sync-secret',
    COD_REFERENCE_PREFIX: 'COD-',
    RECEIPT_PREFIX: 'rcpt_',
  },

  MESSAGES: {
    UNAUTHORIZED_SYNC: 'Unauthorized sync request',
    UNEXPECTED_SYNC_FAILURE: 'Unexpected synchronization failure',
    CART_VALIDATE_FAILED: 'Failed to validate cart stock',
    MISSING_COD_DETAILS: 'Missing customer details or cart items for COD order',
    COD_CREATE_FAILED: 'Failed to create Cash on Delivery order',
    INVALID_ORDER_AMOUNT: 'Invalid order amount',
    ITEMS_EXCEED_STOCK_GENERIC:
      'One or more items in your cart exceed available stock. Please adjust quantities.',
    CREATE_RAZORPAY_ORDER_FAILED: 'Failed to create Razorpay order',
    MISSING_RAZORPAY_PARAMS: 'Missing Razorpay payment verification parameters',
    SIGNATURE_VERIFICATION_FAILED:
      'Razorpay payment signature verification failed',
    VERIFY_PAYMENT_FAILED: 'Failed to verify payment & create order',
    FETCH_PRODUCTS_FAILED: 'Failed to fetch paginated products',
    SUBMIT_REVIEW_FAILED: 'Failed to submit product review',
  },

  SCHEMA_ERRORS: {
    SKU_MIN: 'SKU must be at least 3 characters (e.g. SKU001)',
    SKU_MAX: 'SKU cannot exceed 64 characters',
    SKU_REGEX:
      'SKU may only contain uppercase letters, numbers, hyphens, or underscores',
    IMG_URL_INVALID: 'Must be a valid image URL',
    NAME_MIN: 'Product name must be at least 3 characters',
    NAME_MAX: 'Product name cannot exceed 255 characters',
    CATEGORY_REQUIRED: 'Please select a category',
    PRICE_POSITIVE: 'Regular price must be greater than 0',
    PRICE_TOO_HIGH: 'Price is too high',
    STOCK_INTEGER: 'Stock must be a whole number',
    STOCK_NEGATIVE: 'Stock cannot be negative',
    SIZES_REQUIRED: 'Select or enter at least one size (e.g. S, M, L, XL)',
    COLOR_REQUIRED: 'Color is required',
    IMG_REQUIRED: 'At least one product image is required',
    SALE_PRICE_INVALID: 'Sale price must be less than or equal to regular price',
  },
} as const;
