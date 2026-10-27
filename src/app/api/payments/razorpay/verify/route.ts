// ============================================================================
// Verify Razorpay Payment & Create Order API:
// File: src/app/api/payments/razorpay/verify/route.ts
// 1. Verifies the HMAC-SHA256 Razorpay signature (`razorpay_order_id|razorpay_payment_id`).
// 2. Persists the Customer, Order, and Order Items in Supabase PostgreSQL (or
//    local server store) and atomically decrements product stock by SKU.
// 3. Revalidates storefront and admin inventory pages.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyRazorpayPaymentSignature } from '@/services/razorpay.service';
import { createPersistedOrder } from '@/services/order.service';
import { AppConstants } from '@/constants/app.constants';
import type { CartItem, ShippingAddressSnapshot } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: ShippingAddressSnapshot;
      items: CartItem[];
      subtotalAmount: number;
      discountAmount: number;
      shippingAmount: number;
      totalAmount: number;
    };

    if (
      !body.razorpay_order_id ||
      !body.razorpay_payment_id ||
      !body.razorpay_signature
    ) {
      return NextResponse.json(
        { ok: false, error: 'Missing Razorpay payment verification parameters' },
        { status: 400 }
      );
    }

    const isSignatureValid = verifyRazorpayPaymentSignature({
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpaySignature: body.razorpay_signature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { ok: false, error: 'Razorpay payment signature verification failed' },
        { status: 400 }
      );
    }

    const order = await createPersistedOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      items: body.items,
      subtotalAmount: Number(body.subtotalAmount),
      discountAmount: Number(body.discountAmount),
      shippingAmount: Number(body.shippingAmount),
      totalAmount: Number(body.totalAmount),
      paymentProvider: AppConstants.Payments.PROVIDER_LABEL_RAZORPAY,
      paymentReference: body.razorpay_payment_id,
      paymentStatus: AppConstants.PaymentStatus.PAID,
    });

    // Revalidate storefront & admin pages so updated stock and new order show up
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    for (const item of body.items) {
      revalidatePath(`/product/${item.sku}`);
    }

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to verify payment & create order';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
