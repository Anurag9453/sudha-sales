// Page-scoped constants for: Login (consumed via AppConstants.Login)
export const LoginConstants = {
  ROUTES: {
    HOME: '/',
    SHOP: '/shop',
  },

  QUERY: {
    NEXT: 'next',
    REASON: 'reason',
    REASON_PURCHASE: 'purchase',
  },

  AUTH: {
    PROVIDER_GOOGLE: 'google',
    ENABLE_LIVE_GOOGLE_OAUTH_FLAG: 'true',
    DEFAULT_NAME: 'Ananya Sharma',
    DEFAULT_EMAIL: 'ananya.sharma@gmail.com',
    DEFAULT_PHONE: '+91 98765 43210',
    SIGN_IN_DELAY_MS: 550,
  },

  SVG_GOOGLE: {
    VIEW_BOX: '0 0 24 24',
    COLORS: {
      RED: '#EA4335',
      BLUE: '#4285F4',
      YELLOW: '#FBBC05',
      GREEN: '#34A853',
    },
    PATHS: {
      RED: 'M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z',
      BLUE: 'M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z',
      YELLOW:
        'M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z',
      GREEN:
        'M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z',
    },
  },

  INPUT_TYPES: {
    TEXT: 'text',
    TEL: 'tel',
    EMAIL: 'email',
  },

  BUTTON_TYPES: {
    SUBMIT: 'submit',
    BUTTON: 'button',
  },

  COPY: {
    SIGNING_IN_TITLE: (firstName: string) => `Namaste ${firstName}! Signing you in...`,
    LOADING_TITLE: 'Loading Sign In...',
    LOADING_SUBTITLE: 'Connecting your Google account, saved addresses & order history',
    FALLBACK_SPINNER_TITLE: 'Loading Customer Sign In...',
    FALLBACK_SPINNER_SUBTITLE: 'Preparing Google Authentication',
    BADGE_MEMBER_ACCESS: 'Member Access Required to Shop',
    HERO_TITLE: (storeName: string) => `Welcome to ${storeName}`,
    HERO_DESCRIPTION:
      'Sign in with your Google account to unlock purchasing, track live warehouse dispatches, download GST invoices, and manage your saved delivery addresses.',
    BENEFIT_ORDERS: 'View all past orders, delivery status & delivered dates',
    BENEFIT_INVOICES: 'Download printable tax invoices anytime',
    BENEFIT_ADDRESSES: 'Save & edit multiple delivery addresses',
    PURCHASE_REQUIRED_PREFIX: 'Please sign in to your ',
    PURCHASE_REQUIRED_SUFFIX:
      ' account before adding items or completing your purchase.',
    HEADING: 'Customer Sign In',
    SUBHEADING: 'Sign in with Google to continue to your account & shopping bag.',
    BOX_TITLE: 'Google Account Details (Customize your profile name)',
    LABEL_NAME: 'Your Name (Shown as "Namaste ...") *',
    LABEL_PHONE: 'WhatsApp / Mobile Number *',
    LABEL_EMAIL: 'Google Email Address *',
    PLACEHOLDER_NAME: 'Ananya Sharma',
    PLACEHOLDER_PHONE: '+91 98765 43210',
    PLACEHOLDER_EMAIL: 'ananya.sharma@gmail.com',
    CTA_CONTINUE_GOOGLE: 'Continue with Google',
    DIVIDER_UPCOMING: 'Upcoming Sign-In Option',
    CTA_PHONE_OTP: 'Sign in with Mobile Number OTP (Coming Soon)',
    TRUST_SECURE: '100% Secure Customer Account',
    LINK_BROWSE_CATALOG: 'Browse Catalog First →',
  },

  CLASSES: {
    PAGE_WRAPPER: 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16',
    CARD_GRID:
      'grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xl',
    LEFT_COL:
      'lg:col-span-5 bg-stone-900 text-white p-8 sm:p-10 flex flex-col justify-between space-y-8',
    LEFT_HEADER: 'space-y-4',
    BADGE:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-semibold',
    BADGE_ICON: 'w-3.5 h-3.5',
    HERO_TITLE: 'font-serif text-3xl sm:text-4xl font-semibold leading-tight',
    HERO_DESCRIPTION: 'text-xs sm:text-sm text-stone-300 leading-relaxed',
    BENEFITS_WRAPPER:
      'space-y-3 text-xs text-stone-300 border-t border-stone-800 pt-6',
    BENEFIT_ROW: 'flex items-center gap-2.5',
    CHECK_ICON: 'w-4 h-4 text-amber-300 shrink-0',
    RIGHT_COL: 'lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6',
    PURCHASE_ALERT:
      'p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5',
    PURCHASE_ALERT_ICON: 'w-4 h-4 text-amber-800 shrink-0',
    HEADING: 'font-serif text-2xl sm:text-3xl font-semibold text-stone-950',
    SUBHEADING: 'text-xs sm:text-sm text-stone-500 mt-1',
    FORM: 'space-y-4',
    FORM_BOX: 'p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3',
    BOX_TITLE: 'text-[11px] font-semibold uppercase tracking-wider text-stone-500',
    GRID_2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    LABEL: 'block text-xs font-medium text-stone-700 mb-1',
    INPUT: 'w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm',
    GOOGLE_BUTTON:
      'w-full h-13 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer active:scale-[0.99]',
    GOOGLE_ICON: 'w-5 h-5',
    ARROW_ICON: 'w-4 h-4',
    DIVIDER_WRAPPER: 'relative py-1',
    DIVIDER_LINE_WRAPPER: 'absolute inset-0 flex items-center',
    DIVIDER_LINE: 'w-full border-t border-stone-200',
    DIVIDER_TEXT_WRAPPER:
      'relative flex justify-center text-[11px] uppercase tracking-widest',
    DIVIDER_TEXT: 'bg-white px-3 text-stone-400',
    OTP_BUTTON:
      'w-full h-11 px-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed',
    PHONE_ICON: 'w-4 h-4',
    FOOTER_ROW:
      'pt-2 flex items-center justify-between text-xs text-stone-500',
    TRUST_BADGE: 'inline-flex items-center gap-1',
    SHIELD_ICON: 'w-4 h-4 text-emerald-700',
    CATALOG_LINK: 'font-semibold text-stone-800 hover:underline',
  },
} as const;
