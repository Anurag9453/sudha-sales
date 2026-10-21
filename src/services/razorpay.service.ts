// ============================================================================
// Razorpay Payment Service: src/services/razorpay.service.ts
// Handles server-side Razorpay Order creation (`POST https://api.razorpay.com/v1/orders`)
// and HMAC-SHA256 payment signature verification (`razorpay_order_id|razorpay_payment_id`).
// Also supports a seamless Simulated Test Mode when live Razorpay keys are not
// yet present in `.env.local` so the full checkout flow can be tested anytime.
// ============================================================================

import crypto from 'crypto';
import { getServerEnv, isRazorpayConfigured } from '@/lib/env';

export interface RazorpayOrderSession {
  mode: 'live-razorpay' | 'simulated-razorpay';
  razorpayOrderId: string;
  amountInPaise: number;
  currency: 'INR';
  keyId: string;
  receipt: string;
}

/**
 * Computes the expected Razorpay HMAC-SHA256 signature for
 * `${razorpayOrderId}|${razorpayPaymentId}`.
 */
export function computeRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

/**
 * Verifies the signature returned by Razorpay Checkout.
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!isRazorpayConfigured()) {
    // Accept simulated test signatures starting with `sim_sig_`
    return params.razorpaySignature.startsWith('sim_sig_');
  }

  const { razorpayKeySecret } = getServerEnv();
  const expected = computeRazorpaySignature(
    params.razorpayOrderId,
    params.razorpayPaymentId,
    razorpayKeySecret
  );

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(params.razorpaySignature, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Creates a Razorpay order via Razorpay's v1 Orders API (or generates a
 * deterministic simulated order when Razorpay credentials aren't configured yet).
 */
export async function createRazorpayOrderSession(params: {
  amountInRupees: number;
  receipt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<RazorpayOrderSession> {
  const amountInPaise = Math.round(params.amountInRupees * 100);

  if (!isRazorpayConfigured()) {
    return {
      mode: 'simulated-razorpay',
      razorpayOrderId: `order_sim_${Date.now()}`,
      amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_simulated',
      receipt: params.receipt,
    };
  }

  const { razorpayKeyId, razorpayKeySecret } = getServerEnv();
  const basicAuth = Buffer.from(
    `${razorpayKeyId}:${razorpayKeySecret}`
  ).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: {
        customer_name: params.customerName || '',
        customer_email: params.customerEmail || '',
        customer_phone: params.customerPhone || '',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Razorpay order creation failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    id: string;
    amount: number;
    currency: 'INR';
    receipt: string;
  };

  return {
    mode: 'live-razorpay',
    razorpayOrderId: data.id,
    amountInPaise: data.amount,
    currency: data.currency,
    keyId: razorpayKeyId,
    receipt: data.receipt,
  };
}
