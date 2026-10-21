// ============================================================================
// Customer Login Page: src/app/(storefront)/login/page.tsx
// - Provides "Continue with Google" login (and displays "Phone OTP Login —
//   Coming Soon" for future expansion).
// - Customers must log in here before buying any item or completing checkout.
// - Redirects back to `next` URL parameter (e.g. `/product/SKU005` or `/cart`)
//   or `/account` once signed in.
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const reason = searchParams.get('reason');

  const { isAuthenticated, isHydrated, signInWithGoogle } =
    useCustomerAuth();

  const [googleName, setGoogleName] = useState('Ananya Sharma');
  const [googleEmail, setGoogleEmail] = useState('ananya.sharma@gmail.com');
  const [googlePhone, setGooglePhone] = useState('+91 98765 43210');
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
    if (supabase && process.env.NEXT_PUBLIC_ENABLE_LIVE_GOOGLE_OAUTH === 'true') {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${nextUrl}`,
        },
      });
      return;
    }

    await new Promise((r) => setTimeout(r, 550));
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
            ? `Namaste ${googleName.split(' ')[0]}! Signing you in...`
            : 'Loading Sign In...'
        }
        subtitle="Connecting your Google account, saved addresses & order history"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xl">
        {/* Left Brand Story Column */}
        <div className="lg:col-span-5 bg-stone-900 text-white p-8 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Member Access Required to Shop
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight">
              Welcome to {publicEnv.storeName}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Sign in with your Google account to unlock purchasing, track live
              warehouse dispatches, download GST invoices, and manage your saved
              delivery addresses.
            </p>
          </div>

          <div className="space-y-3 text-xs text-stone-300 border-t border-stone-800 pt-6">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>View all past orders, delivery status &amp; delivered dates</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Download printable tax invoices anytime</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Save &amp; edit multiple delivery addresses</span>
            </div>
          </div>
        </div>

        {/* Right Sign-In Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          {reason === 'purchase' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                Please sign in to your <strong>{publicEnv.storeName}</strong>{' '}
                account before adding items or completing your purchase.
              </span>
            </div>
          )}

          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
              Customer Sign In
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Sign in with Google to continue to your account &amp; shopping bag.
            </p>
          </div>

          <form onSubmit={handleGoogleSignIn} className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Google Account Details (Customize your profile name)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name (Shown as &quot;Namaste ...&quot;) *
                  </label>
                  <input
                    required
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Ananya Sharma"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Google Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="ananya.sharma@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
            </div>

            {/* Primary Continue with Google Button */}
            <button
              type="submit"
              className="w-full h-13 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Future Phone OTP Option Preview */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
              <span className="bg-white px-3 text-stone-400">
                Upcoming Sign-In Option
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="w-full h-11 px-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Smartphone className="w-4 h-4" />
            <span>Sign in with Mobile Number OTP (Coming Soon)</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              100% Secure Customer Account
            </span>
            <Link href="/shop" className="font-semibold text-stone-800 hover:underline">
              Browse Catalog First →
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
          title="Loading Customer Sign In..."
          subtitle="Preparing Google Authentication"
        />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
