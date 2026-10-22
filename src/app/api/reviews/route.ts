// ============================================================================
// Product Reviews API: src/app/api/reviews/route.ts
// Saves a customer's 1–5 star rating and review comment onto the product record
// in Supabase PostgreSQL (and local fallback) and returns the updated reviews
// list, `average_rating`, and `review_count`.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { addProductReviewBySku } from '@/services/review.service';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sku: string;
      customerName: string;
      customerEmail?: string;
      rating: number;
      title?: string;
      comment: string;
      selectedSize?: string;
    };

    const result = await addProductReviewBySku({
      sku: body.sku,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      rating: Number(body.rating),
      title: body.title,
      comment: body.comment,
      selectedSize: body.selectedSize,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${body.sku.trim().toUpperCase()}`);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to submit product review';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
