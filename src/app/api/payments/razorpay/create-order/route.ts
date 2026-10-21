// ============================================================================
// Create Razorpay Order API: src/app/api/payments/razorpay/create-order/route.ts
// Called by the Cart page when the customer clicks "Pay Online via Razorpay".
// Returns the Razorpay Order ID, amount in paise, and key_id.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrderSession } from '@/services/razorpay.service';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      amountInRupees: number;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    const amount = Number(body.amountInRupees);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${Date.now()}`;
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
      err instanceof Error ? err.message : 'Failed to create Razorpay order';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
