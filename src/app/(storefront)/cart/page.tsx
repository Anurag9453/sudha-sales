// ============================================================================
// Shopping Cart & Checkout Page: src/app/(storefront)/cart/page.tsx
// - Enforces Customer Login before checkout / purchase.
// - Integrates with CustomerAuthContext so logged-in customers can pick from
//   their Stored Addresses (or add/edit an address inline).
// - Records completed orders directly into the customer's Order & Invoice
//   history accessible under `/account` ("Namaste '<Username>'").
// ============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Lock,
  FileText,
  CreditCard,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import { useCart } from '@/store/cart-context';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';
import type { Order } from '@/types/domain';

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalQuantity,
    subtotalAmount,
    totalSavingsAmount,
    isHydrated,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const {
    customer,
    isAuthenticated,
    isHydrated: isAuthHydrated,
    addresses,
    saveAddress,
    createOrderFromCart,
  } = useCustomerAuth();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'confirmed'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [orderRef, setOrderRef] = useState<string>('');
  const [paymentIdRef, setPaymentIdRef] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const freeShippingThreshold = 1499;
  const shippingAmount =
    subtotalAmount === 0 || subtotalAmount >= freeShippingThreshold ? 0 : 99;
  const finalTotal = subtotalAmount + shippingAmount;

  if (!isHydrated || !isAuthHydrated) {
    return (
      <LuxurySpinner
        title="Loading Your Shopping Bag..."
        subtitle="Checking your items & account session"
      />
    );
  }

  if (checkoutStep === 'confirmed') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-stone-950">
          Order Confirmed!
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Thank you, <strong>{customer?.name}</strong>! Your{' '}
          {paymentMethod === 'cod' ? (
            <>
              <strong>Cash on Delivery (COD)</strong> order (Ref:{' '}
              <span className="font-mono text-xs text-stone-800">{paymentIdRef}</span>
              )
            </>
          ) : (
            <>
              Razorpay payment (
              <span className="font-mono text-xs text-stone-800">{paymentIdRef}</span>
              )
            </>
          )}{' '}
          is confirmed and order{' '}
          <span className="font-mono font-semibold text-stone-900">{orderRef}</span>{' '}
          has been saved to your account order history.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
          >
            <FileText className="w-4 h-4" />
            <span>View Order Status &amp; Invoice</span>
          </Link>
          <Link
            href="/shop"
            onClick={() => setCheckoutStep('cart')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-stone-300 bg-white text-stone-800 text-sm font-semibold hover:bg-stone-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-stone-950">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Explore our New Collection daily drops to add Kurtis, Co-ord Sets, and
          Festive Suit Sets to your bag.
        </p>
        <div className="pt-2">
          <Link
            href="/shop?collection=new-collection"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <span>Explore New Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const defaultAddr =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.is_default) ||
    addresses[0];

  const hasOverStockItems = items.some(
    (item) => item.quantity > item.maxStock || item.maxStock <= 0
  );

  const handleProceedToAddressStep = async () => {
    if (!isAuthenticated) {
      router.push('/login?next=/cart&reason=purchase');
      return;
    }

    const overStockItem = items.find(
      (i) => i.quantity > i.maxStock || i.maxStock <= 0
    );
    if (overStockItem) {
      setPaymentError(
        `Cannot proceed: "${overStockItem.name}" in Size ${overStockItem.size} only has ${overStockItem.maxStock} available in stock. Please reduce your requested quantity to ${overStockItem.maxStock} to continue.`
      );
      return;
    }

    try {
      const valRes = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const valData = await valRes.json();
      if (!valData.valid) {
        setPaymentError(
          valData.errors[0]?.message ||
            'One or more items in your cart exceed available stock. Please reduce quantity to proceed.'
        );
        return;
      }
    } catch {
      // Continue if network check fails
    }

    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr.id);
    }
    setCheckoutStep('address');
  };

  const handlePlaceOrderWithSavedAddress = async () => {
    if (!isAuthenticated) {
      router.push('/login?next=/cart&reason=purchase');
      return;
    }
    if (!defaultAddr) {
      setShowNewAddressForm(true);
      return;
    }

    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // Branch A: Cash on Delivery (COD) Checkout
      if (paymentMethod === 'cod') {
        const codRes = await fetch('/api/orders/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: defaultAddr.full_name,
            customerEmail: customer?.email || '',
            customerPhone: defaultAddr.phone,
            shippingAddress: {
              full_name: defaultAddr.full_name,
              phone: defaultAddr.phone,
              email: customer?.email,
              address_line1: defaultAddr.address_line1,
              address_line2: defaultAddr.address_line2,
              city: defaultAddr.city,
              state: defaultAddr.state,
              postal_code: defaultAddr.postal_code,
              country: 'IN',
            },
            items,
            subtotalAmount,
            discountAmount: totalSavingsAmount,
            shippingAmount,
            totalAmount: finalTotal,
          }),
        });

        const codData = (await codRes.json()) as {
          ok: boolean;
          error?: string;
          order?: Order;
          codReference?: string;
        };

        if (!codData.ok || !codData.order) {
          throw new Error(codData.error || 'Failed to place Cash on Delivery order');
        }

        createOrderFromCart({
          cartItems: items,
          address: defaultAddr,
          subtotalAmount,
          discountAmount: totalSavingsAmount,
          shippingAmount,
          totalAmount: finalTotal,
        });

        setOrderRef(codData.order.order_number);
        setPaymentIdRef(codData.codReference || 'COD');
        clearCart();
        setIsProcessingPayment(false);
        setCheckoutStep('confirmed');
        return;
      }

      // Branch B: Create Razorpay Order on Server
      const createRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInRupees: finalTotal,
          customerName: defaultAddr.full_name,
          customerEmail: customer?.email,
          customerPhone: defaultAddr.phone,
          items,
        }),
      });

      const createData = (await createRes.json()) as {
        ok: boolean;
        error?: string;
        session?: {
          mode: 'live-razorpay' | 'simulated-razorpay';
          razorpayOrderId: string;
          amountInPaise: number;
          currency: 'INR';
          keyId: string;
        };
      };

      if (!createData.ok || !createData.session) {
        throw new Error(createData.error || 'Could not initialize Razorpay checkout');
      }

      const { session } = createData;

      const verifyAndFinalizeOrder = async (
        paymentPayload: RazorpaySuccessResponse
      ) => {
        setIsProcessingPayment(true);
        const verifyRes = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...paymentPayload,
            customerName: defaultAddr.full_name,
            customerEmail: customer?.email || '',
            customerPhone: defaultAddr.phone,
            shippingAddress: {
              full_name: defaultAddr.full_name,
              phone: defaultAddr.phone,
              email: customer?.email,
              address_line1: defaultAddr.address_line1,
              address_line2: defaultAddr.address_line2,
              city: defaultAddr.city,
              state: defaultAddr.state,
              postal_code: defaultAddr.postal_code,
              country: 'IN',
            },
            items,
            subtotalAmount,
            discountAmount: totalSavingsAmount,
            shippingAmount,
            totalAmount: finalTotal,
          }),
        });

        const verifyData = (await verifyRes.json()) as {
          ok: boolean;
          error?: string;
          order?: Order;
        };

        if (!verifyData.ok || !verifyData.order) {
          throw new Error(verifyData.error || 'Payment verification failed');
        }

        // Also record in CustomerAuthContext so `/account` shows it immediately
        createOrderFromCart({
          cartItems: items,
          address: defaultAddr,
          subtotalAmount,
          discountAmount: totalSavingsAmount,
          shippingAmount,
          totalAmount: finalTotal,
        });

        setOrderRef(verifyData.order.order_number);
        setPaymentIdRef(paymentPayload.razorpay_payment_id);
        clearCart();
        setIsProcessingPayment(false);
        setCheckoutStep('confirmed');
      };

      // 2A. Live Razorpay Checkout Modal (when NEXT_PUBLIC_RAZORPAY_KEY_ID is configured)
      if (session.mode === 'live-razorpay') {
        const loaded = await loadRazorpayCheckoutScript();
        if (!loaded || !window.Razorpay) {
          throw new Error('Failed to load Razorpay Checkout SDK');
        }

        const rzp = new window.Razorpay({
          key: session.keyId,
          amount: session.amountInPaise,
          currency: session.currency,
          name: publicEnv.storeName,
          description: `Order Payment (${totalQuantity} items)`,
          order_id: session.razorpayOrderId,
          prefill: {
            name: defaultAddr.full_name,
            email: customer?.email,
            contact: defaultAddr.phone,
          },
          theme: {
            color: '#1c1917',
          },
          handler: (response) => {
            verifyAndFinalizeOrder(response).catch((err) => {
              setIsProcessingPayment(false);
              setPaymentError(
                err instanceof Error ? err.message : 'Verification failed'
              );
            });
          },
          modal: {
            ondismiss: () => {
              setIsProcessingPayment(false);
            },
          },
        });

        rzp.open();
        return;
      }

      // 2B. Simulated Razorpay Mode (when keys are not yet added to .env.local)
      await new Promise((r) => setTimeout(r, 600));
      await verifyAndFinalizeOrder({
        razorpay_order_id: session.razorpayOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: `sim_sig_${session.razorpayOrderId}`,
      });
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentError(
        err instanceof Error ? err.message : 'Payment initialization failed'
      );
    }
  };

  const handleSaveNewAddressInline = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveAddress({
      label: addressForm.label,
      full_name: addressForm.fullName || customer?.name || '',
      phone: addressForm.phone || customer?.phone || '',
      address_line1: addressForm.addressLine1,
      address_line2: addressForm.addressLine2,
      city: addressForm.city,
      state: addressForm.state,
      postal_code: addressForm.postalCode,
      is_default: addresses.length === 0,
    });
    setSelectedAddressId(saved.id);
    setShowNewAddressForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {isProcessingPayment && (
        <LuxurySpinner
          fullScreenOverlay
          title="Processing Razorpay Payment..."
          subtitle="Verifying payment signature, deducting warehouse stock & saving order"
        />
      )}

      <div className="flex items-center justify-between border-b border-stone-200 pb-5 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-stone-950">
            {checkoutStep === 'cart' ? 'Shopping Bag' : 'Select Delivery Address'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Cart Items or Stored Delivery Address Selector */}
        <div className="lg:col-span-7 space-y-4">
          {checkoutStep === 'cart' ? (
            items.map((item) => (
              <div
                key={`${item.sku}-${item.size}`}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs"
              >
                <Link
                  href={`/product/${item.sku}`}
                  className="relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shrink-0"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover object-top"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-stone-400">
                          {item.sku}
                        </span>
                        <Link
                          href={`/product/${item.sku}`}
                          className="block text-sm sm:text-base font-semibold text-stone-900 hover:text-stone-700 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.sku, item.size)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800">
                        Size: {item.size}
                      </span>
                      {item.color && <span>• {item.color}</span>}
                    </div>

                    {item.maxStock < 10 && item.maxStock > 0 && (
                      <p className="mt-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 inline-block">
                        Only {item.maxStock} left in stock for Size {item.size}
                      </p>
                    )}

                    {item.quantity > item.maxStock && (
                      <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>
                          Only {item.maxStock} available in Size {item.size}. Please reduce quantity to {item.maxStock} to proceed.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2">
                    {/* Quantity Adjuster */}
                    <div className="inline-flex items-center rounded-lg border border-stone-300 bg-stone-50">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.sku, item.size, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateQuantity(item.sku, item.size, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-200/70 rounded-r-lg disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-bold text-stone-950">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {item.originalPrice > item.unitPrice && (
                        <span className="block text-[11px] text-stone-400 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-800" />
                  <span>Choose a Stored Delivery Address</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-semibold text-stone-900 hover:underline cursor-pointer"
                >
                  + Add New Address
                </button>
              </div>

              {showNewAddressForm && (
                <form
                  onSubmit={handleSaveNewAddressInline}
                  className="p-5 rounded-2xl bg-white border-2 border-stone-900 space-y-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    New Delivery Address
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      placeholder={customer?.name || 'Full Name *'}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                    />
                    <input
                      required
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: e.target.value })
                      }
                      placeholder={customer?.phone || 'WhatsApp Phone *'}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                    />
                  </div>
                  <input
                    required
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, addressLine1: e.target.value })
                    }
                    placeholder="House / Flat / Street / Landmark *"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      required
                      type="text"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      placeholder="City *"
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                    />
                    <input
                      required
                      type="text"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      placeholder="State *"
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                    />
                    <input
                      required
                      type="text"
                      pattern="[0-9]{6}"
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, postalCode: e.target.value })
                      }
                      placeholder="PIN Code *"
                      className="px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                    >
                      Save &amp; Select
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = defaultAddr?.id === addr.id;
                  return (
                    <label
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/50 border-stone-900 ring-2 ring-stone-900/10'
                          : 'bg-white border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-900 text-white">
                          {addr.label}
                        </span>
                        <Link
                          href="/account"
                          className="text-xs font-semibold text-stone-600 hover:text-stone-950"
                        >
                          Edit in My Account →
                        </Link>
                      </div>
                      <p className="text-sm font-bold text-stone-950 mt-2">
                        {addr.full_name} • {addr.phone}
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {addr.address_line1}
                        {addr.address_line2 ? `, ${addr.address_line2}` : ''},{' '}
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-5 sticky top-24">
            <h2 className="font-serif text-xl font-semibold text-stone-950">
              Order Summary
            </h2>

            {!isAuthenticated && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  Sign in with Google is required before completing your order.
                </span>
              </div>
            )}

            {subtotalAmount < freeShippingThreshold && (
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-800">
                Add{' '}
                <strong>
                  {formatPrice(freeShippingThreshold - subtotalAmount)}
                </strong>{' '}
                more to unlock <strong>FREE Express Shipping</strong>!
              </div>
            )}

            <div className="space-y-3 text-sm border-b border-stone-200 pb-4">
              <div className="flex justify-between text-stone-600">
                <span>Bag Subtotal ({totalQuantity} items)</span>
                <span className="font-semibold text-stone-900">
                  {formatPrice(subtotalAmount)}
                </span>
              </div>

              {totalSavingsAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Collection Discount Savings</span>
                  <span className="font-semibold">
                    -{formatPrice(totalSavingsAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shippingAmount === 0 ? 'FREE' : formatPrice(shippingAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-stone-900">
                Total Payable
              </span>
              <span className="text-2xl font-bold text-stone-950">
                {formatPrice(finalTotal)}
              </span>
            </div>

            {paymentError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {hasOverStockItems && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Stock limit exceeded</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    One or more items in your bag exceed available warehouse stock. Please reduce the quantity using the minus (-) button to proceed.
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                disabled={hasOverStockItems}
                onClick={handleProceedToAddressStep}
                className="w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed"
              >
                <span>
                  {hasOverStockItems
                    ? 'Reduce Quantities to Proceed'
                    : isAuthenticated
                    ? 'Proceed to Delivery Address'
                    : 'Sign In with Google to Checkout'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4">
                {/* Payment Method Selector: Online Razorpay vs Cash on Delivery (COD) */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Choose Payment Method
                  </p>

                  <label
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'bg-amber-50/60 border-stone-900 ring-1 ring-stone-900/10'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-stone-950 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-amber-800" />
                          Pay Online (UPI / Card / NetBanking)
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Fastest Dispatch
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Secured by Razorpay • Instant order &amp; GST invoice
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-50/60 border-stone-900 ring-1 ring-stone-900/10'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-stone-950 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-700" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          Pay at Doorstep
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Pay in cash or UPI to the courier partner upon delivery
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePlaceOrderWithSavedAddress}
                  className="w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {paymentMethod === 'cod' ? (
                    <>
                      <Banknote className="w-4 h-4 text-emerald-300" />
                      <span>Place COD Order ({formatPrice(finalTotal)})</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-amber-300" />
                      <span>Pay Online via Razorpay ({formatPrice(finalTotal)})</span>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-stone-700" />
              <span>100% Secure Checkout • Easy 7-Day Size Exchange</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
