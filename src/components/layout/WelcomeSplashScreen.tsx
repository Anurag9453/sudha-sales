// ============================================================================
// Welcome Splash Screen: src/components/layout/WelcomeSplashScreen.tsx
// Displays a luxury brand splash overlay ("Welcome to Sudha Sales" + logo)
// when a shopper first opens the website, then smoothly fades out.
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SudhaSpinnerBadge } from '@/components/ui/LuxurySpinner';
import { publicEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';

const SPLASH_SESSION_KEY = 'sudha_sales_welcome_splash_seen_v1';

export function WelcomeSplashScreen() {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem(SPLASH_SESSION_KEY);
      if (alreadySeen === '1') {
        setShouldRender(false);
        return;
      }
      sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // Ignore storage errors in private browsing modes
    }

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  const handleDismissEarly = () => {
    setIsFadingOut(true);
    setTimeout(() => setShouldRender(false), 450);
  };

  return (
    <div
      role="dialog"
      aria-label="Welcome to Sudha Sales"
      onClick={handleDismissEarly}
      className={`fixed inset-0 z-[100] bg-stone-950 text-white flex flex-col items-center justify-center px-6 select-none cursor-pointer transition-all duration-700 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Radial Golden Glow */}
      <div
        aria-hidden="true"
        className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-6">
        {/* Website Logo Emblem + Single-Line Brand Mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-white/5 border border-amber-300/25 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <SudhaSpinnerBadge size="lg" theme="dark" />
          </div>

          <span className="font-serif text-xl sm:text-2xl tracking-[0.22em] font-bold animate-sudha-brand whitespace-nowrap">
            {publicEnv.storeName}
          </span>
        </div>

        {/* Ornamental Divider */}
        <div className="flex items-center gap-3 text-amber-300/80">
          <span className="w-10 sm:w-14 h-px bg-gradient-to-r from-transparent to-amber-300/70" />
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="w-10 sm:w-14 h-px bg-gradient-to-l from-transparent to-amber-300/70" />
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-white">
            Welcome to {AppConstants.Store.NAME}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 tracking-wider uppercase">
            Handpicked Bandhej, Sarees &amp; Festive Collections
          </p>
        </div>

        {/* Smooth Progress Indicator */}
        <div className="w-40 h-1 rounded-full bg-stone-800 overflow-hidden mt-2">
          <div className="h-full w-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 animate-pulse origin-left" />
        </div>
      </div>
    </div>
  );
}
