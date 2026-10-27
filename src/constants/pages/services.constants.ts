// ============================================================================
// Page/Domain-Scoped Constants: src/constants/pages/services.constants.ts
// Centralized constants for all backend services, database tables, and integrations.
// ============================================================================

export const ServicesConstants = {
  TABLES: {
    PRODUCTS: 'products',
    PRODUCT_IMAGES: 'product_images',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    PRODUCT_REVIEWS: 'product_reviews',
  },

  AUTH: {
    SESSION_COOKIE: 'vastra_admin_session',
    SESSION_PREFIX: 'authenticated:',
    MAX_AGE_SECONDS: 60 * 60 * 24 * 7, // 7 days
    COOKIE_PATH: '/',
    COOKIE_SAME_SITE: 'lax' as const,
  },

  STORAGE: {
    DEFAULT_REGION: 'ap-south-1',
    PLACEHOLDER_CDN_SUBSTRING: 'd111111abcdef8.cloudfront.net',
    DEFAULT_BUCKET_FALLBACK_URL: (region: string, key: string) =>
      `https://s3.${region}.amazonaws.com/sudha-sales/${key}`,
    DEFAULT_S3_HOST_URL: (bucket: string, region: string, key: string) =>
      `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    DRIVE_CDN_HOST: 'https://lh3.googleusercontent.com/d',
    DRIVE_DIRECT_URL: (fileId: string, width = 1200) =>
      `https://lh3.googleusercontent.com/d/${fileId}=w${width}`,
    DEFAULT_PREVIEW_WIDTH: 1200,
  },

  ORDER: {
    FALLBACK_CUSTOMER_ID: 'cust-local-1',
    ORDER_NUMBER_PREFIX: 'ORD-',
    TRACKING_NUMBER_PREFIX: 'SUDHA',
    TRACKING_NUMBER_SUFFIX: 'IN',
    ERROR_NO_LONGER_AVAILABLE: (name: string, sku: string) =>
      `Product "${name}" (${sku}) is no longer available.`,
    ERROR_OUT_OF_STOCK: (name: string, size: string) =>
      `"${name}" in Size ${size} is currently out of stock. Please remove it from your bag to proceed.`,
    ERROR_PARTIAL_STOCK: (
      available: number,
      size: string,
      name: string,
      requested: number
    ) =>
      `Only ${available} piece(s) available in Size ${size} for "${name}". Please reduce quantity from ${requested} to ${available} to proceed.`,
    ERROR_PRIMARY_GENERIC:
      'One or more items in your bag exceed available stock.',
    ERROR_CUSTOMER_CREATE_FAILED:
      'Failed to create customer record in Supabase',
    ERROR_ORDER_INSERT_FAILED: 'Failed to insert order in Supabase',
    ERROR_ORDER_NOT_FOUND: (orderNumber: string) =>
      `Order ${orderNumber} not found`,
    ERROR_ORDER_UPDATE_FAILED: 'Failed to update order status',
  },

  CATALOG: {
    DEFAULT_SORT: 'newest',
    SORT_PRICE_ASC: 'price-asc',
    SORT_PRICE_DESC: 'price-desc',
    DEFAULT_COLLECTION_SLUG: 'new-collection',
    ALL_FILTER_VALUE: 'all',
    STATUS_ACTIVE: 'ACTIVE' as const,
  },

  REVIEWS: {
    REVIEWS_KEY: '__reviews',
    ERROR_SKU_REQUIRED: 'Product SKU is required',
    ERROR_NAME_REQUIRED: 'Please enter your name',
    ERROR_COMMENT_REQUIRED: 'Please write a short review comment',
    ERROR_PRODUCT_NOT_FOUND: (sku: string) => `Product ${sku} not found`,
  },

  GDRIVE_SYNC: {
    MODE_LIVE: 'live-google-drive' as const,
    MODE_SIMULATION: 'sample-drive-simulation' as const,
    VENDOR_CODE: 'GDRIVE-SYNC',
    DEFAULT_MIME_TYPE: 'image/jpeg',
    ERROR_UPSERT_SKU: 'Failed to upsert SKU',
    ERROR_CREATE_CATEGORY: (name: string, err: string) =>
      `Failed to auto-create category "${name}": ${err}`,
    ERROR_CREATE_COLLECTION: (name: string, err: string) =>
      `Failed to auto-create collection "${name}": ${err}`,
  },

  RAZORPAY: {
    CURRENCY_INR: 'INR' as const,
    MODE_LIVE: 'live-razorpay' as const,
    MODE_SIMULATED: 'simulated-razorpay' as const,
    TEST_ORDER_PREFIX: 'order_sim_',
    SIMULATED_KEY_ID: 'rzp_test_simulated',
    SIMULATED_SIG_PREFIX: 'sim_sig_',
    API_ORDERS_URL: 'https://api.razorpay.com/v1/orders',
    CONTENT_TYPE_JSON: 'application/json',
  },
} as const;
