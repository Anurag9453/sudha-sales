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
} from 'lucide-react';
import { useCart } from '@/store/cart-context';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { formatPrice } from '@/lib/format';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';

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
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [orderRef, setOrderRef] = useState<string>('');
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
          Thank you, <strong>{customer?.name}</strong>! Your order{' '}
          <span className="font-mono font-semibold text-stone-900">{orderRef}</span>{' '}
          has been placed and added to your account order history &amp; invoices.
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

  const handleProceedToAddressStep = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/cart&reason=purchase');
      return;
    }
    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr.id);
    }
    setCheckoutStep('address');
  };

  const handlePlaceOrderWithSavedAddress = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/cart&reason=purchase');
      return;
    }
    if (!defaultAddr) {
      setShowNewAddressForm(true);
      return;
    }

    const created = createOrderFromCart({
      cartItems: items,
      address: defaultAddr,
      subtotalAmount,
      discountAmount: totalSavingsAmount,
      shippingAmount,
      totalAmount: finalTotal,
    });

    setOrderRef(created.order_number);
    clearCart();
    setCheckoutStep('confirmed');
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

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={handleProceedToAddressStep}
                className="w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <span>
                  {isAuthenticated
                    ? 'Proceed to Delivery Address'
                    : 'Sign In with Google to Checkout'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrderWithSavedAddress}
                className="w-full h-13 rounded-xl bg-stone-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <span>Pay &amp; Place Order ({formatPrice(finalTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
