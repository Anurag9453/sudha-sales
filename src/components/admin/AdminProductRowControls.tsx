// ============================================================================
// Admin Row Quick Controls: src/components/admin/AdminProductRowControls.tsx
// Inline stock adjuster and 1-click ACTIVE/INACTIVE status toggle.
// ============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import { Check, Power, Loader2 } from 'lucide-react';
import {
  quickToggleStatusAction,
  quickUpdateStockAction,
} from '@/app/admin/actions';
import type { ProductStatus } from '@/types/domain';

interface StockQuickControlProps {
  sku: string;
  initialStock: number;
}

export function StockQuickControl({
  sku,
  initialStock,
}: StockQuickControlProps) {
  const [stock, setStock] = useState<number>(initialStock);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSaveStock = () => {
    startTransition(async () => {
      const res = await quickUpdateStockAction(sku, stock);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={99999}
        value={stock}
        onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
        aria-label={`Stock for ${sku}`}
        className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold tabular-nums text-stone-900 bg-white focus:outline-none focus:border-stone-900"
      />
      <button
        type="button"
        disabled={isPending || stock === initialStock}
        onClick={handleSaveStock}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
          saved
            ? 'bg-emerald-700 text-white'
            : 'bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Saved
          </>
        ) : (
          'Update'
        )}
      </button>
    </div>
  );
}

interface StatusQuickToggleProps {
  sku: string;
  status: ProductStatus;
}

export function StatusQuickToggle({ sku, status }: StatusQuickToggleProps) {
  const [isPending, startTransition] = useTransition();
  const isActive = status === 'ACTIVE';

  const handleToggle = () => {
    const nextStatus: ProductStatus = isActive ? 'INACTIVE' : 'ACTIVE';
    startTransition(async () => {
      await quickToggleStatusAction(sku, nextStatus);
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      title={
        isActive
          ? 'Click to deactivate and hide from storefront'
          : 'Click to activate and publish on storefront'
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
        isActive
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Power className="w-3 h-3" />
      )}
      <span>{status}</span>
    </button>
  );
}
