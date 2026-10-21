// ============================================================================
// Customer Account Hub: src/app/(storefront)/account/page.tsx
// Opened when the logged-in customer clicks "Namaste <Username>" in the header.
// Displays:
// 1. Previous Orders, Delivery Status, Delivered Timestamp, and Printable Tax Invoice
// 2. Current Shopping Bag (live items, quantities, quick jump to checkout)
// 3. Stored Addresses (with Add New Address, Edit Existing Address, Delete, Set Default)
// 4. Prominent Logout option
// ============================================================================

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  FileText,
  ShoppingBag,
  MapPin,
  LogOut,
  CheckCircle2,
  Truck,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Printer,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { useCart } from '@/store/cart-context';
import { formatPrice } from '@/lib/format';
import { publicEnv } from '@/lib/env';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';
import type { CustomerStoredAddress, Order } from '@/types/domain';

function CustomerAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    customer,
    isAuthenticated,
    isHydrated,
    addresses,
    orders,
    signOutCustomer,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCustomerAuth();

  const { items: cartItems, totalQuantity, subtotalAmount } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'bag' | 'addresses'>('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (
      requestedTab === 'orders' ||
      requestedTab === 'bag' ||
      requestedTab === 'addresses'
    ) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  // Address Modal / Form State
  const [editingAddress, setEditingAddress] = useState<CustomerStoredAddress | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addrForm, setAddrForm] = useState<{
    id?: string;
    label: 'Home' | 'Work' | 'Other';
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    is_default: boolean;
  }>({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false,
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login?next=/account');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !customer) {
    return (
      <LuxurySpinner
        title="Loading Your Account..."
        subtitle="Fetching your orders, invoices, shopping bag & saved addresses"
      />
    );
  }

  const firstName = customer.name.split(' ')[0] || customer.name;

  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddrForm({
      label: 'Home',
      full_name: customer.name,
      phone: customer.phone,
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: addresses.length === 0,
    });
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: CustomerStoredAddress) => {
    setEditingAddress(addr);
    setAddrForm({
      id: addr.id,
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setIsAddressFormOpen(true);
  };

  const handleSaveAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddress({
      id: addrForm.id,
      label: addrForm.label,
      full_name: addrForm.full_name,
      phone: addrForm.phone,
      address_line1: addrForm.address_line1,
      address_line2: addrForm.address_line2,
      city: addrForm.city,
      state: addrForm.state,
      postal_code: addrForm.postal_code,
      is_default: addrForm.is_default,
    });
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const handleLogout = async () => {
    await signOutCustomer();
    router.push('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Greeting Banner */}
      <div className="rounded-3xl bg-stone-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Customer Profile</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold">
            Namaste, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            {customer.name} • {customer.email} • {customer.phone}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-rose-600/90 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Previous Orders &amp; Invoices ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bag')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'bag'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Current Shopping Bag ({totalQuantity})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Stored Addresses ({addresses.length})</span>
        </button>
      </div>

      {/* TAB 1: PREVIOUS ORDERS, DELIVERY STATUS & INVOICES */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
              <Package className="w-8 h-8 text-stone-400 mx-auto" />
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                No Orders Yet
              </h2>
              <p className="text-xs text-stone-500">
                Once you place an order, its live delivery status and tax invoice
                will appear here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const isDelivered = order.status === 'DELIVERED';
              const isShipped = order.status === 'SHIPPED';

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-2xs"
                >
                  {/* Order Top Summary Bar */}
                  <div className="p-5 sm:px-6 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
                      <div>
                        <span className="text-stone-400 uppercase tracking-wider block text-[10px] font-semibold">
                          Order Number
                        </span>
                        <span className="font-mono font-bold text-stone-950 text-sm">
                          {order.order_number}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 uppercase tracking-wider block text-[10px] font-semibold">
                          Order Placed
                        </span>
                        <span className="font-semibold text-stone-800">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 uppercase tracking-wider block text-[10px] font-semibold">
                          Total Amount
                        </span>
                        <span className="font-bold text-stone-950 text-sm">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* View / Download Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-900 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-800" />
                      <span>View / Print Tax Invoice</span>
                    </button>
                  </div>

                  {/* Delivery Status & Delivered Date Banner */}
                  <div className="px-5 sm:px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          DELIVERED
                        </span>
                      ) : isShipped ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                          <Truck className="w-4 h-4 text-amber-700" />
                          SHIPPED • IN TRANSIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                          <Clock className="w-4 h-4 text-blue-700" />
                          {order.status}
                        </span>
                      )}

                      <div className="text-xs text-stone-700">
                        {isDelivered && order.delivered_at ? (
                          <span>
                            Delivered on{' '}
                            <strong className="text-stone-950">
                              {new Date(order.delivered_at).toLocaleDateString(
                                'en-IN',
                                {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}{' '}
                              at{' '}
                              {new Date(order.delivered_at).toLocaleTimeString(
                                'en-IN',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </strong>
                          </span>
                        ) : (
                          <span>{order.notes || 'Preparing warehouse dispatch'}</span>
                        )}
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className="text-xs text-stone-500">
                        Courier: <strong className="text-stone-800">{order.shipping_carrier}</strong> •
                        AWB: <code className="font-mono text-stone-900">{order.tracking_number}</code>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="p-5 sm:px-6 divide-y divide-stone-100">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm"
                      >
                        <div>
                          <span className="font-mono text-[11px] text-stone-400 mr-2">
                            {item.sku}
                          </span>
                          <Link
                            href={`/product/${item.sku}`}
                            className="font-semibold text-stone-900 hover:underline"
                          >
                            {item.product_name}
                          </Link>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Size: <strong>{item.selected_size}</strong> • Qty:{' '}
                            <strong>{item.quantity}</strong> • Color: {item.color}
                          </p>
                        </div>
                        <div className="font-bold text-stone-950">
                          {formatPrice(item.line_total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: CURRENT SHOPPING BAG */}
      {activeTab === 'bag' && (
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-950">
                Your Active Shopping Bag
              </h2>
              <p className="text-xs text-stone-500">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} currently in
                your bag
              </p>
            </div>
            {cartItems.length > 0 && (
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                <span>Go to Checkout ({formatPrice(subtotalAmount)})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-stone-500">
                Your shopping bag is currently empty.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold"
              >
                Browse Latest Styles
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {cartItems.map((item) => (
                <div
                  key={`${item.sku}-${item.size}`}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-stone-400">
                        {item.sku}
                      </span>
                      <Link
                        href={`/product/${item.sku}`}
                        className="block text-sm font-semibold text-stone-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-stone-500">
                        Size: <strong>{item.size}</strong> • Qty:{' '}
                        <strong>{item.quantity}</strong>
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-stone-950">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORED ADDRESSES (WITH EDIT / ADD / SET DEFAULT) */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-950">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-stone-500">
                Add or edit your delivery addresses for faster 1-click checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewAddressForm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {isAddressFormOpen && (
            <form
              onSubmit={handleSaveAddressSubmit}
              className="p-6 rounded-3xl bg-white border-2 border-stone-900 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  {editingAddress
                    ? `Edit ${editingAddress.label} Address`
                    : 'Add New Delivery Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddressFormOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Address Label
                  </label>
                  <select
                    value={addrForm.label}
                    onChange={(e) =>
                      setAddrForm({
                        ...addrForm,
                        label: e.target.value as 'Home' | 'Work' | 'Other',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work / Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={addrForm.full_name}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, full_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={addrForm.phone}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    House / Flat / Building &amp; Street *
                  </label>
                  <input
                    required
                    type="text"
                    value={addrForm.address_line1}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, address_line1: e.target.value })
                    }
                    placeholder="Flat 402, Lotus Enclave"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Area / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addrForm.address_line2}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, address_line2: e.target.value })
                    }
                    placeholder="Near Central Park"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    required
                    type="text"
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    required
                    type="text"
                    value={addrForm.state}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, state: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    required
                    type="text"
                    pattern="[0-9]{6}"
                    value={addrForm.postal_code}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, postal_code: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrForm.is_default}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, is_default: e.target.checked })
                  }
                  className="rounded border-stone-300"
                />
                <span>Set as my default delivery address</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                  addr.is_default
                    ? 'border-stone-900 ring-1 ring-stone-900/10'
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold">
                      {addr.label}
                    </span>
                    {addr.is_default ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Default Address
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-bold text-stone-950 pt-1">
                    {addr.full_name}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.address_line1}
                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}
                    <br />
                    {addr.city}, {addr.state} — <strong>{addr.postal_code}</strong>
                  </p>
                  <p className="text-xs text-stone-500 pt-1">
                    Phone: <strong className="text-stone-800">{addr.phone}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditAddressForm(addr)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Address</span>
                  </button>

                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAX INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <p className="font-serif text-2xl font-bold tracking-wider text-stone-950">
                  {publicEnv.storeName}
                </p>
                <p className="text-xs text-stone-500">
                  Tax Invoice / Bill of Supply • Original for Recipient
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Billed &amp; Shipped To
                </span>
                <p className="font-bold text-stone-900 text-sm">
                  {selectedInvoiceOrder.shipping_address.full_name}
                </p>
                <p className="text-stone-600">
                  {selectedInvoiceOrder.shipping_address.address_line1}
                  {selectedInvoiceOrder.shipping_address.address_line2
                    ? `, ${selectedInvoiceOrder.shipping_address.address_line2}`
                    : ''}
                </p>
                <p className="text-stone-600">
                  {selectedInvoiceOrder.shipping_address.city},{' '}
                  {selectedInvoiceOrder.shipping_address.state} -{' '}
                  {selectedInvoiceOrder.shipping_address.postal_code}
                </p>
                <p className="text-stone-600">
                  Phone: {selectedInvoiceOrder.shipping_address.phone}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Invoice / Order No:</span>
                  <strong className="font-mono text-stone-900">
                    {selectedInvoiceOrder.order_number}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Date:</span>
                  <strong className="text-stone-900">
                    {new Date(selectedInvoiceOrder.created_at).toLocaleDateString(
                      'en-IN'
                    )}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Status:</span>
                  <strong className="text-emerald-800">
                    {selectedInvoiceOrder.status}
                  </strong>
                </div>
                {selectedInvoiceOrder.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivered On:</span>
                    <strong className="text-stone-900">
                      {new Date(
                        selectedInvoiceOrder.delivered_at
                      ).toLocaleDateString('en-IN')}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Reference:</span>
                  <span className="font-mono text-stone-800">
                    {selectedInvoiceOrder.payment_reference}
                  </span>
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                  <th className="py-2">SKU &amp; Item</th>
                  <th className="py-2">Size</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {selectedInvoiceOrder.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5">
                      <span className="font-mono text-[10px] text-stone-500 block">
                        {item.sku}
                      </span>
                      <strong className="text-stone-900">{item.product_name}</strong>
                    </td>
                    <td className="py-2.5 font-semibold">{item.selected_size}</td>
                    <td className="py-2.5">{item.quantity}</td>
                    <td className="py-2.5 text-right">
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      {formatPrice(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-stone-200 pt-4 space-y-1.5 text-xs max-w-xs ml-auto">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal (Incl. GST):</span>
                <span>{formatPrice(selectedInvoiceOrder.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Charges:</span>
                <span>
                  {selectedInvoiceOrder.shipping_amount === 0
                    ? 'FREE'
                    : formatPrice(selectedInvoiceOrder.shipping_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-950 pt-1 border-t border-stone-200">
                <span>Grand Total Paid:</span>
                <span>{formatPrice(selectedInvoiceOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense
      fallback={
        <LuxurySpinner
          title="Loading Your Account..."
          subtitle="Fetching your orders, invoices, shopping bag & saved addresses"
        />
      }
    >
      <CustomerAccountContent />
    </Suspense>
  );
}
