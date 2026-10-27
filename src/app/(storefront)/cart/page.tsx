// ============================================================================
// Shopping Cart & Checkout Page: src/app/(storefront)/cart/page.tsx
// - Enforces Customer Login before checkout / purchase.
// - Integrates with CustomerAuthContext so logged-in customers can pick from
//   their Stored Addresses (or add/edit an address inline).
// - Records completed orders directly into the customer's Order & Invoice
//   history accessible under `/account` ("Namaste '<Username>'").
// All visual copy, CSS class names, accessibility attributes, routes, and
// timing values are bound to AppConstants.Cart.
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
import { AppConstants } from '@/constants/app.constants';
import type { Order } from '@/types/domain';

type CheckoutStep =
  (typeof AppConstants.Cart.CHECKOUT_STEPS)[keyof typeof AppConstants.Cart.CHECKOUT_STEPS];
type PaymentMethod =
  (typeof AppConstants.Cart.PAYMENT_METHODS)[keyof typeof AppConstants.Cart.PAYMENT_METHODS];

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

    const script = document.createElement(AppConstants.Cart.SCRIPT_TAG);
    script.src = AppConstants.Cart.API.RAZORPAY_CHECKOUT_SCRIPT;
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

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(
    AppConstants.Cart.CHECKOUT_STEPS.CART
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    AppConstants.Cart.PAYMENT_METHODS.RAZORPAY
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [orderRef, setOrderRef] = useState<string>('');
  const [paymentIdRef, setPaymentIdRef] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: AppConstants.Cart.ADDRESS_LABELS.HOME as 'Home' | 'Work' | 'Other',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const freeShippingThreshold = AppConstants.Shipping.FREE_SHIPPING_THRESHOLD;
  const shippingAmount =
    subtotalAmount === 0 || subtotalAmount >= freeShippingThreshold
      ? 0
      : AppConstants.Shipping.STANDARD_FEE;
  const finalTotal = subtotalAmount + shippingAmount;

  if (!isHydrated || !isAuthHydrated) {
    return (
      <LuxurySpinner
        title={AppConstants.Cart.COPY.LOADING_TITLE}
        subtitle={AppConstants.Cart.COPY.LOADING_SUBTITLE}
      />
    );
  }

  if (checkoutStep === AppConstants.Cart.CHECKOUT_STEPS.CONFIRMED) {
    return (
      <div className={AppConstants.Cart.CLASSES.CONFIRMED_WRAPPER}>
        <div className={AppConstants.Cart.CLASSES.CONFIRMED_ICON_WRAPPER}>
          <CheckCircle2 className={AppConstants.Cart.CLASSES.CONFIRMED_ICON} />
        </div>
        <h1 className={AppConstants.Cart.CLASSES.CONFIRMED_TITLE}>
          {AppConstants.Cart.COPY.CONFIRMED_TITLE}
        </h1>
        <p className={AppConstants.Cart.CLASSES.CONFIRMED_TEXT}>
          {AppConstants.Cart.COPY.CONFIRMED_THANK_YOU_PREFIX}
          <strong>{customer?.name}</strong>
          {AppConstants.Cart.COPY.CONFIRMED_THANK_YOU_SUFFIX}
          {paymentMethod === AppConstants.Cart.PAYMENT_METHODS.COD ? (
            <>
              <strong>{AppConstants.Cart.COPY.CONFIRMED_COD_LABEL}</strong>
              {AppConstants.Cart.COPY.CONFIRMED_COD_ORDER_REF_OPEN}
              <span className={AppConstants.Cart.CLASSES.REF_MONO}>{paymentIdRef}</span>
              {AppConstants.Cart.COPY.CONFIRMED_REF_CLOSE}
            </>
          ) : (
            <>
              {AppConstants.Cart.COPY.CONFIRMED_RAZORPAY_PAYMENT_OPEN}
              <span className={AppConstants.Cart.CLASSES.REF_MONO}>{paymentIdRef}</span>
              {AppConstants.Cart.COPY.CONFIRMED_REF_CLOSE}
            </>
          )}
          {AppConstants.Cart.COPY.CONFIRMED_IS_CONFIRMED_AND_ORDER}
          <span className={AppConstants.Cart.CLASSES.ORDER_REF_MONO}>{orderRef}</span>
          {AppConstants.Cart.COPY.CONFIRMED_SAVED_TO_HISTORY}
        </p>
        <div className={AppConstants.Cart.CLASSES.CONFIRMED_ACTIONS}>
          <Link
            href={AppConstants.Cart.ROUTES.ACCOUNT}
            className={AppConstants.Cart.CLASSES.CONFIRMED_PRIMARY_LINK}
          >
            <FileText className={AppConstants.Cart.CLASSES.ICON_SM} />
            <span>{AppConstants.Cart.COPY.VIEW_ORDER_STATUS}</span>
          </Link>
          <Link
            href={AppConstants.Cart.ROUTES.SHOP}
            onClick={() => setCheckoutStep(AppConstants.Cart.CHECKOUT_STEPS.CART)}
            className={AppConstants.Cart.CLASSES.CONFIRMED_SECONDARY_LINK}
          >
            {AppConstants.Cart.COPY.CONTINUE_SHOPPING}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={AppConstants.Cart.CLASSES.EMPTY_WRAPPER}>
        <div className={AppConstants.Cart.CLASSES.EMPTY_ICON_WRAPPER}>
          <ShoppingBag className={AppConstants.Cart.CLASSES.EMPTY_ICON} />
        </div>
        <h1 className={AppConstants.Cart.CLASSES.EMPTY_TITLE}>
          {AppConstants.Cart.COPY.EMPTY_TITLE}
        </h1>
        <p className={AppConstants.Cart.CLASSES.EMPTY_DESCRIPTION}>
          {AppConstants.Cart.COPY.EMPTY_DESCRIPTION}
        </p>
        <div className={AppConstants.Cart.CLASSES.EMPTY_CTA_WRAPPER}>
          <Link
            href={AppConstants.Cart.ROUTES.SHOP_NEW_COLLECTION}
            className={AppConstants.Cart.CLASSES.EMPTY_CTA_LINK}
          >
            <span>{AppConstants.Cart.COPY.EXPLORE_NEW_COLLECTION}</span>
            <ArrowRight className={AppConstants.Cart.CLASSES.ICON_SM} />
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
      router.push(AppConstants.Cart.ROUTES.LOGIN_FOR_PURCHASE);
      return;
    }

    const overStockItem = items.find(
      (i) => i.quantity > i.maxStock || i.maxStock <= 0
    );
    if (overStockItem) {
      setPaymentError(
        AppConstants.Cart.ERRORS.OVER_STOCK(
          overStockItem.name,
          overStockItem.size,
          overStockItem.maxStock
        )
      );
      return;
    }

    try {
      const valRes = await fetch(AppConstants.Cart.API.CART_VALIDATE, {
        method: AppConstants.Cart.API.METHOD_POST,
        headers: AppConstants.Cart.API.HEADERS_JSON,
        body: JSON.stringify({ items }),
      });
      const valData = await valRes.json();
      if (!valData.valid) {
        setPaymentError(
          valData.errors[0]?.message || AppConstants.Cart.ERRORS.CART_EXCEEDS_STOCK
        );
        return;
      }
    } catch {
      // Continue if network check fails
    }

    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr.id);
    }
    setCheckoutStep(AppConstants.Cart.CHECKOUT_STEPS.ADDRESS);
  };

  const handlePlaceOrderWithSavedAddress = async () => {
    if (!isAuthenticated) {
      router.push(AppConstants.Cart.ROUTES.LOGIN_FOR_PURCHASE);
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
      if (paymentMethod === AppConstants.Cart.PAYMENT_METHODS.COD) {
        const codRes = await fetch(AppConstants.Cart.API.ORDERS_COD, {
          method: AppConstants.Cart.API.METHOD_POST,
          headers: AppConstants.Cart.API.HEADERS_JSON,
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
              country: AppConstants.Store.DEFAULT_COUNTRY,
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
          throw new Error(codData.error || AppConstants.Cart.ERRORS.COD_FAILED);
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
        setPaymentIdRef(
          codData.codReference || AppConstants.Cart.RAZORPAY.DEFAULT_COD_REFERENCE
        );
        clearCart();
        setIsProcessingPayment(false);
        setCheckoutStep(AppConstants.Cart.CHECKOUT_STEPS.CONFIRMED);
        return;
      }

      // Branch B: Create Razorpay Order on Server
      const createRes = await fetch(AppConstants.Cart.API.RAZORPAY_CREATE_ORDER, {
        method: AppConstants.Cart.API.METHOD_POST,
        headers: AppConstants.Cart.API.HEADERS_JSON,
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
        throw new Error(
          createData.error || AppConstants.Cart.ERRORS.RAZORPAY_INIT_FAILED
        );
      }

      const { session } = createData;

      const verifyAndFinalizeOrder = async (
        paymentPayload: RazorpaySuccessResponse
      ) => {
        setIsProcessingPayment(true);
        const verifyRes = await fetch(AppConstants.Cart.API.RAZORPAY_VERIFY, {
          method: AppConstants.Cart.API.METHOD_POST,
          headers: AppConstants.Cart.API.HEADERS_JSON,
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
              country: AppConstants.Store.DEFAULT_COUNTRY,
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
          throw new Error(
            verifyData.error || AppConstants.Cart.ERRORS.PAYMENT_VERIFY_FAILED
          );
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
        setCheckoutStep(AppConstants.Cart.CHECKOUT_STEPS.CONFIRMED);
      };

      // 2A. Live Razorpay Checkout Modal (when NEXT_PUBLIC_RAZORPAY_KEY_ID is configured)
      if (session.mode === AppConstants.Cart.RAZORPAY_MODES.LIVE) {
        const loaded = await loadRazorpayCheckoutScript();
        if (!loaded || !window.Razorpay) {
          throw new Error(AppConstants.Cart.ERRORS.RAZORPAY_SDK_LOAD_FAILED);
        }

        const rzp = new window.Razorpay({
          key: session.keyId,
          amount: session.amountInPaise,
          currency: session.currency,
          name: publicEnv.storeName,
          description: AppConstants.Cart.RAZORPAY.DESCRIPTION(totalQuantity),
          order_id: session.razorpayOrderId,
          prefill: {
            name: defaultAddr.full_name,
            email: customer?.email,
            contact: defaultAddr.phone,
          },
          theme: {
            color: AppConstants.Cart.RAZORPAY.THEME_COLOR,
          },
          handler: (response) => {
            verifyAndFinalizeOrder(response).catch((err) => {
              setIsProcessingPayment(false);
              setPaymentError(
                err instanceof Error
                  ? err.message
                  : AppConstants.Cart.ERRORS.VERIFICATION_FAILED
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
      await new Promise((r) =>
        setTimeout(r, AppConstants.Cart.TIMINGS.SIMULATED_PAYMENT_DELAY_MS)
      );
      await verifyAndFinalizeOrder({
        razorpay_order_id: session.razorpayOrderId,
        razorpay_payment_id: `${AppConstants.Cart.RAZORPAY.SIM_PAYMENT_ID_PREFIX}${Date.now()}`,
        razorpay_signature: `${AppConstants.Cart.RAZORPAY.SIM_SIGNATURE_PREFIX}${session.razorpayOrderId}`,
      });
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentError(
        err instanceof Error
          ? err.message
          : AppConstants.Cart.ERRORS.PAYMENT_INIT_FAILED
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
    <div className={AppConstants.Cart.CLASSES.PAGE_WRAPPER}>
      {isProcessingPayment && (
        <LuxurySpinner
          fullScreenOverlay
          title={AppConstants.Cart.COPY.PROCESSING_TITLE}
          subtitle={AppConstants.Cart.COPY.PROCESSING_SUBTITLE}
        />
      )}

      <div className={AppConstants.Cart.CLASSES.HEADER}>
        <div>
          <h1 className={AppConstants.Cart.CLASSES.HEADER_TITLE}>
            {checkoutStep === AppConstants.Cart.CHECKOUT_STEPS.CART
              ? AppConstants.Cart.COPY.HEADING_CART
              : AppConstants.Cart.COPY.HEADING_ADDRESS}
          </h1>
          <p className={AppConstants.Cart.CLASSES.HEADER_SUBTITLE}>
            {totalQuantity}{' '}
            {totalQuantity === 1
              ? AppConstants.Cart.COPY.ITEM_SINGULAR
              : AppConstants.Cart.COPY.ITEM_PLURAL}{' '}
            {AppConstants.Cart.COPY.IN_YOUR_BAG}
          </p>
        </div>

        <Link
          href={AppConstants.Cart.ROUTES.SHOP}
          className={AppConstants.Cart.CLASSES.HEADER_BACK_LINK}
        >
          <ArrowLeft className={AppConstants.Cart.CLASSES.ICON_SM} />
          <span>{AppConstants.Cart.COPY.CONTINUE_SHOPPING}</span>
        </Link>
      </div>

      <div className={AppConstants.Cart.CLASSES.GRID}>
        {/* Left Column: Cart Items or Stored Delivery Address Selector */}
        <div className={AppConstants.Cart.CLASSES.LEFT_COLUMN}>
          {checkoutStep === AppConstants.Cart.CHECKOUT_STEPS.CART ? (
            items.map((item) => (
              <div
                key={`${item.sku}-${item.size}`}
                className={AppConstants.Cart.CLASSES.ITEM_CARD}
              >
                <Link
                  href={AppConstants.Cart.ROUTES.PRODUCT(item.sku)}
                  className={AppConstants.Cart.CLASSES.ITEM_IMAGE_LINK}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes={AppConstants.Cart.IMAGE.SIZES}
                    className={AppConstants.Cart.CLASSES.ITEM_IMAGE}
                  />
                </Link>

                <div className={AppConstants.Cart.CLASSES.ITEM_BODY}>
                  <div>
                    <div className={AppConstants.Cart.CLASSES.ITEM_TOP_ROW}>
                      <div>
                        <span className={AppConstants.Cart.CLASSES.ITEM_SKU}>
                          {item.sku}
                        </span>
                        <Link
                          href={AppConstants.Cart.ROUTES.PRODUCT(item.sku)}
                          className={AppConstants.Cart.CLASSES.ITEM_NAME_LINK}
                        >
                          {item.name}
                        </Link>
                      </div>
                      <button
                        type={AppConstants.Cart.FORM.BUTTON_TYPE}
                        onClick={() => removeItem(item.sku, item.size)}
                        aria-label={AppConstants.Cart.ARIA.REMOVE_ITEM(item.name)}
                        className={AppConstants.Cart.CLASSES.ITEM_REMOVE_BUTTON}
                      >
                        <Trash2 className={AppConstants.Cart.CLASSES.ICON_SM} />
                      </button>
                    </div>

                    <div className={AppConstants.Cart.CLASSES.ITEM_META_ROW}>
                      <span className={AppConstants.Cart.CLASSES.ITEM_SIZE_BADGE}>
                        {AppConstants.Cart.COPY.SIZE_LABEL(item.size)}
                      </span>
                      {item.color && (
                        <span>{AppConstants.Cart.COPY.COLOR_LABEL(item.color)}</span>
                      )}
                    </div>

                    {item.maxStock < AppConstants.Inventory.LOW_STOCK_THRESHOLD &&
                      item.maxStock > 0 && (
                        <p className={AppConstants.Cart.CLASSES.ITEM_LOW_STOCK}>
                          {AppConstants.Cart.COPY.LOW_STOCK(item.maxStock, item.size)}
                        </p>
                      )}

                    {item.quantity > item.maxStock && (
                      <div className={AppConstants.Cart.CLASSES.ITEM_OVER_STOCK}>
                        <AlertCircle
                          className={AppConstants.Cart.CLASSES.ITEM_OVER_STOCK_ICON}
                        />
                        <span>
                          {AppConstants.Cart.COPY.OVER_STOCK_ITEM(
                            item.maxStock,
                            item.size
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={AppConstants.Cart.CLASSES.ITEM_BOTTOM_ROW}>
                    {/* Quantity Adjuster */}
                    <div className={AppConstants.Cart.CLASSES.QTY_WRAPPER}>
                      <button
                        type={AppConstants.Cart.FORM.BUTTON_TYPE}
                        onClick={() =>
                          updateQuantity(item.sku, item.size, item.quantity - 1)
                        }
                        aria-label={AppConstants.Cart.ARIA.DECREASE_QUANTITY}
                        className={AppConstants.Cart.CLASSES.QTY_DECREASE}
                      >
                        <Minus className={AppConstants.Cart.CLASSES.QTY_ICON} />
                      </button>
                      <span className={AppConstants.Cart.CLASSES.QTY_VALUE}>
                        {item.quantity}
                      </span>
                      <button
                        type={AppConstants.Cart.FORM.BUTTON_TYPE}
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateQuantity(item.sku, item.size, item.quantity + 1)
                        }
                        aria-label={AppConstants.Cart.ARIA.INCREASE_QUANTITY}
                        className={AppConstants.Cart.CLASSES.QTY_INCREASE}
                      >
                        <Plus className={AppConstants.Cart.CLASSES.QTY_ICON} />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className={AppConstants.Cart.CLASSES.LINE_TOTAL_WRAPPER}>
                      <span className={AppConstants.Cart.CLASSES.LINE_TOTAL}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {item.originalPrice > item.unitPrice && (
                        <span className={AppConstants.Cart.CLASSES.LINE_TOTAL_ORIGINAL}>
                          {formatPrice(item.originalPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={AppConstants.Cart.CLASSES.ADDRESS_SECTION}>
              <div className={AppConstants.Cart.CLASSES.ADDRESS_HEADER_ROW}>
                <h2 className={AppConstants.Cart.CLASSES.ADDRESS_HEADING}>
                  <MapPin className={AppConstants.Cart.CLASSES.ADDRESS_HEADING_ICON} />
                  <span>{AppConstants.Cart.COPY.CHOOSE_ADDRESS}</span>
                </h2>
                <button
                  type={AppConstants.Cart.FORM.BUTTON_TYPE}
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className={AppConstants.Cart.CLASSES.ADD_ADDRESS_BUTTON}
                >
                  {AppConstants.Cart.COPY.ADD_NEW_ADDRESS}
                </button>
              </div>

              {showNewAddressForm && (
                <form
                  onSubmit={handleSaveNewAddressInline}
                  className={AppConstants.Cart.CLASSES.NEW_ADDRESS_FORM}
                >
                  <p className={AppConstants.Cart.CLASSES.NEW_ADDRESS_TITLE}>
                    {AppConstants.Cart.COPY.NEW_ADDRESS_TITLE}
                  </p>
                  <div className={AppConstants.Cart.CLASSES.FORM_GRID_2}>
                    <input
                      required
                      type={AppConstants.Cart.FORM.INPUT_TEXT}
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      placeholder={
                        customer?.name || AppConstants.Cart.FORM.PLACEHOLDER_FULL_NAME
                      }
                      className={AppConstants.Cart.CLASSES.FORM_INPUT}
                    />
                    <input
                      required
                      type={AppConstants.Cart.FORM.INPUT_TEL}
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: e.target.value })
                      }
                      placeholder={
                        customer?.phone || AppConstants.Cart.FORM.PLACEHOLDER_PHONE
                      }
                      className={AppConstants.Cart.CLASSES.FORM_INPUT}
                    />
                  </div>
                  <input
                    required
                    type={AppConstants.Cart.FORM.INPUT_TEXT}
                    value={addressForm.addressLine1}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, addressLine1: e.target.value })
                    }
                    placeholder={AppConstants.Cart.FORM.PLACEHOLDER_ADDRESS_LINE1}
                    className={AppConstants.Cart.CLASSES.FORM_INPUT_FULL}
                  />
                  <div className={AppConstants.Cart.CLASSES.FORM_GRID_3}>
                    <input
                      required
                      type={AppConstants.Cart.FORM.INPUT_TEXT}
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      placeholder={AppConstants.Cart.FORM.PLACEHOLDER_CITY}
                      className={AppConstants.Cart.CLASSES.FORM_INPUT}
                    />
                    <input
                      required
                      type={AppConstants.Cart.FORM.INPUT_TEXT}
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      placeholder={AppConstants.Cart.FORM.PLACEHOLDER_STATE}
                      className={AppConstants.Cart.CLASSES.FORM_INPUT}
                    />
                    <input
                      required
                      type={AppConstants.Cart.FORM.INPUT_TEXT}
                      pattern={AppConstants.Cart.FORM.POSTAL_CODE_PATTERN}
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, postalCode: e.target.value })
                      }
                      placeholder={AppConstants.Cart.FORM.PLACEHOLDER_POSTAL_CODE}
                      className={AppConstants.Cart.CLASSES.FORM_INPUT}
                    />
                  </div>
                  <div className={AppConstants.Cart.CLASSES.FORM_ACTIONS}>
                    <button
                      type={AppConstants.Cart.FORM.BUTTON_TYPE}
                      onClick={() => setShowNewAddressForm(false)}
                      className={AppConstants.Cart.CLASSES.FORM_CANCEL_BUTTON}
                    >
                      {AppConstants.Cart.COPY.CANCEL}
                    </button>
                    <button
                      type={AppConstants.Cart.FORM.SUBMIT_TYPE}
                      className={AppConstants.Cart.CLASSES.FORM_SUBMIT_BUTTON}
                    >
                      {AppConstants.Cart.COPY.SAVE_AND_SELECT}
                    </button>
                  </div>
                </form>
              )}

              <div className={AppConstants.Cart.CLASSES.ADDRESS_LIST}>
                {addresses.map((addr) => {
                  const isSelected = defaultAddr?.id === addr.id;
                  return (
                    <label
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={
                        isSelected
                          ? `${AppConstants.Cart.CLASSES.ADDRESS_CARD_BASE} ${AppConstants.Cart.CLASSES.ADDRESS_CARD_SELECTED}`
                          : `${AppConstants.Cart.CLASSES.ADDRESS_CARD_BASE} ${AppConstants.Cart.CLASSES.ADDRESS_CARD_UNSELECTED}`
                      }
                    >
                      <div className={AppConstants.Cart.CLASSES.ADDRESS_CARD_TOP_ROW}>
                        <span className={AppConstants.Cart.CLASSES.ADDRESS_LABEL_BADGE}>
                          {addr.label}
                        </span>
                        <Link
                          href={AppConstants.Cart.ROUTES.ACCOUNT}
                          className={AppConstants.Cart.CLASSES.ADDRESS_EDIT_LINK}
                        >
                          {AppConstants.Cart.COPY.EDIT_IN_ACCOUNT}
                        </Link>
                      </div>
                      <p className={AppConstants.Cart.CLASSES.ADDRESS_NAME}>
                        {AppConstants.Cart.COPY.ADDRESS_NAME_PHONE(
                          addr.full_name,
                          addr.phone
                        )}
                      </p>
                      <p className={AppConstants.Cart.CLASSES.ADDRESS_LINES}>
                        {addr.address_line1}
                        {addr.address_line2
                          ? `${AppConstants.Cart.COPY.ADDRESS_LINE2_PREFIX}${addr.address_line2}`
                          : ''}
                        {AppConstants.Cart.COPY.ADDRESS_LINE_SEPARATOR}
                        {addr.city}
                        {AppConstants.Cart.COPY.ADDRESS_LINE_SEPARATOR}
                        {addr.state}
                        {AppConstants.Cart.COPY.ADDRESS_POSTAL_SEPARATOR}
                        {addr.postal_code}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className={AppConstants.Cart.CLASSES.SUMMARY_COLUMN}>
          <div className={AppConstants.Cart.CLASSES.SUMMARY_CARD}>
            <h2 className={AppConstants.Cart.CLASSES.SUMMARY_TITLE}>
              {AppConstants.Cart.COPY.ORDER_SUMMARY}
            </h2>

            {!isAuthenticated && (
              <div className={AppConstants.Cart.CLASSES.SIGN_IN_NOTICE}>
                <Lock className={AppConstants.Cart.CLASSES.SIGN_IN_ICON} />
                <span>{AppConstants.Cart.COPY.SIGN_IN_REQUIRED}</span>
              </div>
            )}

            {subtotalAmount < freeShippingThreshold && (
              <div className={AppConstants.Cart.CLASSES.FREE_SHIPPING_NOTICE}>
                {AppConstants.Cart.COPY.FREE_SHIPPING_ADD}
                <strong>{formatPrice(freeShippingThreshold - subtotalAmount)}</strong>
                {AppConstants.Cart.COPY.FREE_SHIPPING_MORE_TO_UNLOCK}
                <strong>{AppConstants.Cart.COPY.FREE_SHIPPING_HIGHLIGHT}</strong>
                {AppConstants.Cart.COPY.FREE_SHIPPING_END}
              </div>
            )}

            <div className={AppConstants.Cart.CLASSES.SUMMARY_ROWS}>
              <div className={AppConstants.Cart.CLASSES.SUMMARY_ROW}>
                <span>{AppConstants.Cart.COPY.BAG_SUBTOTAL(totalQuantity)}</span>
                <span className={AppConstants.Cart.CLASSES.SUMMARY_VALUE}>
                  {formatPrice(subtotalAmount)}
                </span>
              </div>

              {totalSavingsAmount > 0 && (
                <div className={AppConstants.Cart.CLASSES.SUMMARY_ROW_DISCOUNT}>
                  <span>{AppConstants.Cart.COPY.DISCOUNT_SAVINGS}</span>
                  <span className={AppConstants.Cart.CLASSES.SUMMARY_DISCOUNT_VALUE}>
                    {AppConstants.Cart.COPY.DISCOUNT_PREFIX}
                    {formatPrice(totalSavingsAmount)}
                  </span>
                </div>
              )}

              <div className={AppConstants.Cart.CLASSES.SUMMARY_ROW}>
                <span>{AppConstants.Cart.COPY.SHIPPING}</span>
                <span className={AppConstants.Cart.CLASSES.SUMMARY_VALUE}>
                  {shippingAmount === 0
                    ? AppConstants.Cart.COPY.SHIPPING_FREE
                    : formatPrice(shippingAmount)}
                </span>
              </div>
            </div>

            <div className={AppConstants.Cart.CLASSES.TOTAL_ROW}>
              <span className={AppConstants.Cart.CLASSES.TOTAL_LABEL}>
                {AppConstants.Cart.COPY.TOTAL_PAYABLE}
              </span>
              <span className={AppConstants.Cart.CLASSES.TOTAL_VALUE}>
                {formatPrice(finalTotal)}
              </span>
            </div>

            {paymentError && (
              <div className={AppConstants.Cart.CLASSES.PAYMENT_ERROR}>
                <AlertCircle className={AppConstants.Cart.CLASSES.PAYMENT_ERROR_ICON} />
                <span>{paymentError}</span>
              </div>
            )}

            {hasOverStockItems && (
              <div className={AppConstants.Cart.CLASSES.STOCK_LIMIT_BOX}>
                <AlertCircle className={AppConstants.Cart.CLASSES.STOCK_LIMIT_ICON} />
                <div>
                  <p className={AppConstants.Cart.CLASSES.STOCK_LIMIT_TITLE}>
                    {AppConstants.Cart.COPY.STOCK_LIMIT_TITLE}
                  </p>
                  <p className={AppConstants.Cart.CLASSES.STOCK_LIMIT_TEXT}>
                    {AppConstants.Cart.COPY.STOCK_LIMIT_DESCRIPTION}
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === AppConstants.Cart.CHECKOUT_STEPS.CART ? (
              <button
                type={AppConstants.Cart.FORM.BUTTON_TYPE}
                disabled={hasOverStockItems}
                onClick={handleProceedToAddressStep}
                className={AppConstants.Cart.CLASSES.PROCEED_BUTTON}
              >
                <span>
                  {hasOverStockItems
                    ? AppConstants.Cart.COPY.CTA_REDUCE_QUANTITIES
                    : isAuthenticated
                    ? AppConstants.Cart.COPY.CTA_PROCEED_TO_ADDRESS
                    : AppConstants.Cart.COPY.CTA_SIGN_IN_TO_CHECKOUT}
                </span>
                <ArrowRight className={AppConstants.Cart.CLASSES.ICON_SM} />
              </button>
            ) : (
              <div className={AppConstants.Cart.CLASSES.PAYMENT_SECTION}>
                {/* Payment Method Selector: Online Razorpay vs Cash on Delivery (COD) */}
                <div className={AppConstants.Cart.CLASSES.PAYMENT_OPTIONS}>
                  <p className={AppConstants.Cart.CLASSES.PAYMENT_OPTIONS_TITLE}>
                    {AppConstants.Cart.COPY.CHOOSE_PAYMENT_METHOD}
                  </p>

                  <label
                    onClick={() =>
                      setPaymentMethod(AppConstants.Cart.PAYMENT_METHODS.RAZORPAY)
                    }
                    className={
                      paymentMethod === AppConstants.Cart.PAYMENT_METHODS.RAZORPAY
                        ? `${AppConstants.Cart.CLASSES.PAYMENT_OPTION_BASE} ${AppConstants.Cart.CLASSES.PAYMENT_OPTION_SELECTED}`
                        : `${AppConstants.Cart.CLASSES.PAYMENT_OPTION_BASE} ${AppConstants.Cart.CLASSES.PAYMENT_OPTION_UNSELECTED}`
                    }
                  >
                    <input
                      type={AppConstants.Cart.FORM.INPUT_RADIO}
                      name={AppConstants.Cart.FORM.PAYMENT_METHOD_NAME}
                      checked={
                        paymentMethod === AppConstants.Cart.PAYMENT_METHODS.RAZORPAY
                      }
                      onChange={() =>
                        setPaymentMethod(AppConstants.Cart.PAYMENT_METHODS.RAZORPAY)
                      }
                      className={AppConstants.Cart.CLASSES.PAYMENT_RADIO}
                    />
                    <div className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_BODY}>
                      <div className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_ROW}>
                        <span className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_LABEL}>
                          <CreditCard
                            className={AppConstants.Cart.CLASSES.PAYMENT_ONLINE_ICON}
                          />
                          {AppConstants.Cart.COPY.PAY_ONLINE}
                        </span>
                        <span
                          className={AppConstants.Cart.CLASSES.PAYMENT_ONLINE_BADGE}
                        >
                          {AppConstants.Cart.COPY.PAY_ONLINE_BADGE}
                        </span>
                      </div>
                      <p className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_NOTE}>
                        {AppConstants.Cart.COPY.PAY_ONLINE_NOTE}
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() =>
                      setPaymentMethod(AppConstants.Cart.PAYMENT_METHODS.COD)
                    }
                    className={
                      paymentMethod === AppConstants.Cart.PAYMENT_METHODS.COD
                        ? `${AppConstants.Cart.CLASSES.PAYMENT_OPTION_BASE} ${AppConstants.Cart.CLASSES.PAYMENT_OPTION_SELECTED}`
                        : `${AppConstants.Cart.CLASSES.PAYMENT_OPTION_BASE} ${AppConstants.Cart.CLASSES.PAYMENT_OPTION_UNSELECTED}`
                    }
                  >
                    <input
                      type={AppConstants.Cart.FORM.INPUT_RADIO}
                      name={AppConstants.Cart.FORM.PAYMENT_METHOD_NAME}
                      checked={paymentMethod === AppConstants.Cart.PAYMENT_METHODS.COD}
                      onChange={() =>
                        setPaymentMethod(AppConstants.Cart.PAYMENT_METHODS.COD)
                      }
                      className={AppConstants.Cart.CLASSES.PAYMENT_RADIO}
                    />
                    <div className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_BODY}>
                      <div className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_ROW}>
                        <span className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_LABEL}>
                          <Banknote
                            className={AppConstants.Cart.CLASSES.PAYMENT_COD_ICON}
                          />
                          {AppConstants.Cart.COPY.PAY_COD}
                        </span>
                        <span className={AppConstants.Cart.CLASSES.PAYMENT_COD_BADGE}>
                          {AppConstants.Cart.COPY.PAY_COD_BADGE}
                        </span>
                      </div>
                      <p className={AppConstants.Cart.CLASSES.PAYMENT_OPTION_NOTE}>
                        {AppConstants.Cart.COPY.PAY_COD_NOTE}
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  type={AppConstants.Cart.FORM.BUTTON_TYPE}
                  disabled={isProcessingPayment}
                  onClick={handlePlaceOrderWithSavedAddress}
                  className={AppConstants.Cart.CLASSES.PLACE_ORDER_BUTTON}
                >
                  {paymentMethod === AppConstants.Cart.PAYMENT_METHODS.COD ? (
                    <>
                      <Banknote className={AppConstants.Cart.CLASSES.PLACE_COD_ICON} />
                      <span>
                        {AppConstants.Cart.COPY.PLACE_COD_ORDER(
                          formatPrice(finalTotal)
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard
                        className={AppConstants.Cart.CLASSES.PLACE_ONLINE_ICON}
                      />
                      <span>
                        {AppConstants.Cart.COPY.PAY_ONLINE_RAZORPAY(
                          formatPrice(finalTotal)
                        )}
                      </span>
                    </>
                  )}
                  <ArrowRight className={AppConstants.Cart.CLASSES.ICON_SM} />
                </button>
              </div>
            )}

            <div className={AppConstants.Cart.CLASSES.SECURE_ROW}>
              <ShieldCheck className={AppConstants.Cart.CLASSES.SECURE_ICON} />
              <span>{AppConstants.Cart.COPY.SECURE_CHECKOUT}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
