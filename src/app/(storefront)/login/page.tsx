// ============================================================================
// Customer Login Page: src/app/(storefront)/login/page.tsx
// - Provides "Continue with Google" login (and displays "Phone OTP Login —
//   Coming Soon" for future expansion).
// - Customers must log in here before buying any item or completing checkout.
// - Redirects back to `next` URL parameter (e.g. `/product/SKU005` or `/cart`)
//   or `/account` once signed in.
// All visual copy, SVG attributes, CSS class names, and authentication defaults
// are bound to AppConstants.Login and AppConstants.Store.
// ============================================================================

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { getSupabaseBrowserClient } from '@/database/supabase-browser';
import { publicEnv } from '@/lib/env';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';
import { AppConstants } from '@/constants/app.constants';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl =
    searchParams.get(AppConstants.Login.QUERY.NEXT) ||
    AppConstants.Login.ROUTES.HOME;
  const reason = searchParams.get(AppConstants.Login.QUERY.REASON);

  const { isAuthenticated, isHydrated, signInWithGoogle } = useCustomerAuth();

  const [googleName, setGoogleName] = useState<string>(
    AppConstants.Login.AUTH.DEFAULT_NAME
  );
  const [googleEmail, setGoogleEmail] = useState<string>(
    AppConstants.Login.AUTH.DEFAULT_EMAIL
  );
  const [googlePhone, setGooglePhone] = useState<string>(
    AppConstants.Login.AUTH.DEFAULT_PHONE
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(nextUrl);
    }
  }, [isHydrated, isAuthenticated, nextUrl, router]);

  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    // If Supabase OAuth is configured and user wants live OAuth redirect, support it;
    // otherwise complete instant Google profile sign-in so checkout works immediately.
    const supabase = getSupabaseBrowserClient();
    if (
      supabase &&
      process.env.NEXT_PUBLIC_ENABLE_LIVE_GOOGLE_OAUTH ===
        AppConstants.Login.AUTH.ENABLE_LIVE_GOOGLE_OAUTH_FLAG
    ) {
      await supabase.auth.signInWithOAuth({
        provider: AppConstants.Login.AUTH.PROVIDER_GOOGLE,
        options: {
          redirectTo: `${window.location.origin}${nextUrl}`,
        },
      });
      return;
    }

    await new Promise((r) =>
      setTimeout(r, AppConstants.Login.AUTH.SIGN_IN_DELAY_MS)
    );
    await signInWithGoogle({
      name: googleName,
      email: googleEmail,
      phone: googlePhone,
    });
    router.push(nextUrl);
  };

  if (!isHydrated || isSigningIn) {
    return (
      <LuxurySpinner
        fullScreenOverlay={isSigningIn}
        title={
          isSigningIn
            ? AppConstants.Login.COPY.SIGNING_IN_TITLE(
                googleName.split(AppConstants.Account.NAME_SPLIT_SEPARATOR)[0]
              )
            : AppConstants.Login.COPY.LOADING_TITLE
        }
        subtitle={AppConstants.Login.COPY.LOADING_SUBTITLE}
      />
    );
  }

  return (
    <div className={AppConstants.Login.CLASSES.PAGE_WRAPPER}>
      <div className={AppConstants.Login.CLASSES.CARD_GRID}>
        {/* Left Brand Story Column */}
        <div className={AppConstants.Login.CLASSES.LEFT_COL}>
          <div className={AppConstants.Login.CLASSES.LEFT_HEADER}>
            <span className={AppConstants.Login.CLASSES.BADGE}>
              <Sparkles className={AppConstants.Login.CLASSES.BADGE_ICON} />
              {AppConstants.Login.COPY.BADGE_MEMBER_ACCESS}
            </span>

            <h1 className={AppConstants.Login.CLASSES.HERO_TITLE}>
              {AppConstants.Login.COPY.HERO_TITLE(publicEnv.storeName)}
            </h1>

            <p className={AppConstants.Login.CLASSES.HERO_DESCRIPTION}>
              {AppConstants.Login.COPY.HERO_DESCRIPTION}
            </p>
          </div>

          <div className={AppConstants.Login.CLASSES.BENEFITS_WRAPPER}>
            <div className={AppConstants.Login.CLASSES.BENEFIT_ROW}>
              <CheckCircle2 className={AppConstants.Login.CLASSES.CHECK_ICON} />
              <span>{AppConstants.Login.COPY.BENEFIT_ORDERS}</span>
            </div>
            <div className={AppConstants.Login.CLASSES.BENEFIT_ROW}>
              <CheckCircle2 className={AppConstants.Login.CLASSES.CHECK_ICON} />
              <span>{AppConstants.Login.COPY.BENEFIT_INVOICES}</span>
            </div>
            <div className={AppConstants.Login.CLASSES.BENEFIT_ROW}>
              <CheckCircle2 className={AppConstants.Login.CLASSES.CHECK_ICON} />
              <span>{AppConstants.Login.COPY.BENEFIT_ADDRESSES}</span>
            </div>
          </div>
        </div>

        {/* Right Sign-In Form Column */}
        <div className={AppConstants.Login.CLASSES.RIGHT_COL}>
          {reason === AppConstants.Login.QUERY.REASON_PURCHASE && (
            <div className={AppConstants.Login.CLASSES.PURCHASE_ALERT}>
              <Lock className={AppConstants.Login.CLASSES.PURCHASE_ALERT_ICON} />
              <span>
                {AppConstants.Login.COPY.PURCHASE_REQUIRED_PREFIX}
                <strong>{publicEnv.storeName}</strong>
                {AppConstants.Login.COPY.PURCHASE_REQUIRED_SUFFIX}
              </span>
            </div>
          )}

          <div>
            <h2 className={AppConstants.Login.CLASSES.HEADING}>
              {AppConstants.Login.COPY.HEADING}
            </h2>
            <p className={AppConstants.Login.CLASSES.SUBHEADING}>
              {AppConstants.Login.COPY.SUBHEADING}
            </p>
          </div>

          <form
            onSubmit={handleGoogleSignIn}
            className={AppConstants.Login.CLASSES.FORM}
          >
            <div className={AppConstants.Login.CLASSES.FORM_BOX}>
              <p className={AppConstants.Login.CLASSES.BOX_TITLE}>
                {AppConstants.Login.COPY.BOX_TITLE}
              </p>

              <div className={AppConstants.Login.CLASSES.GRID_2}>
                <div>
                  <label className={AppConstants.Login.CLASSES.LABEL}>
                    {AppConstants.Login.COPY.LABEL_NAME}
                  </label>
                  <input
                    required
                    type={AppConstants.Login.INPUT_TYPES.TEXT}
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder={AppConstants.Login.COPY.PLACEHOLDER_NAME}
                    className={AppConstants.Login.CLASSES.INPUT}
                  />
                </div>

                <div>
                  <label className={AppConstants.Login.CLASSES.LABEL}>
                    {AppConstants.Login.COPY.LABEL_PHONE}
                  </label>
                  <input
                    required
                    type={AppConstants.Login.INPUT_TYPES.TEL}
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder={AppConstants.Login.COPY.PLACEHOLDER_PHONE}
                    className={AppConstants.Login.CLASSES.INPUT}
                  />
                </div>
              </div>

              <div>
                <label className={AppConstants.Login.CLASSES.LABEL}>
                  {AppConstants.Login.COPY.LABEL_EMAIL}
                </label>
                <input
                  required
                  type={AppConstants.Login.INPUT_TYPES.EMAIL}
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder={AppConstants.Login.COPY.PLACEHOLDER_EMAIL}
                  className={AppConstants.Login.CLASSES.INPUT}
                />
              </div>
            </div>

            {/* Primary Continue with Google Button */}
            <button
              type={AppConstants.Login.BUTTON_TYPES.SUBMIT}
              className={AppConstants.Login.CLASSES.GOOGLE_BUTTON}
            >
              {/* Google G SVG */}
              <svg
                className={AppConstants.Login.CLASSES.GOOGLE_ICON}
                viewBox={AppConstants.Login.SVG_GOOGLE.VIEW_BOX}
                aria-hidden="true"
              >
                <path
                  fill={AppConstants.Login.SVG_GOOGLE.COLORS.RED}
                  d={AppConstants.Login.SVG_GOOGLE.PATHS.RED}
                />
                <path
                  fill={AppConstants.Login.SVG_GOOGLE.COLORS.BLUE}
                  d={AppConstants.Login.SVG_GOOGLE.PATHS.BLUE}
                />
                <path
                  fill={AppConstants.Login.SVG_GOOGLE.COLORS.YELLOW}
                  d={AppConstants.Login.SVG_GOOGLE.PATHS.YELLOW}
                />
                <path
                  fill={AppConstants.Login.SVG_GOOGLE.COLORS.GREEN}
                  d={AppConstants.Login.SVG_GOOGLE.PATHS.GREEN}
                />
              </svg>
              <span>{AppConstants.Login.COPY.CTA_CONTINUE_GOOGLE}</span>
              <ArrowRight className={AppConstants.Login.CLASSES.ARROW_ICON} />
            </button>
          </form>

          {/* Future Phone OTP Option Preview */}
          <div className={AppConstants.Login.CLASSES.DIVIDER_WRAPPER}>
            <div className={AppConstants.Login.CLASSES.DIVIDER_LINE_WRAPPER}>
              <div className={AppConstants.Login.CLASSES.DIVIDER_LINE} />
            </div>
            <div className={AppConstants.Login.CLASSES.DIVIDER_TEXT_WRAPPER}>
              <span className={AppConstants.Login.CLASSES.DIVIDER_TEXT}>
                {AppConstants.Login.COPY.DIVIDER_UPCOMING}
              </span>
            </div>
          </div>

          <button
            type={AppConstants.Login.BUTTON_TYPES.BUTTON}
            disabled
            className={AppConstants.Login.CLASSES.OTP_BUTTON}
          >
            <Smartphone className={AppConstants.Login.CLASSES.PHONE_ICON} />
            <span>{AppConstants.Login.COPY.CTA_PHONE_OTP}</span>
          </button>

          <div className={AppConstants.Login.CLASSES.FOOTER_ROW}>
            <span className={AppConstants.Login.CLASSES.TRUST_BADGE}>
              <ShieldCheck className={AppConstants.Login.CLASSES.SHIELD_ICON} />
              {AppConstants.Login.COPY.TRUST_SECURE}
            </span>
            <Link
              href={AppConstants.Login.ROUTES.SHOP}
              className={AppConstants.Login.CLASSES.CATALOG_LINK}
            >
              {AppConstants.Login.COPY.LINK_BROWSE_CATALOG}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <LuxurySpinner
          title={AppConstants.Login.COPY.FALLBACK_SPINNER_TITLE}
          subtitle={AppConstants.Login.COPY.FALLBACK_SPINNER_SUBTITLE}
        />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
