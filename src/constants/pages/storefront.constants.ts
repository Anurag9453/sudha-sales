// Page-scoped constants for: Storefront shell, layout, header, footer, home, shop, spinner
export const StorefrontConstants = {
  DEFAULT_COLLECTION_SLUG: 'new-collection',

  SPINNER: {
    DEFAULT_TITLE: 'Curating Collection...',
    DEFAULT_SUBTITLE: 'Please wait a moment',
    ROLE_STATUS: 'status',
    ARIA_LIVE: 'polite',
    ANIMATION_DIRECTION_REVERSE: 'reverse',
    ANIMATION_DURATION_SECONDARY: '1.4s',

    DIMENSIONS: {
      SM: 'w-7 h-7',
      MD: 'w-11 h-11',
      LG: 'w-16 h-16',
    },
    ICON_DIMENSIONS: {
      SM: 'w-3 h-3',
      MD: 'w-4 h-4',
      LG: 'w-5 h-5',
    },
    INSETS: {
      SM: 'inset-1',
      DEFAULT: 'inset-2',
    },

    CLASSES: {
      BASE_BADGE: 'relative shrink-0 flex items-center justify-center',
      BASE_RING: (isDark: boolean) =>
        `absolute inset-0 rounded-full border-[2.5px] ${
          isDark ? 'border-stone-700/80' : 'border-stone-200'
        }`,
      PRIMARY_SPIN: (isDark: boolean) =>
        `absolute inset-0 rounded-full border-[2.5px] border-transparent ${
          isDark
            ? 'border-t-amber-300 border-r-amber-500'
            : 'border-t-stone-900 border-r-amber-700'
        } animate-spin`,
      SECONDARY_SPIN: (inset: string, isDark: boolean) =>
        `absolute ${inset} rounded-full border-[2px] border-transparent ${
          isDark ? 'border-b-amber-400' : 'border-b-amber-500'
        } animate-spin`,
      SPARKLE_ICON: (isDark: boolean) =>
        `${isDark ? 'text-amber-300' : 'text-amber-700'} animate-pulse`,
      CONTENT_BOX:
        'flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-stone-200/90 shadow-2xl max-w-sm w-full mx-4 space-y-4',
      BRAND_TITLE:
        'font-serif text-xs uppercase tracking-[0.2em] text-amber-800 font-semibold whitespace-nowrap',
      TITLE: 'font-serif text-xl font-semibold text-stone-950',
      SUBTITLE: 'text-xs text-stone-500 leading-relaxed',
      OVERLAY:
        'fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4',
      INLINE: 'min-h-[55vh] w-full flex items-center justify-center p-6',
    },
  },

  HEADER: {
    NAV_LINKS: [
      { href: '/', label: 'Home' },
      {
        href: '/shop?collection=new-collection',
        label: 'New Collection',
        badge: 'Daily Drop',
      },
      { href: '/shop', label: 'All Styles' },
      { href: '/shop?category=kurtis', label: 'Kurtis' },
      { href: '/shop?category=co-ord-sets', label: 'Co-ord Sets' },
      { href: '/shop?category=suit-sets', label: 'Suit Sets' },
      { href: '/shop?category=dresses', label: 'Dresses' },
    ] as const,

    DRAWER_OPTIONS: {
      ORDERS_HREF: '/account?tab=orders',
      ORDERS_LOGIN_HREF: '/login?next=/account',
      ADDRESSES_HREF: '/account?tab=addresses',
      ADDRESSES_LOGIN_HREF: '/login?next=/account?tab=addresses',
      CART_HREF: '/cart',
    },

    MARQUEE_TEMPLATES: [
      (storeName: string) => `${storeName} — Fresh Warehouse Collections Added Daily`,
      (storeName: string, feeFormatted: string) =>
        `${storeName} — Free Express Shipping Above ${feeFormatted}`,
      (storeName: string) =>
        `${storeName} — Tap Any Photo to View Full Multi-Angle Gallery`,
      (storeName: string) => `${storeName} — Direct Loom & Warehouse Prices`,
    ],

    ARIA: {
      OPEN_NAV: 'Open navigation menu',
      CLOSE_NAV: 'Close navigation menu',
      SEARCH_CATALOG: 'Browse and search catalog',
      BAG: 'Shopping bag',
      ACCOUNT_MENU: 'Open customer account menu drawer',
      MENU_DRAWER: 'Open customer menu drawer',
      CLOSE_DRAWER: 'Close customer drawer',
    },

    COPY: {
      GREETING_PREFIX: 'Namaste ',
      FALLBACK_INITIAL: 'U',
      SIGN_IN: 'Sign In',
      WELCOME_GUEST: 'Welcome Guest',
      GUEST_SUBTITLE: 'Sign in to shop & track orders',
      DRAWER_SECTION_TITLE: 'Your Account & Shopping',
      DRAWER_ORDERS_TITLE: 'My Orders & Delivery Status',
      DRAWER_ORDERS_SUBTITLE_AUTHENTICATED: (count: number) =>
        `${count} past ${count === 1 ? 'order' : 'orders'} & tracking`,
      DRAWER_ORDERS_SUBTITLE_GUEST: 'Track dispatches & delivered dates',
      DRAWER_INVOICES_TITLE: 'GST / Tax Invoices',
      DRAWER_INVOICES_SUBTITLE: 'View & print order bills',
      DRAWER_BAG_TITLE: (qty: number) => `Shopping Bag (${qty})`,
      DRAWER_BAG_SUBTITLE_AUTHENTICATED: (formattedSubtotal: string) =>
        `Subtotal: ${formattedSubtotal} — Proceed to buy`,
      DRAWER_BAG_SUBTITLE_EMPTY: 'View items in your bag',
      DRAWER_ADDRESSES_TITLE: 'Saved Addresses',
      DRAWER_ADDRESSES_SUBTITLE_AUTHENTICATED: (count: number) =>
        `${count} saved delivery ${count === 1 ? 'address' : 'addresses'}`,
      DRAWER_ADDRESSES_SUBTITLE_GUEST: 'Add or edit delivery addresses',
      LOGOUT: (firstName: string) => `Logout (${firstName})`,
      SIGN_IN_GOOGLE: 'Sign In with Google',
      FOOTER_TAGLINE: 'Fresh styles curated daily • Pan-India Delivery',
    },

    CLASSES: {
      MARQUEE_WRAPPER:
        'w-full max-w-[100vw] bg-stone-900 text-stone-100 text-[11px] sm:text-xs tracking-wider py-2 overflow-hidden border-b border-stone-800',
      MARQUEE_TRACK: 'animate-sudha-marquee',
      MARQUEE_ITEM:
        'inline-flex items-center gap-2 px-6 sm:px-8 font-medium whitespace-nowrap',
      MARQUEE_ICON: 'w-3.5 h-3.5 text-amber-300 shrink-0',
      HEADER:
        'sticky top-0 z-40 w-full max-w-[100vw] bg-white/95 backdrop-blur-md border-b border-stone-200/80',
      CONTAINER:
        'w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3',
      LEFT_WRAPPER: 'flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0',
      MOBILE_TOGGLE:
        'lg:hidden p-1.5 -ml-1 rounded-lg text-stone-800 hover:bg-stone-100 active:bg-stone-200 transition-colors shrink-0',
      TOGGLE_ICON: 'w-5 h-5 sm:w-6 sm:h-6',
      BRAND_LINK:
        'inline-flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap group',
      BRAND_TEXT:
        'font-serif text-[15px] sm:text-xl xl:text-2xl tracking-[0.08em] sm:tracking-[0.14em] font-bold animate-sudha-brand whitespace-nowrap inline-block',
      NAV: 'hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-stone-700 shrink-0',
      NAV_LINK: (isActive: boolean) =>
        `relative py-1 transition-colors hover:text-stone-950 flex items-center gap-1.5 whitespace-nowrap ${
          isActive ? 'text-stone-950 font-semibold' : ''
        }`,
      NAV_BADGE:
        'text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold whitespace-nowrap',
      RIGHT_WRAPPER: 'flex items-center gap-1.5 sm:gap-2.5 shrink-0',
      SEARCH_LINK:
        'p-1.5 sm:p-2 rounded-full text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors',
      SEARCH_ICON: 'w-4 h-4 sm:w-5 sm:h-5',
      BAG_LINK:
        'relative inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200 transition-all',
      BAG_ICON: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      BAG_COUNT: 'text-xs font-bold tabular-nums',
      AUTH_WRAPPER: 'flex items-center gap-1.5 sm:gap-2',
      NAMASTE_PILL:
        'hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-stone-950 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
      ONLINE_DOT: 'w-2 h-2 rounded-full bg-emerald-600 shrink-0',
      AVATAR_BUTTON:
        'relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 font-serif font-bold text-xs sm:text-sm flex items-center justify-center shadow-md ring-2 ring-amber-400/50 transition-transform active:scale-95 cursor-pointer shrink-0',
      STATUS_BADGE:
        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white',
      SIGN_IN_LINK:
        'hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs font-semibold transition-colors whitespace-nowrap',
      GUEST_AVATAR_BUTTON:
        'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shadow-md ring-2 ring-stone-200 transition-transform active:scale-95 cursor-pointer shrink-0',
      USER_ICON: 'w-4 h-4',

      DRAWER_BACKDROP: 'fixed inset-0 bg-stone-950/55 backdrop-blur-xs',
      DRAWER_ROOT: 'fixed inset-0 z-50 flex justify-end',
      DRAWER_PANEL:
        'relative w-[88%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto',
      DRAWER_HEADER:
        'p-5 bg-stone-900 text-white flex items-center justify-between gap-3',
      DRAWER_USER_BADGE:
        'w-11 h-11 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-300 font-serif font-bold text-base flex items-center justify-center shrink-0',
      DRAWER_USER_NAME:
        'font-serif text-lg font-semibold text-white truncate',
      DRAWER_USER_EMAIL: 'text-xs text-stone-300 truncate',
      DRAWER_CLOSE_BUTTON:
        'p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0',
      DRAWER_OPTIONS: 'p-4 space-y-2',
      DRAWER_LABEL:
        'px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-widest text-stone-400',
      DRAWER_CARD:
        'flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all group',
      DRAWER_CARD_LEFT: 'flex items-center gap-3',
      DRAWER_ICON_WRAP:
        'w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-800 flex items-center justify-center transition-colors',
      DRAWER_ICON_WRAP_AMBER:
        'w-10 h-10 rounded-xl bg-amber-100/80 group-hover:bg-stone-900 group-hover:text-white text-amber-950 flex items-center justify-center transition-colors',
      DRAWER_CARD_ICON: 'w-5 h-5',
      DRAWER_CARD_TITLE: 'text-sm font-semibold text-stone-950',
      DRAWER_CARD_SUBTITLE: 'text-xs text-stone-500',
      CHEVRON_ICON:
        'w-4 h-4 text-stone-400 group-hover:text-stone-900',
      DRAWER_FOOTER: 'p-4 border-t border-stone-200 bg-stone-50 space-y-2.5',
      LOGOUT_BUTTON:
        'w-full h-11 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer',
      SIGN_IN_BUTTON:
        'w-full h-11 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors',

      MOBILE_MENU_ROOT: 'fixed inset-0 z-50 lg:hidden flex',
      MOBILE_PANEL:
        'relative w-[84%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto',
      MOBILE_HEADER:
        'p-4 border-b border-stone-200 flex items-center justify-between gap-2',
      MOBILE_CLOSE_BTN: 'p-2 rounded-lg text-stone-600 hover:bg-stone-100',
      MOBILE_LIST: 'p-3 space-y-1',
      MOBILE_LINK:
        'flex items-center justify-between px-3 py-3 rounded-xl text-stone-800 hover:bg-stone-100 font-medium text-sm transition-colors',
      MOBILE_FOOTER:
        'p-4 border-t border-stone-200 bg-stone-50 space-y-2.5',
      MOBILE_ACCOUNT_BTN:
        'flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-stone-950 text-xs font-bold cursor-pointer',
      MOBILE_SIGNIN_LINK:
        'flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold',
    },
  },

  FOOTER: {
    COPY: {
      BRAND_STORY:
        'Curated contemporary Indian ethnic and resort wear. Sourced directly from artisan looms and partner warehouses with fresh collections dropping daily.',
      DISPATCH_ACROSS_INDIA: ' across India',
      EXCHANGE_AND_SECURE: ' • Secure online checkout',
      HEADING_CATEGORIES: 'Shop Categories',
      HEADING_CUSTOMER_CARE: 'Customer Care',
      RIGHTS_RESERVED: '. All rights reserved.',
      TAGLINE_BOTTOM:
        'SKU-Driven Catalog • Built for Mobile & WhatsApp Shoppers',
    },

    CATEGORIES_LINKS: [
      {
        href: '/shop?collection=new-collection',
        label: 'New Collection (Daily Drop)',
      },
      { href: '/shop?category=kurtis', label: 'Kurtis & Tunics' },
      { href: '/shop?category=co-ord-sets', label: 'Tailored Co-ord Sets' },
      { href: '/shop?category=suit-sets', label: 'Festive Suit Sets' },
      { href: '/shop?category=dresses', label: 'Dresses & Midis' },
    ] as const,

    CARE_LINKS: [
      { href: '/cart', label: 'View Shopping Bag' },
      { href: '/account', label: 'My Orders & Invoices' },
      { href: '/shop', label: 'Browse Full Catalog' },
    ] as const,

    CLASSES: {
      FOOTER:
        'bg-stone-950 text-stone-300 border-t border-stone-800 mt-20',
      CONTAINER:
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16',
      GRID: 'grid grid-cols-1 md:grid-cols-4 gap-10',
      BRAND_COL: 'md:col-span-2 space-y-4',
      BRAND_NAME:
        'font-serif text-xl tracking-[0.14em] font-semibold text-white whitespace-nowrap',
      BRAND_TEXT: 'text-sm text-stone-400 max-w-md leading-relaxed',
      BRAND_SHIPPING: 'pt-1 text-xs text-stone-400 space-y-1',
      COL_TITLE:
        'text-xs font-semibold uppercase tracking-widest text-white mb-4',
      LINKS_LIST: 'space-y-2.5 text-sm text-stone-400',
      LINK: 'hover:text-white transition-colors',
      BOTTOM_BAR:
        'mt-10 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500',
    },
  },

  HOME: {
    NEW_COLLECTION_LIMIT: 4,
    CURATED_PRODUCTS_LIMIT: 8,

    HERO: {
      TAG: 'Fresh Warehouse Drop • Ready to Ship Today',
      TITLE: 'Effortless Silhouettes for Every Occasion.',
      DESCRIPTION:
        'Explore our newest handpicked Kurtis, tailored Co-ord Sets, and festive Chanderi ensembles. New collections arrive daily straight from our partner looms.',
      CTA_NEW_COLLECTION: 'Shop New Collection',
      CTA_ALL_STYLES: 'View All Styles',
      IMAGE_1_SRC: '/products/sku-001-navy-blue.jpg',
      IMAGE_1_ALT: 'Midnight Navy Handcrafted Bandhej Suit Material',
      IMAGE_2_SRC: '/products/kb-8840-maroon-bandhani-anarkali.jpg',
      IMAGE_2_ALT: 'Deep Crimson Bandhani Flared Anarkali Gown',
      IMAGE_SIZES: '(max-width: 1024px) 50vw, 25vw',
    },

    NEW_COLLECTION: {
      TAG: 'Just Arrived',
      TITLE: 'New Collection — Daily Drop',
      LINK: 'Explore all new arrivals',
    },

    CATEGORIES: {
      TAG: 'Curated Wardrobes',
      TITLE: 'Shop by Category',
      EXPLORE_STYLES: 'Explore styles',
      IMAGE_SIZES: '(max-width: 640px) 50vw, 25vw',
    },

    TRENDING: {
      TAG: 'Complete Edit',
      TITLE: 'Trending Styles This Week',
      VIEW_ALL: (count: number) => `View all ${count} products`,
    },

    VALUE_PROPS: [
      {
        title: 'Direct Warehouse Dispatch',
        description:
          'Every SKU is stocked in our partner warehouses and dispatched within 24–48 hours with live tracking.',
      },
      {
        title: 'Authentic Fabrics & True Sizing',
        description:
          '100% pure mulmul cotton, breathable linen, and handloom Chanderi weaves inspected before shipping.',
      },
      {
        title: 'Hassle-Free Size Exchanges',
        description:
          'Need a different size? Request a quick 7-day size exchange with doorstep pickup support.',
      },
    ] as const,

    CLASSES: {
      CONTAINER: 'space-y-14 sm:space-y-20',
      HERO_SECTION: 'relative overflow-hidden bg-stone-900 text-white',
      HERO_GRID:
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center',
      HERO_LEFT: 'lg:col-span-6 space-y-6 z-10',
      HERO_TAG:
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-amber-200 text-xs font-medium tracking-wide',
      TAG_ICON: 'w-3.5 h-3.5',
      HERO_TITLE:
        'font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]',
      HERO_DESC:
        'text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl',
      HERO_BUTTONS: 'flex flex-wrap items-center gap-3 pt-2',
      PRIMARY_BUTTON:
        'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-950 font-semibold text-sm hover:bg-stone-100 transition-colors',
      SECONDARY_BUTTON:
        'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/15 transition-colors',
      ARROW_ICON: 'w-4 h-4',
      HERO_IMAGES_GRID: 'lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4',
      HERO_IMAGE_WRAPPER_1:
        'relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10',
      HERO_IMAGE_WRAPPER_2:
        'relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 mt-6 sm:mt-10',
      HERO_IMAGE: 'object-cover object-top',

      SECTION: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      SECTION_HEADER:
        'flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8',
      TAG_AMBER:
        'text-xs font-semibold uppercase tracking-widest text-amber-800',
      TAG_MUTED:
        'text-xs font-semibold uppercase tracking-widest text-stone-500',
      SECTION_TITLE:
        'font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1',
      HEADER_LINK:
        'inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors',
      PRODUCTS_GRID: 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6',
      CAT_GRID: 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
      CAT_CARD:
        'group relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200 block',
      CAT_IMAGE:
        'object-cover object-top transition-transform duration-500 group-hover:scale-105',
      CAT_OVERLAY:
        'absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent',
      CAT_TEXT_WRAP: 'absolute bottom-4 inset-x-4 text-white',
      CAT_NAME: 'font-serif text-lg sm:text-xl font-semibold',
      CAT_SUBTEXT:
        'text-xs text-stone-200 mt-0.5 inline-flex items-center gap-1',
      CAT_ARROW: 'w-3.5 h-3.5 transition-transform group-hover:translate-x-1',

      VALUE_GRID:
        'rounded-3xl bg-stone-100 border border-stone-200/80 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6',
      VALUE_ITEM: 'flex items-start gap-4',
      VALUE_ICON_BOX:
        'w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0',
      VALUE_ICON: 'w-5 h-5',
      VALUE_TITLE: 'text-sm font-semibold text-stone-900',
      VALUE_DESC: 'text-xs text-stone-600 mt-1 leading-relaxed',
    },
  },

  SHOP: {
    FILTER_ALL: 'all',
    SORT_NEWEST: 'newest',
    SORT_PRICE_ASC: 'price-asc',
    SORT_PRICE_DESC: 'price-desc',

    COPY: {
      COMPLETE_CATALOG: 'Complete Catalog',
      ALL_CLOTHING: 'All Clothing & Ensembles',
      SEARCH_PLACEHOLDER: 'Search by name, color, or SKU...',
      ALL_CATEGORIES: 'All Categories',
      COLLECTION_LABEL: 'Collection:',
      ALL: 'All',
      SIZE_LABEL: 'Size:',
      ANY_SIZE: 'Any',
      SORT_LABEL: 'Sort:',
      SORT_NEWEST: 'Newest',
      SORT_PRICE_LOW: 'Price: Low',
      SORT_PRICE_HIGH: 'Price: High',
      SHOWING: 'Showing ',
      STYLE_SINGULAR: 'style',
      STYLE_PLURAL: 'styles',
      RESET_FILTERS: 'Reset all filters',
      EMPTY_TITLE: 'No matching styles found',
      EMPTY_DESC:
        'Try clearing your category or size filter to browse our latest daily arrivals.',
      VIEW_ALL_PRODUCTS: 'View All Products',
    },

    CLASSES: {
      PAGE: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
      HEADER: 'border-b border-stone-200 pb-6 mb-6',
      HEADER_TOP:
        'flex flex-col md:flex-row md:items-end justify-between gap-4',
      COLLECTION_TAG:
        'text-xs font-semibold uppercase tracking-widest text-stone-500',
      TITLE:
        'font-serif text-3xl sm:text-4xl font-semibold text-stone-950 mt-1',
      DESCRIPTION: 'text-sm text-stone-600 mt-1.5 max-w-2xl',
      SEARCH_FORM: 'w-full md:w-72',
      SEARCH_ICON:
        'w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2',
      SEARCH_INPUT:
        'w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900',
      CAT_BAR:
        'mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar',
      CAT_PILL: (isActive: boolean) =>
        `px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
          isActive
            ? 'bg-stone-900 text-white'
            : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
        }`,
      SUB_BAR:
        'mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200/70',
      SUB_LEFT: 'flex flex-wrap items-center gap-2',
      FILTER_LABEL:
        'inline-flex items-center gap-1 text-xs font-medium text-stone-500 mr-1',
      SLIDERS_ICON: 'w-3.5 h-3.5',
      COL_PILL: (isActive: boolean) =>
        `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? 'bg-stone-200 text-stone-900 font-semibold'
            : 'text-stone-600 hover:bg-stone-100'
        }`,
      COL_PILL_AMBER: (isActive: boolean) =>
        `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? 'bg-amber-100 text-amber-950 font-semibold'
            : 'text-stone-600 hover:bg-stone-100'
        }`,
      SIZE_PILL: (isActive: boolean) =>
        `px-2 py-1 rounded-lg text-xs font-medium ${
          isActive
            ? 'bg-stone-900 text-white font-semibold'
            : 'text-stone-600 hover:bg-stone-100'
        }`,
      SIZE_PILL_ANY: (isActive: boolean) =>
        `px-2 py-1 rounded-lg text-xs font-medium ${
          isActive
            ? 'bg-stone-200 text-stone-900 font-semibold'
            : 'text-stone-600 hover:bg-stone-100'
        }`,
      DIVIDER: 'text-stone-300 mx-1 hidden sm:inline',
      SORT_BAR: 'flex items-center gap-2 text-xs',
      SORT_BOX:
        'inline-flex rounded-xl border border-stone-300 bg-white p-0.5',
      SORT_LINK: (isActive: boolean) =>
        `px-2.5 py-1 rounded-lg font-medium ${
          isActive
            ? 'bg-stone-900 text-white'
            : 'text-stone-600 hover:text-stone-900'
        }`,
      RESULTS_ROW:
        'flex items-center justify-between mb-6 text-xs text-stone-600',
      RESET_LINK:
        'inline-flex items-center gap-1 text-stone-900 font-semibold hover:underline',
      RESET_ICON: 'w-3.5 h-3.5',
      EMPTY_BOX:
        'rounded-3xl bg-white border border-stone-200 p-12 text-center max-w-md mx-auto my-8 space-y-4',
      EMPTY_TITLE: 'font-serif text-2xl font-semibold text-stone-900',
      EMPTY_DESC: 'text-xs text-stone-500 leading-relaxed',
      VIEW_ALL_BTN:
        'inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold',
    },
  },

  LAYOUT: {
    SHELL:
      'min-h-screen w-full max-w-[100vw] overflow-x-clip flex flex-col',
    MAIN: 'flex-1 w-full min-w-0',
  },
} as const;
