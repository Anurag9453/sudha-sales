// ============================================================================
// Admin Login Gate: src/components/admin/AdminLoginGate.tsx
// ============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { loginAdminAction } from '@/app/admin/actions';
import { publicEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';

export function AdminLoginGate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy = AppConstants.Admin.COPY.LOGIN_GATE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAdminAction(passcode);
      if (!res.ok) {
        setError(res.message || copy.ERROR_DEFAULT);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-100">
      <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            {publicEnv.storeName}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            {copy.TITLE}
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            {copy.SUBTITLE}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {copy.LABEL_PASSCODE}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={copy.PLACEHOLDER_PASSCODE}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {copy.HINT_PREFIX}<code className="font-mono">{copy.HINT_CODE}</code>.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-stone-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            <span>{isPending ? copy.BTN_VERIFYING : copy.BTN_UNLOCK}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center">
          <Link
            href={AppConstants.Admin.ROUTES.STOREFRONT}
            className="text-xs font-semibold text-stone-600 hover:text-stone-950"
          >
            {copy.LINK_STOREFRONT}
          </Link>
        </div>
      </div>
    </div>
  );
}
