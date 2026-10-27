// Page-scoped constants for: Account (consumed via AppConstants.Account)
// Covers src/app/(storefront)/account/page.tsx and src/store/customer-auth-context.tsx
import type { CustomerStoredAddress, Order } from '@/types/domain';

const DEMO_PHONE = '+91 98765 43210';
const DEMO_NAME = 'Ananya Sharma';
const DEMO_CUSTOMER_ID = 'cust-google-1';
const DEMO_COUNTRY = 'IN';
const DEMO_CARRIER = 'Delhivery Express';

const INITIAL_DEMO_ADDRESSES: CustomerStoredAddress[] = [
  {
    id: 'addr-default-1',
    label: 'Home',
    full_name: DEMO_NAME,
    phone: DEMO_PHONE,
    address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
    address_line2: 'Near Central Park Gate 2',
    city: 'Jaipur',
    state: 'Rajasthan',
    postal_code: '302001',
    is_default: true,
  },
  {
    id: 'addr-work-2',
    label: 'Work',
    full_name: DEMO_NAME,
    phone: DEMO_PHONE,
    address_line1: '3rd Floor, Horizon Tower, Malviya Nagar',
    address_line2: 'JLN Marg',
    city: 'Jaipur',
    state: 'Rajasthan',
    postal_code: '302017',
    is_default: false,
  },
];

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-hist-101',
    order_number: 'ORD-20261014-8821',
    customer_id: DEMO_CUSTOMER_ID,
    status: 'DELIVERED',
    payment_status: 'PAID',
    payment_provider: 'UPI / Google Pay',
    payment_reference: 'UTR62910482910',
    subtotal_amount: 2999,
    discount_amount: 500,
    shipping_amount: 0,
    total_amount: 2999,
    shipping_address: {
      full_name: DEMO_NAME,
      phone: DEMO_PHONE,
      address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
      address_line2: 'Near Central Park Gate 2',
      city: 'Jaipur',
      state: 'Rajasthan',
      postal_code: '302001',
      country: DEMO_COUNTRY,
    },
    tracking_number: 'DLVRY9928174IN',
    shipping_carrier: 'Delhivery Express',
    notes: 'Delivered to security desk',
    created_at: '2026-10-14T11:20:00Z',
    updated_at: '2026-10-17T16:45:00Z',
    delivered_at: '2026-10-17T16:45:00Z',
    items: [
      {
        id: 'oi-101-1',
        order_id: 'ord-hist-101',
        product_id: '33333333-3333-4333-8333-333333333302',
        sku: 'SKU002',
        product_name: 'Ivory Chanderi Zari Embroidered Suit Set',
        selected_size: 'M',
        color: 'Ivory Gold',
        quantity: 1,
        unit_price: 2999,
        line_total: 2999,
      },
    ],
  },
  {
    id: 'ord-hist-102',
    order_number: 'ORD-20261019-9410',
    customer_id: DEMO_CUSTOMER_ID,
    status: 'SHIPPED',
    payment_status: 'PAID',
    payment_provider: 'UPI / PhonePe',
    payment_reference: 'UTR99412049182',
    subtotal_amount: 2398,
    discount_amount: 200,
    shipping_amount: 0,
    total_amount: 2398,
    shipping_address: {
      full_name: DEMO_NAME,
      phone: DEMO_PHONE,
      address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
      address_line2: 'Near Central Park Gate 2',
      city: 'Jaipur',
      state: 'Rajasthan',
      postal_code: '302001',
      country: DEMO_COUNTRY,
    },
    tracking_number: 'BLUEDART774120IN',
    shipping_carrier: 'BlueDart Air',
    notes: 'In transit — arriving tomorrow by 6 PM',
    created_at: '2026-10-19T14:10:00Z',
    updated_at: '2026-10-20T09:30:00Z',
    delivered_at: null,
    items: [
      {
        id: 'oi-102-1',
        order_id: 'ord-hist-102',
        product_id: '33333333-3333-4333-8333-333333333301',
        sku: 'SKU001',
        product_name: 'Floral Handblock Mulmul Cotton Kurti',
        selected_size: 'L',
        color: 'Indigo Blue',
        quantity: 2,
        unit_price: 1199,
        line_total: 2398,
      },
    ],
  },
];

const TAB_BASE =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer';
const LABEL_CLASS = 'block text-xs font-medium text-stone-700 mb-1';
const INPUT_CLASS = 'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm';
const SUMMARY_LABEL_CLASS =
  'text-stone-400 uppercase tracking-wider block text-[10px] font-semibold';
