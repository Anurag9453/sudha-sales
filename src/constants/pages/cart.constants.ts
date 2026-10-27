// Page-scoped constants for: Cart (consumed via AppConstants.Cart)
export const CartConstants = {
  CHECKOUT_STEPS: {
    CART: 'cart',
    ADDRESS: 'address',
    CONFIRMED: 'confirmed',
  },

  PAYMENT_METHODS: {
    RAZORPAY: 'razorpay',
    COD: 'cod',
  },

  RAZORPAY_MODES: {
    LIVE: 'live-razorpay',
  },

  ADDRESS_LABELS: {
    HOME: 'Home',
  },

  ROUTES: {
    ACCOUNT: '/account',
    SHOP: '/shop',
    SHOP_NEW_COLLECTION: '/shop?collection=new-collection',
    LOGIN_FOR_PURCHASE: '/login?next=/cart&reason=purchase',
    PRODUCT: (sku: string) => `/product/${sku}`,
  },

  API: {
    CART_VALIDATE: '/api/cart/validate',
    ORDERS_COD: '/api/orders/cod',
    RAZORPAY_CREATE_ORDER: '/api/payments/razorpay/create-order',
    RAZORPAY_VERIFY: '/api/payments/razorpay/verify',
    RAZORPAY_CHECKOUT_SCRIPT: 'https://checkout.razorpay.com/v1/checkout.js',
    METHOD_POST: 'POST',
    HEADERS_JSON: { 'Content-Type': 'application/json' },
  },

  RAZORPAY: {
    THEME_COLOR: '#1c1917',
    DESCRIPTION: (totalQuantity: number) => `Order Payment (${totalQuantity} items)`,
    SIM_PAYMENT_ID_PREFIX: 'pay_sim_',
    SIM_SIGNATURE_PREFIX: 'sim_sig_',
    DEFAULT_COD_REFERENCE: 'COD',
  },

  TIMINGS: {
    SIMULATED_PAYMENT_DELAY_MS: 600,
  },

  SCRIPT_TAG: 'script',

  ERRORS: {
    OVER_STOCK: (name: string, size: string, maxStock: number) =>
      `Cannot proceed: "${name}" in Size ${size} only has ${maxStock} available in stock. Please reduce your requested quantity to ${maxStock} to continue.`,
    CART_EXCEEDS_STOCK:
      'One or more items in your cart exceed available stock. Please reduce quantity to proceed.',
    COD_FAILED: 'Failed to place Cash on Delivery order',
    RAZORPAY_INIT_FAILED: 'Could not initialize Razorpay checkout',
    PAYMENT_VERIFY_FAILED: 'Payment verification failed',
    RAZORPAY_SDK_LOAD_FAILED: 'Failed to load Razorpay Checkout SDK',
    VERIFICATION_FAILED: 'Verification failed',
    PAYMENT_INIT_FAILED: 'Payment initialization failed',
  },

  COPY: {
    LOADING_TITLE: 'Loading Your Shopping Bag...',
    LOADING_SUBTITLE: 'Checking your items & account session',
    PROCESSING_TITLE: 'Processing Razorpay Payment...',
    PROCESSING_SUBTITLE:
      'Verifying payment signature, deducting warehouse stock & saving order',

    CONFIRMED_TITLE: 'Order Confirmed!',
    CONFIRMED_THANK_YOU_PREFIX: 'Thank you, ',
    CONFIRMED_THANK_YOU_SUFFIX: '! Your ',
    CONFIRMED_COD_LABEL: 'Cash on Delivery (COD)',
    CONFIRMED_COD_ORDER_REF_OPEN: ' order (Ref: ',
    CONFIRMED_RAZORPAY_PAYMENT_OPEN: 'Razorpay payment (',
    CONFIRMED_REF_CLOSE: ')',
    CONFIRMED_IS_CONFIRMED_AND_ORDER: ' is confirmed and order ',
    CONFIRMED_SAVED_TO_HISTORY: ' has been saved to your account order history.',
    VIEW_ORDER_STATUS: 'View Order Status & Invoice',
    CONTINUE_SHOPPING: 'Continue Shopping',

    EMPTY_TITLE: 'Your Shopping Bag is Empty',
    EMPTY_DESCRIPTION:
      'Explore our New Collection daily drops to add Kurtis, Co-ord Sets, and Festive Suit Sets to your bag.',
    EXPLORE_NEW_COLLECTION: 'Explore New Collection',

    HEADING_CART: 'Shopping Bag',
    HEADING_ADDRESS: 'Select Delivery Address',
    ITEM_SINGULAR: 'item',
    ITEM_PLURAL: 'items',
    IN_YOUR_BAG: 'in your bag',

    SIZE_LABEL: (size: string) => `Size: ${size}`,
    COLOR_LABEL: (color: string) => `• ${color}`,
    LOW_STOCK: (maxStock: number, size: string) =>
      `Only ${maxStock} left in stock for Size ${size}`,
    OVER_STOCK_ITEM: (maxStock: number, size: string) =>
      `Only ${maxStock} available in Size ${size}. Please reduce quantity to ${maxStock} to proceed.`,

    CHOOSE_ADDRESS: 'Choose a Stored Delivery Address',
    ADD_NEW_ADDRESS: '+ Add New Address',
    NEW_ADDRESS_TITLE: 'New Delivery Address',
    CANCEL: 'Cancel',
    SAVE_AND_SELECT: 'Save & Select',
    EDIT_IN_ACCOUNT: 'Edit in My Account →',
    ADDRESS_NAME_PHONE: (fullName: string, phone: string) => `${fullName} • ${phone}`,
    ADDRESS_LINE2_PREFIX: ', ',
    ADDRESS_LINE_SEPARATOR: ', ',
    ADDRESS_POSTAL_SEPARATOR: ' - ',

    ORDER_SUMMARY: 'Order Summary',
    SIGN_IN_REQUIRED: 'Sign in with Google is required before completing your order.',
    FREE_SHIPPING_ADD: 'Add ',
    FREE_SHIPPING_MORE_TO_UNLOCK: ' more to unlock ',
    FREE_SHIPPING_HIGHLIGHT: 'FREE Express Shipping',
    FREE_SHIPPING_END: '!',
    BAG_SUBTOTAL: (totalQuantity: number) => `Bag Subtotal (${totalQuantity} items)`,
    DISCOUNT_SAVINGS: 'Collection Discount Savings',
    DISCOUNT_PREFIX: '-',
    SHIPPING: 'Shipping',
    SHIPPING_FREE: 'FREE',
    TOTAL_PAYABLE: 'Total Payable',
    STOCK_LIMIT_TITLE: 'Stock limit exceeded',
    STOCK_LIMIT_DESCRIPTION:
      'One or more items in your bag exceed available warehouse stock. Please reduce the quantity using the minus (-) button to proceed.',

    CTA_REDUCE_QUANTITIES: 'Reduce Quantities to Proceed',
    CTA_PROCEED_TO_ADDRESS: 'Proceed to Delivery Address',
    CTA_SIGN_IN_TO_CHECKOUT: 'Sign In with Google to Checkout',

    CHOOSE_PAYMENT_METHOD: 'Choose Payment Method',
    PAY_ONLINE: 'Pay Online (UPI / Card / NetBanking)',
    PAY_ONLINE_BADGE: 'Fastest Dispatch',
    PAY_ONLINE_NOTE: 'Secured by Razorpay • Instant order & GST invoice',
    PAY_COD: 'Cash on Delivery (COD)',
    PAY_COD_BADGE: 'Pay at Doorstep',
    PAY_COD_NOTE: 'Pay in cash or UPI to the courier partner upon delivery',
    PLACE_COD_ORDER: (formattedTotal: string) => `Place COD Order (${formattedTotal})`,
    PAY_ONLINE_RAZORPAY: (formattedTotal: string) =>
      `Pay Online via Razorpay (${formattedTotal})`,

    SECURE_CHECKOUT: '100% Secure Checkout • Easy 7-Day Size Exchange',
  },

  FORM: {
    INPUT_TEXT: 'text',
    INPUT_TEL: 'tel',
    INPUT_RADIO: 'radio',
    BUTTON_TYPE: 'button',
    SUBMIT_TYPE: 'submit',
    PAYMENT_METHOD_NAME: 'paymentMethod',
    POSTAL_CODE_PATTERN: '[0-9]{6}',
    PLACEHOLDER_FULL_NAME: 'Full Name *',
    PLACEHOLDER_PHONE: 'WhatsApp Phone *',
    PLACEHOLDER_ADDRESS_LINE1: 'House / Flat / Street / Landmark *',
    PLACEHOLDER_CITY: 'City *',
    PLACEHOLDER_STATE: 'State *',
    PLACEHOLDER_POSTAL_CODE: 'PIN Code *',
  },

  ARIA: {
    REMOVE_ITEM: (name: string) => `Remove ${name}`,
    DECREASE_QUANTITY: 'Decrease quantity',
    INCREASE_QUANTITY: 'Increase quantity',
  },

  IMAGE: {
    SIZES: '112px',
  },

  CLASSES: {
    CONFIRMED_WRAPPER: 'max-w-xl mx-auto px-4 py-16 text-center space-y-5',
    CONFIRMED_ICON_WRAPPER:
      'w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto',
    CONFIRMED_ICON: 'w-8 h-8',
    CONFIRMED_TITLE: 'font-serif text-3xl font-semibold text-stone-950',
    CONFIRMED_TEXT: 'text-sm text-stone-600 leading-relaxed',
    REF_MONO: 'font-mono text-xs text-stone-800',
    ORDER_REF_MONO: 'font-mono font-semibold text-stone-900',
    CONFIRMED_ACTIONS: 'pt-2 flex flex-wrap items-center justify-center gap-3',
    CONFIRMED_PRIMARY_LINK:
      'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800',
    CONFIRMED_SECONDARY_LINK:
      'inline-flex items-center gap-2 px-6 py-3 rounded-full border border-stone-300 bg-white text-stone-800 text-sm font-semibold hover:bg-stone-100',
    ICON_SM: 'w-4 h-4',

    EMPTY_WRAPPER: 'max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-5',
    EMPTY_ICON_WRAPPER:
      'w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto',
    EMPTY_ICON: 'w-7 h-7',
    EMPTY_TITLE: 'font-serif text-3xl font-semibold text-stone-950',
    EMPTY_DESCRIPTION: 'text-sm text-stone-600 max-w-md mx-auto leading-relaxed',
    EMPTY_CTA_WRAPPER: 'pt-2',
    EMPTY_CTA_LINK:
      'inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors',

    PAGE_WRAPPER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
    HEADER: 'flex items-center justify-between border-b border-stone-200 pb-5 mb-8',
    HEADER_TITLE: 'font-serif text-2xl sm:text-4xl font-semibold text-stone-950',
    HEADER_SUBTITLE: 'text-xs sm:text-sm text-stone-500 mt-1',
    HEADER_BACK_LINK:
      'inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950',
    GRID: 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12',
    LEFT_COLUMN: 'lg:col-span-7 space-y-4',

    ITEM_CARD:
      'flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs',
    ITEM_IMAGE_LINK:
      'relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shrink-0',
    ITEM_IMAGE: 'object-cover object-top',
    ITEM_BODY: 'flex-1 flex flex-col justify-between',
    ITEM_TOP_ROW: 'flex items-start justify-between gap-2',
    ITEM_SKU: 'font-mono text-[10px] text-stone-400',
    ITEM_NAME_LINK:
      'block text-sm sm:text-base font-semibold text-stone-900 hover:text-stone-700 line-clamp-2',
    ITEM_REMOVE_BUTTON: 'p-1.5 text-stone-400 hover:text-rose-600 transition-colors',
    ITEM_META_ROW: 'mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-600',
    ITEM_SIZE_BADGE: 'px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800',
    ITEM_LOW_STOCK:
      'mt-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 inline-block',
    ITEM_OVER_STOCK:
      'mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5',
    ITEM_OVER_STOCK_ICON: 'w-3.5 h-3.5 shrink-0 text-rose-600',
    ITEM_BOTTOM_ROW: 'pt-3 flex items-center justify-between gap-2',
    QTY_WRAPPER: 'inline-flex items-center rounded-lg border border-stone-300 bg-stone-50',
    QTY_DECREASE:
      'w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 rounded-l-lg',
    QTY_INCREASE:
      'w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 rounded-r-lg disabled:opacity-40',
    QTY_ICON: 'w-3.5 h-3.5',
    QTY_VALUE: 'w-8 text-center text-xs font-semibold tabular-nums',
    LINE_TOTAL_WRAPPER: 'text-right',
    LINE_TOTAL: 'text-sm sm:text-base font-bold text-stone-950',
    LINE_TOTAL_ORIGINAL: 'block text-[11px] text-stone-400 line-through',

    ADDRESS_SECTION: 'space-y-4',
    ADDRESS_HEADER_ROW: 'flex items-center justify-between',
    ADDRESS_HEADING:
      'text-sm font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2',
    ADDRESS_HEADING_ICON: 'w-4 h-4 text-amber-800',
    ADD_ADDRESS_BUTTON: 'text-xs font-semibold text-stone-900 hover:underline cursor-pointer',
    NEW_ADDRESS_FORM: 'p-5 rounded-2xl bg-white border-2 border-stone-900 space-y-3',
    NEW_ADDRESS_TITLE: 'text-xs font-bold uppercase tracking-wider text-stone-900',
    FORM_GRID_2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    FORM_GRID_3: 'grid grid-cols-3 gap-3',
    FORM_INPUT: 'px-3.5 py-2 rounded-xl border border-stone-300 text-sm',
    FORM_INPUT_FULL: 'w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm',
    FORM_ACTIONS: 'flex justify-end gap-2',
    FORM_CANCEL_BUTTON:
      'px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold',
    FORM_SUBMIT_BUTTON: 'px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold',
    ADDRESS_LIST: 'space-y-3',
    ADDRESS_CARD_BASE: 'block p-4 rounded-2xl border cursor-pointer transition-all',
    ADDRESS_CARD_SELECTED: 'bg-amber-50/50 border-stone-900 ring-2 ring-stone-900/10',
    ADDRESS_CARD_UNSELECTED: 'bg-white border-stone-200 hover:border-stone-400',
    ADDRESS_CARD_TOP_ROW: 'flex items-center justify-between',
    ADDRESS_LABEL_BADGE:
      'text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-900 text-white',
    ADDRESS_EDIT_LINK: 'text-xs font-semibold text-stone-600 hover:text-stone-950',
    ADDRESS_NAME: 'text-sm font-bold text-stone-950 mt-2',
    ADDRESS_LINES: 'text-xs text-stone-600 mt-0.5',

    SUMMARY_COLUMN: 'lg:col-span-5',
    SUMMARY_CARD:
      'rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-5 sticky top-24',
    SUMMARY_TITLE: 'font-serif text-xl font-semibold text-stone-950',
    SIGN_IN_NOTICE:
      'p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5',
    SIGN_IN_ICON: 'w-4 h-4 text-amber-800 shrink-0',
    FREE_SHIPPING_NOTICE:
      'p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-800',
    SUMMARY_ROWS: 'space-y-3 text-sm border-b border-stone-200 pb-4',
    SUMMARY_ROW: 'flex justify-between text-stone-600',
    SUMMARY_ROW_DISCOUNT: 'flex justify-between text-emerald-700',
    SUMMARY_VALUE: 'font-semibold text-stone-900',
    SUMMARY_DISCOUNT_VALUE: 'font-semibold',
    TOTAL_ROW: 'flex items-baseline justify-between',
    TOTAL_LABEL: 'text-base font-semibold text-stone-900',
    TOTAL_VALUE: 'text-2xl font-bold text-stone-950',
    PAYMENT_ERROR:
      'p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2',
    PAYMENT_ERROR_ICON: 'w-4 h-4 shrink-0',
    STOCK_LIMIT_BOX:
      'p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5',
    STOCK_LIMIT_ICON: 'w-4 h-4 shrink-0 text-rose-600 mt-0.5',
    STOCK_LIMIT_TITLE: 'font-bold',
    STOCK_LIMIT_TEXT: 'text-[11px] text-rose-700 mt-0.5',

    PROCEED_BUTTON:
      'w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed',
    PAYMENT_SECTION: 'space-y-4',
    PAYMENT_OPTIONS: 'space-y-2',
    PAYMENT_OPTIONS_TITLE: 'text-xs font-semibold uppercase tracking-wider text-stone-500',
    PAYMENT_OPTION_BASE:
      'flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all',
    PAYMENT_OPTION_SELECTED: 'bg-amber-50/60 border-stone-900 ring-1 ring-stone-900/10',
    PAYMENT_OPTION_UNSELECTED: 'bg-white border-stone-200 hover:border-stone-400',
    PAYMENT_RADIO: 'mt-1',
    PAYMENT_OPTION_BODY: 'flex-1',
    PAYMENT_OPTION_ROW: 'flex items-center justify-between',
    PAYMENT_OPTION_LABEL:
      'text-xs sm:text-sm font-bold text-stone-950 flex items-center gap-1.5',
    PAYMENT_ONLINE_ICON: 'w-4 h-4 text-amber-800',
    PAYMENT_ONLINE_BADGE:
      'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800',
    PAYMENT_COD_ICON: 'w-4 h-4 text-emerald-700',
    PAYMENT_COD_BADGE:
      'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700',
    PAYMENT_OPTION_NOTE: 'text-[11px] text-stone-500 mt-0.5',
    PLACE_ORDER_BUTTON:
      'w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer',
    PLACE_COD_ICON: 'w-4 h-4 text-emerald-300',
    PLACE_ONLINE_ICON: 'w-4 h-4 text-amber-300',
    SECURE_ROW: 'pt-2 flex items-center justify-center gap-2 text-xs text-stone-500',
    SECURE_ICON: 'w-4 h-4 text-stone-700',
  },
} as const;
