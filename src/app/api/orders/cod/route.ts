// ============================================================================
// Cash on Delivery (COD) Order Creation API:
// File: src/app/api/orders/cod/route.ts
// Persists a verified Customer, Order, and Order Items in Supabase PostgreSQL
// (with `payment_status: 'PENDING'` and `payment_provider: 'Cash on Delivery (COD)'`),
// atomically decrements product stock by SKU, and revalidates storefront & admin pages.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPersistedOrder } from '@/services/order.service';
import type { CartItem, ShippingAddressSnapshot } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
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

    if (!body.customerPhone || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Missing customer details or cart items for COD order' },
        { status: 400 }
      );
    }

    const codReference = `COD-${Date.now()}`;

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
      paymentProvider: 'Cash on Delivery (Pay at Doorstep)',
      paymentReference: codReference,
      paymentStatus: 'PENDING',
    });

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
      codReference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create Cash on Delivery order';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