const PRIMARY_LINK_CLASS =
  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold';
const H2_CLASS = 'font-serif text-2xl font-semibold text-stone-950';
const MUTED_XS_CLASS = 'text-xs text-stone-500';
const SPLIT_ROW_CLASS = 'flex justify-between';
const MUTED_LABEL_CLASS = 'text-stone-500';

export const AccountConstants = {
  // ---------------------------------------------------------------- Page
  ROUTES: {
    LOGIN: '/login',
    LOGIN_WITH_NEXT: '/login?next=/account',
    SHOP: '/shop',
    CART: '/cart',
    PRODUCT: (sku: string) => `/product/${sku}`,
  },

  QUERY: {
    TAB_PARAM: 'tab',
  },

  TABS: {
    ORDERS: 'orders',
    BAG: 'bag',
    ADDRESSES: 'addresses',
  },

  ORDER_STATUS: {
    DELIVERED: 'DELIVERED',
    SHIPPED: 'SHIPPED',
  },

  ADDRESS_LABELS: {
    HOME: 'Home',
    WORK: 'Work',
    OTHER: 'Other',
  },

  EMPTY_VALUE: '',
  NAME_SPLIT_SEPARATOR: ' ',
  FREE_SHIPPING_AMOUNT: 0,
  PIN_CODE_PATTERN: '[0-9]{6}',
  IMAGE_SIZES: '56px',

  LOCALE: 'en-IN',
  DATE_FORMATS: {
    ORDER_PLACED: { day: 'numeric', month: 'short', year: 'numeric' },
    DELIVERED_DATE: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' },
    DELIVERED_TIME: { hour: '2-digit', minute: '2-digit' },
  } as const,

  INPUT_TYPES: {
    TEXT: 'text',
    TEL: 'tel',
    CHECKBOX: 'checkbox',
  },
  BUTTON_TYPES: {
    BUTTON: 'button',
    SUBMIT: 'submit',
  },

  ARIA: {
    ROLE_DIALOG: 'dialog',
    MODAL: 'true',
  },

  COPY: {
    LOADING_TITLE: 'Loading Your Account...',
    LOADING_SUBTITLE: 'Fetching your orders, invoices, shopping bag & saved addresses',
    VERIFIED_BADGE: 'Verified Customer Profile',
    GREETING: (firstName: string) => `Namaste, ${firstName}!`,
    PROFILE_LINE: (name: string, email: string, phone: string) =>
      `${name} • ${email} • ${phone}`,
    LOGOUT: 'Logout',

    TAB_ORDERS: (count: number) => `Previous Orders & Invoices (${count})`,
    TAB_BAG: (count: number) => `Current Shopping Bag (${count})`,
    TAB_ADDRESSES: (count: number) => `Stored Addresses (${count})`,

    NO_ORDERS_TITLE: 'No Orders Yet',
    NO_ORDERS_BODY:
      'Once you place an order, its live delivery status and tax invoice will appear here.',
    EXPLORE_COLLECTION: 'Explore Collection',

    ORDER_NUMBER: 'Order Number',
    ORDER_PLACED: 'Order Placed',
    TOTAL_AMOUNT: 'Total Amount',
    VIEW_INVOICE: 'View / Print Tax Invoice',

    STATUS_DELIVERED: 'DELIVERED',
    STATUS_SHIPPED: 'SHIPPED • IN TRANSIT',
    DELIVERED_ON: 'Delivered on ',
    DELIVERED_AT_JOINER: ' at ',
    DEFAULT_NOTE: 'Preparing warehouse dispatch',
    COURIER_PREFIX: 'Courier: ',
    AWB_JOINER: ' • AWB: ',

    SIZE_LABEL: 'Size: ',
    QTY_JOINER: ' • Qty: ',
    COLOR_JOINER: ' • Color: ',

    BAG_TITLE: 'Your Active Shopping Bag',
    BAG_COUNT: (count: number) =>
      `${count} ${count === 1 ? 'item' : 'items'} currently in your bag`,
    GO_TO_CHECKOUT: (formattedSubtotal: string) => `Go to Checkout (${formattedSubtotal})`,
    BAG_EMPTY: 'Your shopping bag is currently empty.',
    BROWSE_STYLES: 'Browse Latest Styles',

    ADDRESSES_TITLE: 'Saved Delivery Addresses',
    ADDRESSES_SUBTITLE: 'Add or edit your delivery addresses for faster 1-click checkout.',
    ADD_ADDRESS: 'Add New Address',
    FORM_TITLE_EDIT: (label: string) => `Edit ${label} Address`,
    FORM_TITLE_NEW: 'Add New Delivery Address',
    LABEL_ADDRESS_LABEL: 'Address Label',
    OPTION_HOME: 'Home',
    OPTION_WORK: 'Work / Office',
    OPTION_OTHER: 'Other',
    LABEL_FULL_NAME: 'Recipient Full Name *',
    LABEL_PHONE: 'WhatsApp / Phone Number *',
    LABEL_LINE1: 'House / Flat / Building & Street *',
    PLACEHOLDER_LINE1: 'Flat 402, Lotus Enclave',
    LABEL_LINE2: 'Area / Landmark (Optional)',
    PLACEHOLDER_LINE2: 'Near Central Park',
    LABEL_CITY: 'City *',
    LABEL_STATE: 'State *',
    LABEL_PIN: '6-Digit PIN Code *',
    LABEL_DEFAULT: 'Set as my default delivery address',
    CANCEL: 'Cancel',
    SAVE_ADDRESS: 'Save Address',
    DEFAULT_BADGE: 'Default Address',
    SET_DEFAULT: 'Set as Default',
    LINE2_PREFIX: ', ',
    CITY_STATE_PREFIX: (city: string, state: string) => `${city}, ${state} — `,
    PHONE_PREFIX: 'Phone: ',
    EDIT_ADDRESS: 'Edit Address',
    REMOVE: 'Remove',

    INVOICE_SUBTITLE: 'Tax Invoice / Bill of Supply • Original for Recipient',
    PRINT_SAVE_PDF: 'Print / Save PDF',
    BILLED_TO: 'Billed & Shipped To',
    INVOICE_CITY_LINE: (city: string, state: string, postalCode: string) =>
      `${city}, ${state} - ${postalCode}`,
    INVOICE_PHONE: (phone: string) => `Phone: ${phone}`,
    INVOICE_NO: 'Invoice / Order No:',
    ORDER_DATE: 'Order Date:',
    DELIVERY_STATUS: 'Delivery Status:',
    DELIVERED_ON_LABEL: 'Delivered On:',
    PAYMENT_REFERENCE: 'Payment Reference:',
    TH_ITEM: 'SKU & Item',
    TH_SIZE: 'Size',
    TH_QTY: 'Qty',
    TH_UNIT_PRICE: 'Unit Price',
    TH_LINE_TOTAL: 'Line Total',
    SUBTOTAL: 'Subtotal (Incl. GST):',
    SHIPPING: 'Shipping Charges:',
    FREE: 'FREE',
    GRAND_TOTAL: 'Grand Total Paid:',
  },

  CLASSES: {
    PAGE: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8',
    BANNER:
      'rounded-3xl bg-stone-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg',
    BANNER_TEXT: 'space-y-1.5',
    BANNER_BADGE:
      'inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-widest',
    ICON_BADGE: 'w-3.5 h-3.5',
    BANNER_TITLE: 'font-serif text-3xl sm:text-4xl font-semibold',
    BANNER_PROFILE: 'text-xs sm:text-sm text-stone-300',
    LOGOUT_BUTTON:
      'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-rose-600/90 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0',
    ICON_MD: 'w-4 h-4',

    TABS_BAR: 'flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4',
    TAB: (isActive: boolean) =>
      `${TAB_BASE} ${
        isActive
          ? 'bg-stone-900 text-white shadow-xs'
          : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
      }`,

    ORDERS_LIST: 'space-y-5',
    EMPTY_ORDERS: 'p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3',
    EMPTY_ICON: 'w-8 h-8 text-stone-400 mx-auto',
    EMPTY_TITLE: 'font-serif text-2xl font-semibold text-stone-900',
    EMPTY_BODY: MUTED_XS_CLASS,
    PRIMARY_LINK: PRIMARY_LINK_CLASS,
    ORDER_CARD: 'rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-2xs',
    ORDER_TOP_BAR:
      'p-5 sm:px-6 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4',
    ORDER_TOP_FIELDS: 'flex flex-wrap items-center gap-4 sm:gap-8 text-xs',
    SUMMARY_LABEL: SUMMARY_LABEL_CLASS,
    ORDER_NUMBER_VALUE: 'font-mono font-bold text-stone-950 text-sm',
    ORDER_DATE_VALUE: 'font-semibold text-stone-800',
    ORDER_TOTAL_VALUE: 'font-bold text-stone-950 text-sm',
    INVOICE_BUTTON:
      'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-900 transition-colors cursor-pointer',
    INVOICE_BUTTON_ICON: 'w-3.5 h-3.5 text-amber-800',

    STATUS_BAR:
      'px-5 sm:px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white',
    STATUS_LEFT: 'flex items-center gap-3',
    BADGE_DELIVERED:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold',
    BADGE_DELIVERED_ICON: 'w-4 h-4 text-emerald-600',
    BADGE_SHIPPED:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold',
    BADGE_SHIPPED_ICON: 'w-4 h-4 text-amber-700',
    BADGE_OTHER:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold',
    BADGE_OTHER_ICON: 'w-4 h-4 text-blue-700',
    STATUS_NOTE: 'text-xs text-stone-700',
    STRONG_DARK: 'text-stone-950',
    TRACKING: MUTED_XS_CLASS,
    TRACKING_CARRIER: 'text-stone-800',
    TRACKING_AWB: 'font-mono text-stone-900',

    LINE_ITEMS: 'p-5 sm:px-6 divide-y divide-stone-100',
    LINE_ITEM:
      'py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm',
    LINE_ITEM_SKU: 'font-mono text-[11px] text-stone-400 mr-2',
    LINE_ITEM_LINK: 'font-semibold text-stone-900 hover:underline',
    LINE_ITEM_META: 'text-xs text-stone-500 mt-0.5',
    LINE_ITEM_TOTAL: 'font-bold text-stone-950',

    BAG_CARD: 'rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-6',
    BAG_HEADER: 'flex items-center justify-between border-b border-stone-200 pb-4',
    H2: H2_CLASS,
    MUTED_XS: MUTED_XS_CLASS,
    CHECKOUT_LINK:
      'inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800',
    BAG_EMPTY: 'py-8 text-center space-y-3',
    BAG_EMPTY_TEXT: 'text-sm text-stone-500',
    BAG_LIST: 'divide-y divide-stone-200',
    BAG_ITEM: 'py-4 flex items-center justify-between gap-4',
    BAG_ITEM_LEFT: 'flex items-center gap-3.5',
    BAG_IMAGE_WRAP:
      'relative w-14 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shrink-0',
    BAG_IMAGE: 'object-cover',
    BAG_ITEM_SKU: 'font-mono text-[10px] text-stone-400',
    BAG_ITEM_LINK: 'block text-sm font-semibold text-stone-900 hover:underline',
    BAG_ITEM_META: 'text-xs text-stone-500',
    BAG_ITEM_PRICE: 'text-sm font-bold text-stone-950',

    ADDRESSES_WRAP: 'space-y-6',
    ADDRESSES_HEADER: 'flex items-center justify-between',
    ADD_BUTTON:
      'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer',
    FORM: 'p-6 rounded-3xl bg-white border-2 border-stone-900 shadow-lg space-y-4',
    FORM_HEADER: 'flex items-center justify-between border-b border-stone-200 pb-3',
    FORM_TITLE: 'text-sm font-bold uppercase tracking-wider text-stone-900',
    FORM_CLOSE: 'p-1 text-stone-400 hover:text-stone-800',
    GRID_3: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
    GRID_2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    LABEL: LABEL_CLASS,
    SELECT: 'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white',
    INPUT: INPUT_CLASS,
    CHECKBOX_LABEL:
      'inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer',
    CHECKBOX: 'rounded border-stone-300',
    FORM_ACTIONS: 'flex justify-end gap-3 pt-2',
    CANCEL_BUTTON:
      'px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700',
    SAVE_BUTTON:
      'px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800',

    ADDRESS_GRID: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    ADDRESS_CARD: (isDefault: boolean) =>
      `p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
        isDefault ? 'border-stone-900 ring-1 ring-stone-900/10' : 'border-stone-200'
      }`,
    ADDRESS_BODY: 'space-y-1.5',
    ADDRESS_TOP: 'flex items-center justify-between',
    ADDRESS_LABEL_BADGE:
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold',
    DEFAULT_BADGE:
      'text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full',
    SET_DEFAULT_BUTTON:
      'text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer',
    ADDRESS_NAME: 'text-sm font-bold text-stone-950 pt-1',
    ADDRESS_LINES: 'text-xs text-stone-600 leading-relaxed',
    ADDRESS_PHONE: 'text-xs text-stone-500 pt-1',
    ADDRESS_PHONE_VALUE: 'text-stone-800',
    ADDRESS_ACTIONS: 'pt-3 border-t border-stone-100 flex items-center justify-end gap-2',
    EDIT_BUTTON:
      'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer',
    REMOVE_BUTTON:
      'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer',
    ICON_SM: 'w-3.5 h-3.5',

    MODAL_OVERLAY:
      'fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto',
    MODAL:
      'bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8',
    MODAL_HEADER: 'flex items-start justify-between border-b border-stone-200 pb-4',
    STORE_NAME: 'font-serif text-2xl font-bold tracking-wider text-stone-950',
    MODAL_ACTIONS: 'flex items-center gap-2',
    PRINT_BUTTON:
      'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer',
    MODAL_CLOSE: 'p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700',
    INVOICE_GRID: 'grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs',
    BILLED_BOX: 'p-4 rounded-2xl bg-stone-50 space-y-1',
    BILLED_LABEL: 'text-[10px] font-bold uppercase tracking-wider text-stone-400',
    BILLED_NAME: 'font-bold text-stone-900 text-sm',
    BILLED_LINE: 'text-stone-600',
    META_BOX: 'p-4 rounded-2xl bg-stone-50 space-y-1.5',
    SPLIT_ROW: SPLIT_ROW_CLASS,
    MUTED_LABEL: MUTED_LABEL_CLASS,
    META_MONO_STRONG: 'font-mono text-stone-900',
    META_STRONG: 'text-stone-900',
    META_STATUS: 'text-emerald-800',
    META_MONO: 'font-mono text-stone-800',
    TABLE: 'w-full text-left border-collapse text-xs',
    THEAD_ROW: 'border-b border-stone-200 text-stone-500 uppercase text-[10px]',
    TH: 'py-2',
    TH_RIGHT: 'py-2 text-right',
    TBODY: 'divide-y divide-stone-200',
    TD_ITEM: 'py-2.5',
    TD_SKU: 'font-mono text-[10px] text-stone-500 block',
    TD_NAME: 'text-stone-900',
    TD_SIZE: 'py-2.5 font-semibold',
    TD_RIGHT: 'py-2.5 text-right',
    TD_RIGHT_BOLD: 'py-2.5 text-right font-bold',
    TOTALS: 'border-t border-stone-200 pt-4 space-y-1.5 text-xs max-w-xs ml-auto',
    TOTAL_ROW: 'flex justify-between text-stone-600',
    GRAND_ROW:
      'flex justify-between text-sm font-bold text-stone-950 pt-1 border-t border-stone-200',
  },

  // ---------------------------------------------------- Auth context
  AUTH: {
    STORAGE_KEYS: {
      CUSTOMER: 'sudha_sales_customer_v1',
      ADDRESSES: 'sudha_sales_addresses_v1',
      ORDERS: 'sudha_sales_orders_v1',
    },
    PROVIDER_GOOGLE: 'google',
    DEMO_CUSTOMER_ID,
    DEMO_NAME,
    DEMO_PHONE,
    DEMO_COUNTRY,
    FALLBACK_NAME: 'Valued Customer',
    EMAIL_DOMAIN: '@gmail.com',
    EMAIL_SANITIZE_PATTERN: /[^a-z0-9]/g,
    EMAIL_SANITIZE_REPLACEMENT: '.',
    EMAIL_SPLIT_CHAR: '@',
    INITIAL_ADDRESSES: INITIAL_DEMO_ADDRESSES,
    INITIAL_ORDERS: INITIAL_DEMO_ORDERS,
    ADDRESS_ID_PREFIX: 'addr-',
    ORDER_ID_PREFIX: 'ord-',
    ORDER_ITEM_ID_SEGMENT: '-item-',
    ORDER_NUMBER_PREFIX: 'ORD-',
    ORDER_NUMBER_SEPARATOR: '-',
    ISO_DATE_LENGTH: 10,
    ISO_DATE_DASH_PATTERN: /-/g,
    ORDER_NUMBER_RANDOM: { MIN: 1000, SPAN: 9000 },
    PAYMENT_REF_PREFIX: 'UTR',
    PAYMENT_REF_RANDOM: { MIN: 10000000000, SPAN: 89999999999 },
    TRACKING_PREFIX: 'SUDHA',
    TRACKING_SUFFIX: 'IN',
    TRACKING_RANDOM: { MIN: 1000000, SPAN: 9000000 },
    NEW_ORDER: {
      STATUS: 'CONFIRMED',
      PAYMENT_STATUS: 'PAID',
      PAYMENT_PROVIDER: 'UPI / Online Payment',
      CARRIER: DEMO_CARRIER,
      NOTES: 'Order confirmed — preparing warehouse dispatch within 24 hours',
    },
    ERRORS: {
      PROVIDER_REQUIRED: 'useCustomerAuth must be used within a CustomerAuthProvider',
    },
  },
} as const;
