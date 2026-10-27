// Page-scoped constants for: Product components & PDP (consumed via AppConstants.Product)
export const ProductConstants = {
  COLLECTIONS: {
    NEW_COLLECTION_SLUG: 'new-collection',
  },

  STATUS: {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT',
    ARCHIVED: 'ARCHIVED',
  },

  ROUTES: {
    HOME: '/',
    SHOP: '/shop',
    SHOP_CATEGORY: (slug: string) => `/shop?category=${slug}`,
    SHOP_COLLECTION: (slug: string) => `/shop?collection=${slug}`,
    PRODUCT: (sku: string) => `/product/${sku}`,
    CART: '/cart',
    LOGIN_WITH_PURCHASE: (sku: string) => `/login?next=/product/${sku}&reason=purchase`,
    LOGIN_FOR_REVIEW: (sku: string) => `/login?next=/product/${sku}`,
  },

  API: {
    PRODUCTS: '/api/products',
    REVIEWS: '/api/reviews',
    METHOD_POST: 'POST',
    HEADERS_JSON: { 'Content-Type': 'application/json' },
  },

  CARD: {
    SIZES_IMAGE: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    MODAL_IMAGE_SIZES: '(max-width: 640px) 92vw, 576px',
    DEFAULT_CATEGORY: 'Apparel',
    SWIPE_THRESHOLD_PX: 40,
    OVERFLOW_HIDDEN: 'hidden',
    KEY_ESCAPE: 'Escape',
    KEY_ARROW_LEFT: 'ArrowLeft',
    KEY_ARROW_RIGHT: 'ArrowRight',

    ARIA: {
      VIEW_ALL_PHOTOS: (name: string) => `View all photos of ${name}`,
      PHOTO_VIEWER: (name: string) => `${name} photo viewer`,
      CLOSE_VIEWER: 'Close photo viewer',
      PREV_PHOTO: 'Previous photo',
      NEXT_PHOTO: 'Next photo',
      TABLIST: 'Photo navigation indicators',
      PHOTO_TAB: (current: number, total: number) => `Photo ${current} of ${total}`,
    },

    COPY: {
      NO_IMAGE: 'No image',
      SOLD_OUT: 'Sold Out',
      DISCOUNT_BADGE: (pct: number) => `-${pct}% Off`,
      NEW_DROP: 'New Drop',
      ALTERNATE_VIEW: (name: string) => `${name} alternate view`,
      ONLY_LEFT: (stock: number) => `Only ${stock} left`,
      ADD_TO_CART: 'Add to Cart',
      OPENING_SKU: (sku: string) => `Opening ${sku}...`,
      SPINNER_TITLE: (name: string) => `Opening ${name}...`,
      SPINNER_SUBTITLE: (sku: string) => `Loading sizes, stock & photos for ${sku}`,
    },

    CLASSES: {
      ARTICLE: 'group flex flex-col',
      IMAGE_BUTTON:
        'relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 block text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-stone-900',
      IMAGE_PRIMARY: (hasSecondary: boolean) =>
        `object-cover object-top transition-all duration-500 group-hover:scale-105 ${
          hasSecondary ? 'group-hover:opacity-0' : ''
        }`,
      IMAGE_SECONDARY:
        'object-cover object-top opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105',
      NO_IMAGE: 'w-full h-full flex items-center justify-center text-stone-400 text-xs',
      BADGE_CONTAINER: 'absolute top-2.5 left-2.5 flex flex-col gap-1.5',
      BADGE_SOLD_OUT:
        'px-2.5 py-1 rounded-full bg-stone-900/90 text-white text-[10px] font-semibold uppercase tracking-wider',
      BADGE_DISCOUNT:
        'px-2.5 py-1 rounded-full bg-rose-700 text-white text-[10px] font-semibold uppercase tracking-wider shadow-xs',
      BADGE_NEW_DROP:
        'px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-semibold uppercase tracking-wider',
      COUNT_BADGE:
        'absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-stone-950/75 text-white text-[10px] font-medium backdrop-blur-xs',
      COUNT_ICON: 'w-3 h-3',
      SIZE_STRIP_WRAPPER:
        'absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none',
      SIZE_STRIP:
        'flex flex-wrap gap-1 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-stone-200/70',
      SIZE_BADGE: 'text-[10px] font-semibold text-stone-800 px-1',
      LOW_STOCK_BADGE:
        'hidden sm:inline-block bg-amber-950/85 text-amber-100 text-[10px] font-medium px-2 py-1 rounded-lg',
      META_CONTAINER: 'pt-3 flex-1 flex flex-col justify-between space-y-2.5',
      META_HEADER: 'flex items-center justify-between gap-2 text-[11px] text-stone-500',
      CATEGORY: 'truncate',
      SKU: 'font-mono text-[10px] text-stone-400',
      NAME_LINK:
        'mt-0.5 text-sm sm:text-[15px] font-medium text-stone-900 group-hover:text-stone-700 line-clamp-2 leading-snug block',
      PRICE_ROW: 'pt-1 flex items-center justify-between gap-2',
      PRICE_GROUP: 'flex items-baseline gap-2',
      PRICE_SALE: 'text-sm sm:text-base font-semibold text-stone-950',
      PRICE_REGULAR: 'text-xs text-stone-400 line-through',
      PRICE_NORMAL: 'text-sm sm:text-base font-semibold text-stone-950',
      RATING_BADGE:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-stone-900 shrink-0',
      RATING_STAR: 'w-3 h-3 fill-amber-400 text-amber-500',
      RATING_COUNT: 'text-stone-400 font-normal',
      CTA_BUTTON:
        'w-full py-2.5 px-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.99] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-75 cursor-pointer',
      CTA_SPINNER: 'w-3.5 h-3.5 animate-spin text-amber-300',
      CTA_ICON: 'w-3.5 h-3.5',

      MODAL_BACKDROP:
        'fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-6',
      MODAL_CARD:
        'relative w-full max-w-xl aspect-[4/4.2] sm:aspect-[16/11] max-h-[68vh] rounded-[32px] bg-white/20 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-white/30 flex items-center justify-center overflow-hidden touch-pan-y',
      CLOSE_BUTTON:
        'absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-white/65 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-stone-900 shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer',
      CLOSE_ICON: 'w-4 h-4',
      MODAL_IMAGE: (isActive: boolean) =>
        `object-contain p-3 sm:p-5 pb-14 drop-shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition-opacity duration-150 ${
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`,
      NAV_PREV:
        'absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/65 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-stone-900 shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer',
      NAV_NEXT:
        'absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/65 hover:bg-white/90 backdrop-blur-xl border border-white/80 text-stone-900 shadow-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer',
      NAV_ICON: 'w-5 h-5',
      DOTS_WRAPPER: 'absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20',
      DOTS_BAR:
        'inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
      DOT: (isCurrent: boolean) =>
        `rounded-full transition-all duration-300 cursor-pointer ${
          isCurrent
            ? 'w-3.5 h-3.5 bg-stone-900 border-2 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)] scale-110'
            : 'w-2.5 h-2.5 bg-stone-900/30 hover:bg-stone-900/60 border border-white/80 backdrop-blur-md'
        }`,
    },
  },

  GALLERY: {
    THUMB_SIZES: '80px',
    HERO_SIZES: '(max-width: 768px) 100vw, 55vw',

    COPY: {
      EMPTY: 'No product images available',
      VIEW_N: (name: string, index: number) => `${name} view ${index}`,
      SAVE_PCT: (pct: number) => `Save ${pct}%`,
      PREV_ARIA: 'Previous image',
      NEXT_ARIA: 'Next image',
      PAGER: (current: number, total: number) => `${current} / ${total}`,
    },

    CLASSES: {
      EMPTY:
        'aspect-[3/4] w-full rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm',
      WRAPPER: 'flex flex-col-reverse sm:flex-row gap-3 sm:gap-4',
      THUMB_STRIP:
        'flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0 pb-1 sm:pb-0',
      THUMB_BUTTON: (isSelected: boolean) =>
        `relative aspect-[3/4] w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
          isSelected
            ? 'border-stone-900 ring-2 ring-stone-900/15'
            : 'border-transparent opacity-70 hover:opacity-100'
        }`,
      THUMB_IMAGE: 'object-cover object-top',
      HERO_WRAPPER:
        'relative aspect-[3/4] w-full flex-1 rounded-2xl overflow-hidden bg-stone-100',
      HERO_IMAGE: (isActive: boolean) =>
        `object-cover object-top transition-opacity duration-150 ${
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        }`,
      DISCOUNT_BADGE:
        'absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider shadow-sm',
      NAV_PREV:
        'absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 flex items-center justify-center shadow-md hover:bg-white transition',
      NAV_NEXT:
        'absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-900 flex items-center justify-center shadow-md hover:bg-white transition',
      NAV_ICON: 'w-5 h-5',
      PAGER_PILL:
        'absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-950/70 text-white text-[11px] font-medium',
    },
  },

  PURCHASE: {
    FEEDBACK_DURATION_MS: 2200,
    FIT_TEXT: 'Standard Indian Fit',

    COPY: {
      OUT_OF_STOCK: 'Currently Out of Stock',
      SIZE_OUT_OF_STOCK: (size: string) =>
        `Size ${size} is Out of Stock — please choose another size`,
      ONLY_AVAILABLE: (stock: number, size: string) =>
        `Only ${stock} available in Size ${size} (Max ${stock} can be purchased)`,
      IN_STOCK_DISPATCH: (stock: number, size: string) =>
        `In Stock (${stock} ready to dispatch in Size ${size})`,
      SELECT_SIZE_LABEL: 'Select Size: ',
      SOLD_OUT_SMALL: 'Sold Out',
      LEFT_COUNT: (qty: number) => `${qty} left`,
      IN_STOCK_COUNT: (qty: number) => `${qty} in stock`,
      QUANTITY_LABEL: 'Quantity',
      STOCK_LIMIT_LABEL: (stock: number) => `Stock limit: ${stock} max`,
      DECREASE_ARIA: 'Decrease quantity',
      INCREASE_ARIA: 'Increase quantity',
      ADDED_TO_BAG: 'Added to Bag',
      ADD_TO_BAG: 'Add to Bag',
      REDUCE_QTY_TO_BUY: 'Reduce Qty to Buy',
      BUY_NOW: 'Buy Now',
      SELECT_SIZE_FIRST: 'Please select a size first.',
      MAX_QUANTITY_REACHED: (stock: number, size: string) =>
        `Cannot select more than ${stock}. Only ${stock} piece(s) available in Size ${size}. Please reduce quantity to proceed.`,
      QUANTITY_ADJUSTED: (stock: number, size: string) =>
        `Quantity adjusted to ${stock} because only ${stock} piece(s) are available in Size ${size}.`,
    },

    CLASSES: {
      PANEL: 'space-y-6 pt-2',
      STATUS_WRAPPER: 'flex items-center gap-2 text-xs font-medium',
      BADGE_OUT_OF_STOCK:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200',
      DOT_ROSE: 'w-2 h-2 rounded-full bg-rose-600',
      BADGE_LOW_STOCK:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-xs',
      DOT_AMBER_PULSE: 'w-2 h-2 rounded-full bg-amber-500 animate-pulse',
      BADGE_IN_STOCK:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200',
      DOT_EMERALD: 'w-2 h-2 rounded-full bg-emerald-600',
      SIZE_HEADER: 'flex items-center justify-between mb-2.5',
      SIZE_LABEL: 'text-xs font-semibold uppercase tracking-wider text-stone-800',
      SIZE_LABEL_SELECTED: 'text-stone-950 font-bold',
      FIT_SUBTITLE: 'text-xs text-stone-500',
      SIZE_GRID: 'flex flex-wrap gap-2.5',
      SIZE_BUTTON: (isSelected: boolean, isSoldOut: boolean) =>
        `relative min-w-[4rem] min-h-[3rem] px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all border flex flex-col items-center justify-center leading-tight ${
          isSelected
            ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-2 ring-stone-900/10'
            : isSoldOut
            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
            : 'bg-white text-stone-800 border-stone-300 hover:border-stone-900'
        }`,
      SIZE_NAME: 'font-bold',
      SIZE_SOLD_OUT_TAG:
        'text-[9px] font-normal leading-none text-rose-500 no-underline',
      SIZE_LOW_TAG: (isSelected: boolean) =>
        `text-[9.5px] font-semibold leading-none tracking-tight ${
          isSelected ? 'text-amber-300' : 'text-amber-700'
        }`,
      SIZE_STOCK_TAG: (isSelected: boolean) =>
        `text-[9.5px] font-normal leading-none tracking-tight ${
          isSelected ? 'text-stone-300' : 'text-stone-500'
        }`,
      QTY_HEADER: 'flex items-center justify-between mb-2',
      QTY_LABEL: 'text-xs font-semibold uppercase tracking-wider text-stone-800',
      QTY_LIMIT_TEXT: 'text-xs font-medium text-amber-700',
      QTY_SELECTOR: 'inline-flex items-center rounded-xl border border-stone-300 bg-white',
      QTY_DEC:
        'w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-l-xl disabled:opacity-40 transition-colors',
      QTY_VALUE: 'w-12 text-center text-sm font-semibold tabular-nums text-stone-900',
      QTY_INC:
        'w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-r-xl disabled:opacity-40 transition-colors',
      QTY_ICON: 'w-4 h-4',
      ERROR_BANNER:
        'flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl',
      ERROR_ICON: 'w-4 h-4 shrink-0',
      ACTIONS_GRID: 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1',
      ADD_BAG_BUTTON: (addedFeedback: boolean) =>
        `h-13 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
          addedFeedback
            ? 'bg-emerald-700 text-white border-emerald-700'
            : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800 active:scale-[0.99]'
        } disabled:bg-stone-200 disabled:text-stone-500 disabled:border-stone-200 disabled:cursor-not-allowed`,
      CHECK_ICON: 'w-4 h-4',
      BAG_ICON: 'w-4 h-4',
      BUY_NOW_BUTTON:
        'h-13 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-amber-600/15 text-amber-950 border border-amber-700/30 hover:bg-amber-600/25 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed',
      TRUST_GRID: 'grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center',
      TRUST_ITEM: 'p-2.5 rounded-xl bg-stone-50 space-y-1',
      TRUST_ICON: 'w-4 h-4 mx-auto text-stone-700',
      TRUST_TEXT: 'text-[11px] font-medium text-stone-700',
    },
  },

  REVIEWS: {
    SECTION_ID: 'customer-reviews',
    MAX_TITLE_LENGTH: 100,
    MAX_COMMENT_LENGTH: 1200,
    DEFAULT_RATING: 5,
    STARS: [1, 2, 3, 4, 5] as const,
    BREAKDOWN_STARS: [5, 4, 3, 2, 1] as const,

    COPY: {
      HEADER_TAG: 'Shopper Feedback',
      TITLE: 'Customer Reviews & Ratings',
      CLOSE_FORM: 'Close Review Form',
      WRITE_REVIEW: 'Write a Review',
      SIGN_IN_PROMPT: 'Sign In to Write a Review',
      FORM_TITLE: (name: string) => `Share Your Experience with ${name}`,
      POSTING_AS: 'Posting publicly as ',
      LABEL_RATING: 'Your Overall Rating *',
      STAR_COUNT_TEXT: (rating: number) => `${rating} / 5 Stars`,
      RATE_STAR_ARIA: (star: number) => `Rate ${star} out of 5 stars`,
      LABEL_SIZE_PURCHASED: 'Size Purchased (Optional)',
      SIZE_OPTION: (size: string) => `Size: ${size}`,
      LABEL_HEADLINE: 'Review Headline (Optional)',
      PLACEHOLDER_HEADLINE: 'e.g., Pure fabric quality & gorgeous Bandhej colour!',
      LABEL_COMMENT: 'Your Review / Comment *',
      PLACEHOLDER_COMMENT:
        'Tell other shoppers about the fabric feel, Zari/Bandhej work, colour accuracy, and fit...',
      CANCEL: 'Cancel',
      SUBMITTING: 'Publishing Review...',
      SUBMIT: 'Post Customer Review',
      SUCCESS_DEFAULT: 'Thank you! Your review has been published on this product.',
      ERROR_SUBMIT_FAILED: 'Could not submit review',
      ERROR_UNKNOWN: 'Failed to submit review',
      BASED_ON: 'Based on ',
      REVIEW_SINGULAR: 'customer review',
      REVIEW_PLURAL: 'customer reviews',
      VERIFIED_REVIEWER: 'Verified Reviewer',
      SIZE_TAG: '• Size: ',
      EMPTY_TITLE: 'No reviews yet for this piece',
      EMPTY_BODY: (name: string) =>
        `Purchased or tried ${name}? Be the first customer to share a review and help other shoppers!`,
    },

    CLASSES: {
      SECTION: 'mt-16 sm:mt-20 pt-12 border-t border-stone-200 space-y-8',
      HEADER: 'flex flex-col sm:flex-row sm:items-end justify-between gap-4',
      TAG: 'text-xs font-semibold uppercase tracking-widest text-amber-800 flex items-center gap-1.5',
      TAG_ICON: 'w-3.5 h-3.5',
      TITLE: 'font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1',
      FORM_TOGGLE:
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto',
      FORM_TOGGLE_ICON: 'w-4 h-4 text-amber-300',
      SIGN_IN_LINK:
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold transition-colors self-start sm:self-auto',
      LOCK_ICON: 'w-3.5 h-3.5 text-stone-600',
      SUCCESS_BANNER:
        'p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5',
      SUCCESS_ICON: 'w-4 h-4 text-emerald-600 shrink-0',
      FORM: 'p-6 sm:p-8 rounded-3xl bg-white border-2 border-stone-900 shadow-lg space-y-5',
      FORM_HEADER: 'flex items-center justify-between border-b border-stone-200 pb-3',
      FORM_TITLE: 'font-serif text-lg sm:text-xl font-semibold text-stone-950',
      FORM_SUBTITLE: 'text-xs text-stone-500',
      ERROR_BANNER:
        'p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2',
      ERROR_ICON: 'w-4 h-4 shrink-0',
      FORM_GRID: 'grid grid-cols-1 sm:grid-cols-2 gap-5',
      LABEL: 'block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2',
      LABEL_INPUT: 'block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5',
      STARS_ROW: 'flex items-center gap-1.5',
      STAR_BTN: 'p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer',
      STAR_ICON: (active: boolean) =>
        `w-7 h-7 transition-transform ${
          active ? 'fill-amber-400 text-amber-500 scale-105' : 'text-stone-300'
        }`,
      RATING_DISPLAY: 'ml-2 text-xs font-bold text-stone-800',
      SELECT: 'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white',
      INPUT: 'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm',
      TEXTAREA: 'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm',
      FORM_ACTIONS: 'flex justify-end gap-3',
      CANCEL_BTN:
        'px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700',
      SUBMIT_BTN:
        'px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer',

      SUMMARY_GRID: 'grid grid-cols-1 lg:grid-cols-12 gap-8',
      LEFT_COL: 'lg:col-span-4',
      SUMMARY_CARD: 'p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-5',
      AVERAGE_ROW: 'flex items-center gap-4',
      AVERAGE_NUMBER: 'text-4xl sm:text-5xl font-serif font-bold text-stone-950',
      STARS_GROUP: 'flex items-center gap-0.5',
      AVG_STAR: (active: boolean) =>
        `w-4 h-4 ${active ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`,
      REVIEW_COUNT_TEXT: 'text-xs font-medium text-stone-600',
      BREAKDOWN_WRAPPER: 'space-y-2 pt-3 border-t border-stone-100',
      BREAKDOWN_ROW: 'flex items-center gap-2.5 text-xs',
      BREAKDOWN_STAR_LABEL:
        'w-8 font-semibold text-stone-700 flex items-center gap-0.5',
      BREAKDOWN_STAR_ICON: 'w-3 h-3 fill-amber-400 text-amber-500',
      BREAKDOWN_TRACK: 'flex-1 h-2 rounded-full bg-stone-100 overflow-hidden',
      BREAKDOWN_FILL: 'h-full rounded-full bg-amber-400 transition-all duration-500',
      BREAKDOWN_COUNT: 'w-7 text-right text-stone-500 tabular-nums',

      REVIEWS_LIST: 'lg:col-span-8 space-y-4',
      REVIEW_CARD:
        'p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3',
      REVIEW_TOP: 'flex flex-wrap items-start justify-between gap-2',
      AUTHOR_INFO: 'flex items-center gap-3',
      AVATAR:
        'w-9 h-9 rounded-full bg-stone-900 text-amber-300 font-serif font-bold text-xs flex items-center justify-center shrink-0',
      AUTHOR_NAME_ROW: 'flex items-center gap-2',
      AUTHOR_NAME: 'text-sm font-bold text-stone-950',
      VERIFIED_BADGE:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold',
      VERIFIED_ICON: 'w-2.5 h-2.5 text-emerald-600',
      REVIEW_STARS_ROW: 'flex items-center gap-2 mt-0.5',
      REVIEW_STAR: (active: boolean) =>
        `w-3.5 h-3.5 ${active ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`,
      REVIEW_SIZE: 'text-[11px] text-stone-500',
      DATE_TIME: 'text-[11px] text-stone-400',
      REVIEW_TITLE: 'text-sm font-bold text-stone-900 pt-1',
      REVIEW_BODY: 'text-xs sm:text-sm text-stone-600 leading-relaxed',
      EMPTY_CARD:
        'p-8 sm:p-10 rounded-3xl bg-stone-100/70 border border-stone-200/80 text-center max-w-xl mx-auto space-y-3',
      EMPTY_TITLE: 'text-sm font-semibold text-stone-800',
      EMPTY_SUBTITLE: 'text-xs text-stone-500 leading-relaxed',
    },
  },

  GRID: {
    KEY_SEPARATOR: '::',
    DEFAULT_CATEGORY: 'all',
    DEFAULT_COLLECTION: 'all',
    DEFAULT_SIZE: 'all',
    DEFAULT_SORT: 'newest',
    SKELETON_COUNT: 4,

    QUERY_PARAMS: {
      PAGE: 'page',
      LIMIT: 'limit',
      CATEGORY: 'category',
      COLLECTION: 'collection',
      SIZE: 'size',
      SORT: 'sort',
      Q: 'q',
    },

    COPY: {
      LOADING_MORE: 'Discovering more handcrafted styles...',
      ERROR_DEFAULT: 'Unable to load more styles',
      RETRY: 'Retry Loading More',
      MANUAL_LOAD_MORE: 'Load More Styles',
      SHOWN_COUNT: (current: number, total: number) => `(${current} of ${total} shown)`,
      ALL_VIEWED: (count: number) =>
        `You've viewed all ${count} styles in this collection`,
      BACK_TO_TOP: 'Back to Top',
    },

    CLASSES: {
      WRAPPER: 'space-y-8',
      GRID: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6',
      SENTINEL: 'h-4 w-full',
      LOADING_BOX: 'py-6 flex flex-col items-center justify-center gap-3',
      LOADING_PILL:
        'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-medium shadow-md',
      LOADER_ICON: 'w-4 h-4 animate-spin text-amber-400',
      SKELETON_GRID: 'grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-60',
      SKELETON_CARD: 'rounded-2xl bg-stone-100 aspect-[3/4] animate-pulse',
      ERROR_BOX: 'py-6 text-center space-y-2',
      ERROR_TEXT: 'text-xs text-rose-700 font-medium',
      RETRY_BUTTON:
        'px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors',
      MANUAL_LOAD_BOX: 'py-4 text-center',
      MANUAL_LOAD_BUTTON:
        'inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:border-stone-900 hover:bg-stone-50 transition-all shadow-2xs',
      MANUAL_LOAD_MUTED: 'text-stone-400',
      END_BOX: 'pt-8 pb-4 border-t border-stone-200 text-center space-y-3',
      END_PILL:
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium',
      SPARKLE_ICON: 'w-3.5 h-3.5 text-amber-700',
      BACK_TO_TOP_BUTTON:
        'inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer group',
      ARROW_UP_ICON: 'w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5',
    },
  },

  DETAIL: {
    RELATED_PRODUCTS_LIMIT: 4,

    ARIA: {
      BREADCRUMB: 'Breadcrumb',
    },

    COPY: {
      HOME: 'Home',
      SHOP: 'Shop',
      SKU_PREFIX: 'SKU: ',
      RATING_OUT_OF_5: (avg: string) => `${avg} out of 5`,
      CUSTOMER_REVIEW: 'Customer Review',
      CUSTOMER_REVIEWS: 'Customer Reviews',
      SAVE_PCT: (pct: number) => `Save ${pct}%`,
      TAX_SHIPPING_NOTE: 'Inclusive of all taxes • Free shipping on orders over ₹1,499',
      COLOR_SHADE_LABEL: 'Color / Shade:',
      DESCRIPTION_HEADING: 'Description & Craftsmanship',
      SPEC_SKU_LABEL: 'Product Code (SKU)',
      SPEC_SIZES_LABEL: 'Available Sizes',
      SPEC_WASH_CARE_LABEL: 'Wash Care',
      SPEC_WASH_CARE_VALUE: 'Gentle cold hand wash or dry clean',
      RELATED_HEADING: 'You May Also Like',
    },

    CLASSES: {
      PAGE: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10',
      BREADCRUMB:
        'flex items-center gap-1.5 text-xs text-stone-500 mb-6 overflow-x-auto whitespace-nowrap',
      BREADCRUMB_LINK: 'hover:text-stone-900',
      BREADCRUMB_ICON: 'w-3.5 h-3.5 shrink-0',
      BREADCRUMB_CURRENT: 'text-stone-900 font-medium truncate',
      LAYOUT_GRID: 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12',
      GALLERY_COL: 'lg:col-span-7',
      INFO_COL: 'lg:col-span-5 space-y-5',
      TAGS_ROW: 'flex flex-wrap items-center justify-between gap-2',
      TAGS_LEFT: 'flex items-center gap-2',
      COLLECTION_BADGE:
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-semibold',
      SPARKLE_ICON: 'w-3 h-3',
      CATEGORY_TEXT: 'text-xs font-medium text-stone-500',
      SKU_BADGE:
        'font-mono text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 border border-stone-200',
      TITLE:
        'font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-950 leading-tight',
      RATING_LINK:
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-xs font-semibold text-stone-900 transition-colors',
      RATING_STARS: 'flex items-center gap-0.5',
      STAR_ICON: (active: boolean) =>
        `w-3.5 h-3.5 ${active ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}`,
      RATING_AVG: 'font-bold',
      RATING_DOT: 'text-stone-400',
      RATING_COUNT_TEXT: 'underline text-stone-700',
      PRICE_ROW: 'flex items-baseline gap-3 pt-1',
      PRICE_SALE: 'text-2xl sm:text-3xl font-bold text-stone-950',
      PRICE_REGULAR: 'text-base text-stone-400 line-through',
      PRICE_DISCOUNT_BADGE:
        'text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800',
      PRICE_NORMAL: 'text-2xl sm:text-3xl font-bold text-stone-950',
      TAX_NOTE: 'text-[11px] text-stone-500 -mt-3',
      COLOR_ROW: 'pt-1 flex items-center gap-2 text-xs text-stone-700',
      LAYERS_ICON: 'w-4 h-4 text-stone-500',
      COLOR_VALUE: 'text-stone-950',
      STORY_SECTION: 'pt-6 border-t border-stone-200 space-y-4',
      DESCRIPTION_HEADING: 'text-xs font-semibold uppercase tracking-wider text-stone-900 mb-2',
      DESCRIPTION_TEXT: 'text-sm text-stone-600 leading-relaxed',
      SPECS_BOX:
        'rounded-2xl bg-stone-100/80 border border-stone-200/80 p-4 space-y-2 text-xs text-stone-600',
      SPEC_ROW: 'flex justify-between',
      SPEC_LABEL: 'text-stone-500',
      SPEC_SKU: 'font-mono font-semibold text-stone-900',
      SPEC_SIZES: 'font-semibold text-stone-900',
      SPEC_CARE: 'font-medium text-stone-900',
      RELATED_SECTION: 'mt-16 sm:mt-24 pt-12 border-t border-stone-200',
      RELATED_HEADING: 'font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mb-6',
      RELATED_GRID: 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6',
    },
  },
} as const;
