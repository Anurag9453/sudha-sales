// ============================================================================
// Global & Reusable Loading Spinner: src/components/ui/LuxurySpinner.tsx
// Glassmorphic fashion-brand loading overlay and inline spinner so the user
// always gets immediate, high-craft visual feedback on page transitions and
// button actions.
// ============================================================================

import React from 'react';
import { Sparkles } from 'lucide-react';
import { publicEnv } from '@/lib/env';

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
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[3px] border-stone-200" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-stone-900 border-r-amber-700 animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-amber-500 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
        />
        <Sparkles className="w-5 h-5 text-amber-700 animate-pulse" />
      </div>

      <div className="space-y-1">
        <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-800 font-semibold">
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
