// ============================================================================
// Cart Stock Validation API: src/app/api/cart/validate/route.ts
// Verifies live inventory for each item in the customer's cart so customers
// cannot proceed to checkout if any requested quantity exceeds warehouse stock.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { validateItemsStock } from '@/services/order.service';
import { AppConstants } from '@/constants/app.constants';
import type { CartItem } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { items: CartItem[] };

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ ok: true, valid: true, errors: [] });
    }

    const result = await validateItemsStock(body.items);

    return NextResponse.json({
      ok: true,
      valid: result.valid,
      errors: result.errors,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AppConstants.Api.MESSAGES.CART_VALIDATE_FAILED;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
