// ============================================================================
// Create Razorpay Order API: src/app/api/payments/razorpay/create-order/route.ts
// Called by the Cart page when the customer clicks "Pay Online via Razorpay".
// Returns the Razorpay Order ID, amount in paise, and key_id.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrderSession } from '@/services/razorpay.service';
import { validateItemsStock } from '@/services/order.service';
import { AppConstants } from '@/constants/app.constants';
import type { CartItem } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      amountInRupees: number;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      items?: CartItem[];
    };

    const amount = Number(body.amountInRupees);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: AppConstants.Api.MESSAGES.INVALID_ORDER_AMOUNT },
        { status: 400 }
      );
    }

    // Pre-flight check: ensure requested items do not exceed current stock
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const stockCheck = await validateItemsStock(body.items);
      if (!stockCheck.valid) {
        return NextResponse.json(
          {
            ok: false,
            error:
              stockCheck.errors[0]?.message ||
              AppConstants.Api.MESSAGES.ITEMS_EXCEED_STOCK_GENERIC,
          },
          { status: 400 }
        );
      }
    }

    const receipt = `${AppConstants.Api.DEFAULTS.RECEIPT_PREFIX}${Date.now()}`;
    const session = await createRazorpayOrderSession({
      amountInRupees: amount,
      receipt,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
    });

    return NextResponse.json({
      ok: true,
      session,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AppConstants.Api.MESSAGES.CREATE_RAZORPAY_ORDER_FAILED;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
