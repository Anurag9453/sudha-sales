// ============================================================================
// Global & Reusable Loading Spinner: src/components/ui/LuxurySpinner.tsx
// Glassmorphic fashion-brand loading overlay and inline spinner so the user
// always gets immediate, high-craft visual feedback on page transitions and
// button actions.
// Bound to AppConstants.Storefront.SPINNER and AppConstants.Store.
// ============================================================================

import React from 'react';
import { Sparkles } from 'lucide-react';
import { publicEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';

interface SudhaSpinnerBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export function SudhaSpinnerBadge({
  size = 'lg',
  theme = 'light',
}: SudhaSpinnerBadgeProps) {
  const isDark = theme === 'dark';
  const dimensions =
    size === 'sm'
      ? AppConstants.Storefront.SPINNER.DIMENSIONS.SM
      : size === 'md'
      ? AppConstants.Storefront.SPINNER.DIMENSIONS.MD
      : AppConstants.Storefront.SPINNER.DIMENSIONS.LG;
  const iconDimensions =
    size === 'sm'
      ? AppConstants.Storefront.SPINNER.ICON_DIMENSIONS.SM
      : size === 'md'
      ? AppConstants.Storefront.SPINNER.ICON_DIMENSIONS.MD
      : AppConstants.Storefront.SPINNER.ICON_DIMENSIONS.LG;
  const innerInset =
    size === 'sm'
      ? AppConstants.Storefront.SPINNER.INSETS.SM
      : AppConstants.Storefront.SPINNER.INSETS.DEFAULT;

  return (
    <div
      className={`${AppConstants.Storefront.SPINNER.CLASSES.BASE_BADGE} ${dimensions}`}
    >
      <div
        className={AppConstants.Storefront.SPINNER.CLASSES.BASE_RING(isDark)}
      />
      <div
        className={AppConstants.Storefront.SPINNER.CLASSES.PRIMARY_SPIN(
          isDark
        )}
      />
      <div
        className={AppConstants.Storefront.SPINNER.CLASSES.SECONDARY_SPIN(
          innerInset,
          isDark
        )}
        style={{
          animationDirection:
            AppConstants.Storefront.SPINNER.ANIMATION_DIRECTION_REVERSE,
          animationDuration:
            AppConstants.Storefront.SPINNER.ANIMATION_DURATION_SECONDARY,
        }}
      />
      <Sparkles
        className={`${iconDimensions} ${AppConstants.Storefront.SPINNER.CLASSES.SPARKLE_ICON(
          isDark
        )}`}
      />
    </div>
  );
}

interface LuxurySpinnerProps {
  title?: string;
  subtitle?: string;
  fullScreenOverlay?: boolean;
}

export function LuxurySpinner({
  title = AppConstants.Storefront.SPINNER.DEFAULT_TITLE,
  subtitle = AppConstants.Storefront.SPINNER.DEFAULT_SUBTITLE,
  fullScreenOverlay = false,
}: LuxurySpinnerProps) {
  const content = (
    <div className={AppConstants.Storefront.SPINNER.CLASSES.CONTENT_BOX}>
      {/* Dual-Ring Animated Luxury Spinner */}
      <SudhaSpinnerBadge size="lg" theme="light" />

      <div className="space-y-1">
        <p className={AppConstants.Storefront.SPINNER.CLASSES.BRAND_TITLE}>
          {publicEnv.storeName}
        </p>
        <h3 className={AppConstants.Storefront.SPINNER.CLASSES.TITLE}>
          {title}
        </h3>
        <p className={AppConstants.Storefront.SPINNER.CLASSES.SUBTITLE}>
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (fullScreenOverlay) {
    return (
      <div
        role={AppConstants.Storefront.SPINNER.ROLE_STATUS}
        aria-live={AppConstants.Storefront.SPINNER.ARIA_LIVE}
        className={AppConstants.Storefront.SPINNER.CLASSES.OVERLAY}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      role={AppConstants.Storefront.SPINNER.ROLE_STATUS}
      aria-live={AppConstants.Storefront.SPINNER.ARIA_LIVE}
      className={AppConstants.Storefront.SPINNER.CLASSES.INLINE}
    >
      {content}
    </div>
  );
}
