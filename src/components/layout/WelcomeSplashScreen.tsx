// ============================================================================
// Welcome Splash Screen: src/components/layout/WelcomeSplashScreen.tsx
// Displays a luxury brand splash overlay (e.g. "Welcome to Sudha Sales" + logo)
// when a shopper first opens the website, then smoothly fades out.
// All copy, timings, accessibility attributes & class names come from
// AppConstants.WelcomeSplash / AppConstants.Store (no hardcoded values here).
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SudhaSpinnerBadge } from '@/components/ui/LuxurySpinner';
import { AppConstants } from '@/constants/app.constants';

const SPLASH = AppConstants.WelcomeSplash;
const CLS = SPLASH.CLASSES;

export function WelcomeSplashScreen() {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem(SPLASH.SESSION_KEY);
      if (alreadySeen === SPLASH.SESSION_SEEN_VALUE) {
        setShouldRender(false);
        return;
      }
      sessionStorage.setItem(SPLASH.SESSION_KEY, SPLASH.SESSION_SEEN_VALUE);
    } catch {
      // Ignore storage errors in private browsing modes
    }

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, SPLASH.FADE_OUT_DELAY_MS);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, SPLASH.REMOVE_DELAY_MS);

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
    setTimeout(() => setShouldRender(false), SPLASH.DISMISS_EARLY_DELAY_MS);
  };

  return (
    <div
      role={SPLASH.ARIA_ROLE}
      aria-label={SPLASH.ARIA_LABEL}
      onClick={handleDismissEarly}
      className={`${CLS.ROOT_BASE} ${
        isFadingOut ? CLS.ROOT_FADING : CLS.ROOT_VISIBLE
      }`}
    >
      {/* Ambient Radial Golden Glow */}
      <div aria-hidden={SPLASH.ARIA_HIDDEN} className={CLS.GLOW} />

      <div className={CLS.CONTENT}>
        {/* Website Logo Emblem + Single-Line Brand Mark */}
        <div className={CLS.BRAND_WRAPPER}>
          <div className={CLS.LOGO_RING}>
            <SudhaSpinnerBadge
              size={SPLASH.BADGE_SIZE}
              theme={SPLASH.BADGE_THEME}
            />
          </div>

          <span className={CLS.BRAND_MARK}>{AppConstants.Store.NAME}</span>
        </div>

        {/* Ornamental Divider */}
        <div className={CLS.DIVIDER}>
          <span className={CLS.DIVIDER_LINE_LEFT} />
          <Sparkles className={CLS.DIVIDER_ICON} />
          <span className={CLS.DIVIDER_LINE_RIGHT} />
        </div>

        {/* Welcome Message */}
        <div className={CLS.MESSAGE_WRAPPER}>
          <h1 className={CLS.TITLE}>
            {SPLASH.TITLE_PREFIX} {AppConstants.Store.NAME}
          </h1>
          <p className={CLS.SUBTITLE}>{SPLASH.SUBTITLE}</p>
        </div>

        {/* Smooth Progress Indicator */}
        <div className={CLS.PROGRESS_TRACK}>
          <div className={CLS.PROGRESS_BAR} />
        </div>
      </div>
    </div>
  );
}
