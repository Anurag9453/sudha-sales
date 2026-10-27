// ============================================================================
// Admin Order Status Control: src/components/admin/AdminOrderStatusControl.tsx
// ============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { updateAdminOrderStatusAction } from '@/app/admin/actions';
import type { OrderStatus } from '@/types/domain';
import { AppConstants } from '@/constants/app.constants';

export function AdminOrderStatusControl({
  orderNumber,
  initialStatus,
}: {
  orderNumber: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (nextStatus: OrderStatus) => {
    setStatus(nextStatus);
    startTransition(async () => {
      const res = await updateAdminOrderStatusAction(orderNumber, nextStatus);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <select
        disabled={isPending}
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
      >
        {AppConstants.Admin.ORDER_STATUSES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </select>

      {isPending && <Loader2 className="w-4 h-4 animate-spin text-stone-500" />}
      {saved && !isPending && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <Check className="w-3.5 h-3.5" />
          {AppConstants.Admin.COPY.CONTROLS.SAVED}
        </span>
      )}
    </div>
  );
}
