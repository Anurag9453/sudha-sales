// ============================================================================
// Global & Reusable Loading Spinner: src/components/ui/LuxurySpinner.tsx
// Glassmorphic fashion-brand loading overlay and inline spinner so the user
// always gets immediate, high-craft visual feedback on page transitions and
// button actions.
// ============================================================================

import React from 'react';
import { Sparkles } from 'lucide-react';
import { publicEnv } from '@/lib/env';

interface SudhaSpinnerBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

export function SudhaSpinnerBadge({
  size = 'lg',
  theme = 'light',
}: SudhaSpinnerBadgeProps) {
  const dimensions =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'md'
        ? 'w-11 h-11'
        : 'w-16 h-16';
  const iconDimensions =
    size === 'sm'
      ? 'w-3 h-3'
      : size === 'md'
        ? 'w-4 h-4'
        : 'w-5 h-5';
  const innerInset = size === 'sm' ? 'inset-1' : 'inset-2';

  const baseRingColor =
    theme === 'dark' ? 'border-stone-700/80' : 'border-stone-200';
  const primarySpinColor =
    theme === 'dark'
      ? 'border-t-amber-300 border-r-amber-500'
      : 'border-t-stone-900 border-r-amber-700';
  const secondarySpinColor =
    theme === 'dark' ? 'border-b-amber-400' : 'border-b-amber-500';
  const sparkleColor =
    theme === 'dark' ? 'text-amber-300' : 'text-amber-700';

  return (
    <div className={`relative ${dimensions} shrink-0 flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-full border-[2.5px] ${baseRingColor}`} />
      <div
        className={`absolute inset-0 rounded-full border-[2.5px] border-transparent ${primarySpinColor} animate-spin`}
      />
      <div
        className={`absolute ${innerInset} rounded-full border-[2px] border-transparent ${secondarySpinColor} animate-spin`}
        style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
      />
      <Sparkles className={`${iconDimensions} ${sparkleColor} animate-pulse`} />
    </div>
  );
}

interface LuxurySpinnerProps {
  title?: string;
  subtitle?: string;
  fullScreenOverlay?: boolean;
}

export function LuxurySpinner({
  title = 'Curating Collection...',
  subtitle = 'Please wait a moment',
  fullScreenOverlay = false,
}: LuxurySpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-stone-200/90 shadow-2xl max-w-sm w-full mx-4 space-y-4">
      {/* Dual-Ring Animated Luxury Spinner */}
      <SudhaSpinnerBadge size="lg" theme="light" />

      <div className="space-y-1">
        <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-800 font-semibold whitespace-nowrap">
          {publicEnv.storeName}
        </p>
        <h3 className="font-serif text-xl font-semibold text-stone-950">
          {title}
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );

  if (fullScreenOverlay) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[55vh] w-full flex items-center justify-center p-6"
    >
      {content}
    </div>
  );
}
