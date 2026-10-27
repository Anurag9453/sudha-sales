// ============================================================================
// Customer Account Hub: src/app/(storefront)/account/page.tsx
// Opened when the logged-in customer clicks "Namaste <Username>" in the header.
// Displays:
// 1. Previous Orders, Delivery Status, Delivered Timestamp, and Printable Tax Invoice
// 2. Current Shopping Bag (live items, quantities, quick jump to checkout)
// 3. Stored Addresses (with Add New Address, Edit Existing Address, Delete, Set Default)
// 4. Prominent Logout option
// All visual copy, CSS class names, accessibility attributes, routes, and
// formatting rules are bound to AppConstants.Account.
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
import { AppConstants } from '@/constants/app.constants';
import type { CustomerStoredAddress, Order } from '@/types/domain';

type ActiveTab =
  (typeof AppConstants.Account.TABS)[keyof typeof AppConstants.Account.TABS];
type AddressLabel =
  (typeof AppConstants.Account.ADDRESS_LABELS)[keyof typeof AppConstants.Account.ADDRESS_LABELS];

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

  const [activeTab, setActiveTab] = useState<ActiveTab>(
    AppConstants.Account.TABS.ORDERS
  );
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(
    null
  );

  useEffect(() => {
    const requestedTab = searchParams.get(AppConstants.Account.QUERY.TAB_PARAM);
    if (
      requestedTab === AppConstants.Account.TABS.ORDERS ||
      requestedTab === AppConstants.Account.TABS.BAG ||
      requestedTab === AppConstants.Account.TABS.ADDRESSES
    ) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  // Address Modal / Form State
  const [editingAddress, setEditingAddress] =
    useState<CustomerStoredAddress | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addrForm, setAddrForm] = useState<{
    id?: string;
    label: AddressLabel;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    is_default: boolean;
  }>({
    label: AppConstants.Account.ADDRESS_LABELS.HOME,
    full_name: AppConstants.Account.EMPTY_VALUE,
    phone: AppConstants.Account.EMPTY_VALUE,
    address_line1: AppConstants.Account.EMPTY_VALUE,
    address_line2: AppConstants.Account.EMPTY_VALUE,
    city: AppConstants.Account.EMPTY_VALUE,
    state: AppConstants.Account.EMPTY_VALUE,
    postal_code: AppConstants.Account.EMPTY_VALUE,
    is_default: false,
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(AppConstants.Account.ROUTES.LOGIN_WITH_NEXT);
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !customer) {
    return (
      <LuxurySpinner
        title={AppConstants.Account.COPY.LOADING_TITLE}
        subtitle={AppConstants.Account.COPY.LOADING_SUBTITLE}
      />
    );
  }

  const firstName =
    customer.name.split(AppConstants.Account.NAME_SPLIT_SEPARATOR)[0] ||
    customer.name;

  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddrForm({
      label: AppConstants.Account.ADDRESS_LABELS.HOME,
      full_name: customer.name,
      phone: customer.phone,
      address_line1: AppConstants.Account.EMPTY_VALUE,
      address_line2: AppConstants.Account.EMPTY_VALUE,
      city: AppConstants.Account.EMPTY_VALUE,
      state: AppConstants.Account.EMPTY_VALUE,
      postal_code: AppConstants.Account.EMPTY_VALUE,
      is_default: addresses.length === 0,
    });
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: CustomerStoredAddress) => {
    setEditingAddress(addr);
    setAddrForm({
      id: addr.id,
      label: addr.label as AddressLabel,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || AppConstants.Account.EMPTY_VALUE,
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
    router.push(AppConstants.Account.ROUTES.LOGIN);
  };

  return (
    <div className={AppConstants.Account.CLASSES.PAGE}>
      {/* Greeting Banner */}
      <div className={AppConstants.Account.CLASSES.BANNER}>
        <div className={AppConstants.Account.CLASSES.BANNER_TEXT}>
          <div className={AppConstants.Account.CLASSES.BANNER_BADGE}>
            <Sparkles className={AppConstants.Account.CLASSES.ICON_BADGE} />
            <span>{AppConstants.Account.COPY.VERIFIED_BADGE}</span>
          </div>
          <h1 className={AppConstants.Account.CLASSES.BANNER_TITLE}>
            {AppConstants.Account.COPY.GREETING(firstName)}
          </h1>
          <p className={AppConstants.Account.CLASSES.BANNER_PROFILE}>
            {AppConstants.Account.COPY.PROFILE_LINE(
              customer.name,
              customer.email,
              customer.phone
            )}
          </p>
        </div>

        <button
          type={AppConstants.Account.BUTTON_TYPES.BUTTON}
          onClick={handleLogout}
          className={AppConstants.Account.CLASSES.LOGOUT_BUTTON}
        >
          <LogOut className={AppConstants.Account.CLASSES.ICON_MD} />
          <span>{AppConstants.Account.COPY.LOGOUT}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className={AppConstants.Account.CLASSES.TABS_BAR}>
        <button
          type={AppConstants.Account.BUTTON_TYPES.BUTTON}
          onClick={() => setActiveTab(AppConstants.Account.TABS.ORDERS)}
          className={AppConstants.Account.CLASSES.TAB(
            activeTab === AppConstants.Account.TABS.ORDERS
          )}
        >
          <Package className={AppConstants.Account.CLASSES.ICON_MD} />
          <span>{AppConstants.Account.COPY.TAB_ORDERS(orders.length)}</span>
        </button>

        <button
          type={AppConstants.Account.BUTTON_TYPES.BUTTON}
          onClick={() => setActiveTab(AppConstants.Account.TABS.BAG)}
          className={AppConstants.Account.CLASSES.TAB(
            activeTab === AppConstants.Account.TABS.BAG
          )}
        >
          <ShoppingBag className={AppConstants.Account.CLASSES.ICON_MD} />
          <span>{AppConstants.Account.COPY.TAB_BAG(totalQuantity)}</span>
        </button>

        <button
          type={AppConstants.Account.BUTTON_TYPES.BUTTON}
          onClick={() => setActiveTab(AppConstants.Account.TABS.ADDRESSES)}
          className={AppConstants.Account.CLASSES.TAB(
            activeTab === AppConstants.Account.TABS.ADDRESSES
          )}
        >
          <MapPin className={AppConstants.Account.CLASSES.ICON_MD} />
          <span>{AppConstants.Account.COPY.TAB_ADDRESSES(addresses.length)}</span>
        </button>
      </div>

      {/* TAB 1: PREVIOUS ORDERS, DELIVERY STATUS & INVOICES */}
      {activeTab === AppConstants.Account.TABS.ORDERS && (
        <div className={AppConstants.Account.CLASSES.ORDERS_LIST}>
          {orders.length === 0 ? (
            <div className={AppConstants.Account.CLASSES.EMPTY_ORDERS}>
              <Package className={AppConstants.Account.CLASSES.EMPTY_ICON} />
              <h2 className={AppConstants.Account.CLASSES.EMPTY_TITLE}>
                {AppConstants.Account.COPY.NO_ORDERS_TITLE}
              </h2>
              <p className={AppConstants.Account.CLASSES.EMPTY_BODY}>
                {AppConstants.Account.COPY.NO_ORDERS_BODY}
              </p>
              <Link
                href={AppConstants.Account.ROUTES.SHOP}
                className={AppConstants.Account.CLASSES.PRIMARY_LINK}
              >
                {AppConstants.Account.COPY.EXPLORE_COLLECTION}
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const isDelivered =
                order.status === AppConstants.Account.ORDER_STATUS.DELIVERED;
              const isShipped =
                order.status === AppConstants.Account.ORDER_STATUS.SHIPPED;

              return (
                <div
                  key={order.id}
                  className={AppConstants.Account.CLASSES.ORDER_CARD}
                >
                  {/* Order Top Summary Bar */}
                  <div className={AppConstants.Account.CLASSES.ORDER_TOP_BAR}>
                    <div className={AppConstants.Account.CLASSES.ORDER_TOP_FIELDS}>
                      <div>
                        <span className={AppConstants.Account.CLASSES.SUMMARY_LABEL}>
                          {AppConstants.Account.COPY.ORDER_NUMBER}
                        </span>
                        <span
                          className={AppConstants.Account.CLASSES.ORDER_NUMBER_VALUE}
                        >
                          {order.order_number}
                        </span>
                      </div>

                      <div>
                        <span className={AppConstants.Account.CLASSES.SUMMARY_LABEL}>
                          {AppConstants.Account.COPY.ORDER_PLACED}
                        </span>
                        <span
                          className={AppConstants.Account.CLASSES.ORDER_DATE_VALUE}
                        >
                          {new Date(order.created_at).toLocaleDateString(
                            AppConstants.Account.LOCALE,
                            AppConstants.Account.DATE_FORMATS.ORDER_PLACED
                          )}
                        </span>
                      </div>

                      <div>
                        <span className={AppConstants.Account.CLASSES.SUMMARY_LABEL}>
                          {AppConstants.Account.COPY.TOTAL_AMOUNT}
                        </span>
                        <span
                          className={AppConstants.Account.CLASSES.ORDER_TOTAL_VALUE}
                        >
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* View / Download Invoice Button */}
                    <button
                      type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className={AppConstants.Account.CLASSES.INVOICE_BUTTON}
                    >
                      <FileText
                        className={AppConstants.Account.CLASSES.INVOICE_BUTTON_ICON}
                      />
                      <span>{AppConstants.Account.COPY.VIEW_INVOICE}</span>
                    </button>
                  </div>

                  {/* Delivery Status & Delivered Date Banner */}
                  <div className={AppConstants.Account.CLASSES.STATUS_BAR}>
                    <div className={AppConstants.Account.CLASSES.STATUS_LEFT}>
                      {isDelivered ? (
                        <span className={AppConstants.Account.CLASSES.BADGE_DELIVERED}>
                          <CheckCircle2
                            className={
                              AppConstants.Account.CLASSES.BADGE_DELIVERED_ICON
                            }
                          />
                          {AppConstants.Account.COPY.STATUS_DELIVERED}
                        </span>
                      ) : isShipped ? (
                        <span className={AppConstants.Account.CLASSES.BADGE_SHIPPED}>
                          <Truck
                            className={AppConstants.Account.CLASSES.BADGE_SHIPPED_ICON}
                          />
                          {AppConstants.Account.COPY.STATUS_SHIPPED}
                        </span>
                      ) : (
                        <span className={AppConstants.Account.CLASSES.BADGE_OTHER}>
                          <Clock
                            className={AppConstants.Account.CLASSES.BADGE_OTHER_ICON}
                          />
                          {order.status}
                        </span>
                      )}

                      <div className={AppConstants.Account.CLASSES.STATUS_NOTE}>
                        {isDelivered && order.delivered_at ? (
                          <span>
                            {AppConstants.Account.COPY.DELIVERED_ON}
                            <strong className={AppConstants.Account.CLASSES.STRONG_DARK}>
                              {new Date(order.delivered_at).toLocaleDateString(
                                AppConstants.Account.LOCALE,
                                AppConstants.Account.DATE_FORMATS.DELIVERED_DATE
                              )}
                              {AppConstants.Account.COPY.DELIVERED_AT_JOINER}
                              {new Date(order.delivered_at).toLocaleTimeString(
                                AppConstants.Account.LOCALE,
                                AppConstants.Account.DATE_FORMATS.DELIVERED_TIME
                              )}
                            </strong>
                          </span>
                        ) : (
                          <span>
                            {order.notes || AppConstants.Account.COPY.DEFAULT_NOTE}
                          </span>
                        )}
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className={AppConstants.Account.CLASSES.TRACKING}>
                        {AppConstants.Account.COPY.COURIER_PREFIX}
                        <strong
                          className={AppConstants.Account.CLASSES.TRACKING_CARRIER}
                        >
                          {order.shipping_carrier}
                        </strong>
                        {AppConstants.Account.COPY.AWB_JOINER}
                        <code className={AppConstants.Account.CLASSES.TRACKING_AWB}>
                          {order.tracking_number}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className={AppConstants.Account.CLASSES.LINE_ITEMS}>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className={AppConstants.Account.CLASSES.LINE_ITEM}
                      >
                        <div>
                          <span className={AppConstants.Account.CLASSES.LINE_ITEM_SKU}>
                            {item.sku}
                          </span>
                          <Link
                            href={AppConstants.Account.ROUTES.PRODUCT(item.sku)}
                            className={AppConstants.Account.CLASSES.LINE_ITEM_LINK}
                          >
                            {item.product_name}
                          </Link>
                          <p className={AppConstants.Account.CLASSES.LINE_ITEM_META}>
                            {AppConstants.Account.COPY.SIZE_LABEL}
                            <strong>{item.selected_size}</strong>
                            {AppConstants.Account.COPY.QTY_JOINER}
                            <strong>{item.quantity}</strong>
                            {AppConstants.Account.COPY.COLOR_JOINER}
                            {item.color}
                          </p>
                        </div>
                        <div className={AppConstants.Account.CLASSES.LINE_ITEM_TOTAL}>
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
      {activeTab === AppConstants.Account.TABS.BAG && (
        <div className={AppConstants.Account.CLASSES.BAG_CARD}>
          <div className={AppConstants.Account.CLASSES.BAG_HEADER}>
            <div>
              <h2 className={AppConstants.Account.CLASSES.H2}>
                {AppConstants.Account.COPY.BAG_TITLE}
              </h2>
              <p className={AppConstants.Account.CLASSES.MUTED_XS}>
                {AppConstants.Account.COPY.BAG_COUNT(totalQuantity)}
              </p>
            </div>
            {cartItems.length > 0 && (
              <Link
                href={AppConstants.Account.ROUTES.CART}
                className={AppConstants.Account.CLASSES.CHECKOUT_LINK}
              >
                <span>
                  {AppConstants.Account.COPY.GO_TO_CHECKOUT(
                    formatPrice(subtotalAmount)
                  )}
                </span>
                <ArrowRight className={AppConstants.Account.CLASSES.ICON_MD} />
              </Link>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className={AppConstants.Account.CLASSES.BAG_EMPTY}>
              <p className={AppConstants.Account.CLASSES.BAG_EMPTY_TEXT}>
                {AppConstants.Account.COPY.BAG_EMPTY}
              </p>
              <Link
                href={AppConstants.Account.ROUTES.SHOP}
                className={AppConstants.Account.CLASSES.PRIMARY_LINK}
              >
                {AppConstants.Account.COPY.BROWSE_STYLES}
              </Link>
            </div>
          ) : (
            <div className={AppConstants.Account.CLASSES.BAG_LIST}>
              {cartItems.map((item) => (
                <div
                  key={`${item.sku}-${item.size}`}
                  className={AppConstants.Account.CLASSES.BAG_ITEM}
                >
                  <div className={AppConstants.Account.CLASSES.BAG_ITEM_LEFT}>
                    <div className={AppConstants.Account.CLASSES.BAG_IMAGE_WRAP}>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes={AppConstants.Account.IMAGE_SIZES}
                        className={AppConstants.Account.CLASSES.BAG_IMAGE}
                      />
                    </div>
                    <div>
                      <span className={AppConstants.Account.CLASSES.BAG_ITEM_SKU}>
                        {item.sku}
                      </span>
                      <Link
                        href={AppConstants.Account.ROUTES.PRODUCT(item.sku)}
                        className={AppConstants.Account.CLASSES.BAG_ITEM_LINK}
                      >
                        {item.name}
                      </Link>
                      <span className={AppConstants.Account.CLASSES.BAG_ITEM_META}>
                        {AppConstants.Account.COPY.SIZE_LABEL}
                        <strong>{item.size}</strong>
                        {AppConstants.Account.COPY.QTY_JOINER}
                        <strong>{item.quantity}</strong>
                      </span>
                    </div>
                  </div>

                  <span className={AppConstants.Account.CLASSES.BAG_ITEM_PRICE}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORED ADDRESSES (WITH EDIT / ADD / SET DEFAULT) */}
      {activeTab === AppConstants.Account.TABS.ADDRESSES && (
        <div className={AppConstants.Account.CLASSES.ADDRESSES_WRAP}>
          <div className={AppConstants.Account.CLASSES.ADDRESSES_HEADER}>
            <div>
              <h2 className={AppConstants.Account.CLASSES.H2}>
                {AppConstants.Account.COPY.ADDRESSES_TITLE}
              </h2>
              <p className={AppConstants.Account.CLASSES.MUTED_XS}>
                {AppConstants.Account.COPY.ADDRESSES_SUBTITLE}
              </p>
            </div>

            <button
              type={AppConstants.Account.BUTTON_TYPES.BUTTON}
              onClick={openNewAddressForm}
              className={AppConstants.Account.CLASSES.ADD_BUTTON}
            >
              <Plus className={AppConstants.Account.CLASSES.ICON_MD} />
              <span>{AppConstants.Account.COPY.ADD_ADDRESS}</span>
            </button>
          </div>

          {isAddressFormOpen && (
            <form
              onSubmit={handleSaveAddressSubmit}
              className={AppConstants.Account.CLASSES.FORM}
            >
              <div className={AppConstants.Account.CLASSES.FORM_HEADER}>
                <h3 className={AppConstants.Account.CLASSES.FORM_TITLE}>
                  {editingAddress
                    ? AppConstants.Account.COPY.FORM_TITLE_EDIT(editingAddress.label)
                    : AppConstants.Account.COPY.FORM_TITLE_NEW}
                </h3>
                <button
                  type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                  onClick={() => setIsAddressFormOpen(false)}
                  className={AppConstants.Account.CLASSES.FORM_CLOSE}
                >
                  <X className={AppConstants.Account.CLASSES.ICON_MD} />
                </button>
              </div>

              <div className={AppConstants.Account.CLASSES.GRID_3}>
                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_ADDRESS_LABEL}
                  </label>
                  <select
                    value={addrForm.label}
                    onChange={(e) =>
                      setAddrForm({
                        ...addrForm,
                        label: e.target.value as AddressLabel,
                      })
                    }
                    className={AppConstants.Account.CLASSES.SELECT}
                  >
                    <option value={AppConstants.Account.ADDRESS_LABELS.HOME}>
                      {AppConstants.Account.COPY.OPTION_HOME}
                    </option>
                    <option value={AppConstants.Account.ADDRESS_LABELS.WORK}>
                      {AppConstants.Account.COPY.OPTION_WORK}
                    </option>
                    <option value={AppConstants.Account.ADDRESS_LABELS.OTHER}>
                      {AppConstants.Account.COPY.OPTION_OTHER}
                    </option>
                  </select>
                </div>

                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_FULL_NAME}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    value={addrForm.full_name}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, full_name: e.target.value })
                    }
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>

                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_PHONE}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEL}
                    value={addrForm.phone}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, phone: e.target.value })
                    }
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>
              </div>

              <div className={AppConstants.Account.CLASSES.GRID_2}>
                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_LINE1}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    value={addrForm.address_line1}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, address_line1: e.target.value })
                    }
                    placeholder={AppConstants.Account.COPY.PLACEHOLDER_LINE1}
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>

                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_LINE2}
                  </label>
                  <input
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    value={addrForm.address_line2}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, address_line2: e.target.value })
                    }
                    placeholder={AppConstants.Account.COPY.PLACEHOLDER_LINE2}
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>
              </div>

              <div className={AppConstants.Account.CLASSES.GRID_3}>
                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_CITY}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, city: e.target.value })
                    }
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>

                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_STATE}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    value={addrForm.state}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, state: e.target.value })
                    }
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>

                <div>
                  <label className={AppConstants.Account.CLASSES.LABEL}>
                    {AppConstants.Account.COPY.LABEL_PIN}
                  </label>
                  <input
                    required
                    type={AppConstants.Account.INPUT_TYPES.TEXT}
                    pattern={AppConstants.Account.PIN_CODE_PATTERN}
                    value={addrForm.postal_code}
                    onChange={(e) =>
                      setAddrForm({ ...addrForm, postal_code: e.target.value })
                    }
                    className={AppConstants.Account.CLASSES.INPUT}
                  />
                </div>
              </div>

              <label className={AppConstants.Account.CLASSES.CHECKBOX_LABEL}>
                <input
                  type={AppConstants.Account.INPUT_TYPES.CHECKBOX}
                  checked={addrForm.is_default}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, is_default: e.target.checked })
                  }
                  className={AppConstants.Account.CLASSES.CHECKBOX}
                />
                <span>{AppConstants.Account.COPY.LABEL_DEFAULT}</span>
              </label>

              <div className={AppConstants.Account.CLASSES.FORM_ACTIONS}>
                <button
                  type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                  onClick={() => setIsAddressFormOpen(false)}
                  className={AppConstants.Account.CLASSES.CANCEL_BUTTON}
                >
                  {AppConstants.Account.COPY.CANCEL}
                </button>
                <button
                  type={AppConstants.Account.BUTTON_TYPES.SUBMIT}
                  className={AppConstants.Account.CLASSES.SAVE_BUTTON}
                >
                  {AppConstants.Account.COPY.SAVE_ADDRESS}
                </button>
              </div>
            </form>
          )}

          <div className={AppConstants.Account.CLASSES.ADDRESS_GRID}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={AppConstants.Account.CLASSES.ADDRESS_CARD(
                  addr.is_default
                )}
              >
                <div className={AppConstants.Account.CLASSES.ADDRESS_BODY}>
                  <div className={AppConstants.Account.CLASSES.ADDRESS_TOP}>
                    <span
                      className={
                        AppConstants.Account.CLASSES.ADDRESS_LABEL_BADGE
                      }
                    >
                      {addr.label}
                    </span>
                    {addr.is_default ? (
                      <span className={AppConstants.Account.CLASSES.DEFAULT_BADGE}>
                        {AppConstants.Account.COPY.DEFAULT_BADGE}
                      </span>
                    ) : (
                      <button
                        type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                        onClick={() => setDefaultAddress(addr.id)}
                        className={
                          AppConstants.Account.CLASSES.SET_DEFAULT_BUTTON
                        }
                      >
                        {AppConstants.Account.COPY.SET_DEFAULT}
                      </button>
                    )}
                  </div>

                  <p className={AppConstants.Account.CLASSES.ADDRESS_NAME}>
                    {addr.full_name}
                  </p>
                  <p className={AppConstants.Account.CLASSES.ADDRESS_LINES}>
                    {addr.address_line1}
                    {addr.address_line2
                      ? `${AppConstants.Account.COPY.LINE2_PREFIX}${addr.address_line2}`
                      : AppConstants.Account.EMPTY_VALUE}
                    <br />
                    {AppConstants.Account.COPY.CITY_STATE_PREFIX(
                      addr.city,
                      addr.state
                    )}
                    <strong>{addr.postal_code}</strong>
                  </p>
                  <p className={AppConstants.Account.CLASSES.ADDRESS_PHONE}>
                    {AppConstants.Account.COPY.PHONE_PREFIX}
                    <strong
                      className={
                        AppConstants.Account.CLASSES.ADDRESS_PHONE_VALUE
                      }
                    >
                      {addr.phone}
                    </strong>
                  </p>
                </div>

                <div className={AppConstants.Account.CLASSES.ADDRESS_ACTIONS}>
                  <button
                    type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                    onClick={() => openEditAddressForm(addr)}
                    className={AppConstants.Account.CLASSES.EDIT_BUTTON}
                  >
                    <Edit3 className={AppConstants.Account.CLASSES.ICON_SM} />
                    <span>{AppConstants.Account.COPY.EDIT_ADDRESS}</span>
                  </button>

                  {addresses.length > 1 && (
                    <button
                      type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                      onClick={() => deleteAddress(addr.id)}
                      className={AppConstants.Account.CLASSES.REMOVE_BUTTON}
                    >
                      <Trash2 className={AppConstants.Account.CLASSES.ICON_SM} />
                      <span>{AppConstants.Account.COPY.REMOVE}</span>
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
          role={AppConstants.Account.ARIA.ROLE_DIALOG}
          aria-modal={AppConstants.Account.ARIA.MODAL}
          className={AppConstants.Account.CLASSES.MODAL_OVERLAY}
        >
          <div className={AppConstants.Account.CLASSES.MODAL}>
            <div className={AppConstants.Account.CLASSES.MODAL_HEADER}>
              <div>
                <p className={AppConstants.Account.CLASSES.STORE_NAME}>
                  {publicEnv.storeName}
                </p>
                <p className={AppConstants.Account.CLASSES.MUTED_XS}>
                  {AppConstants.Account.COPY.INVOICE_SUBTITLE}
                </p>
              </div>
              <div className={AppConstants.Account.CLASSES.MODAL_ACTIONS}>
                <button
                  type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                  onClick={() => window.print()}
                  className={AppConstants.Account.CLASSES.PRINT_BUTTON}
                >
                  <Printer className={AppConstants.Account.CLASSES.ICON_SM} />
                  <span>{AppConstants.Account.COPY.PRINT_SAVE_PDF}</span>
                </button>
                <button
                  type={AppConstants.Account.BUTTON_TYPES.BUTTON}
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className={AppConstants.Account.CLASSES.MODAL_CLOSE}
                >
                  <X className={AppConstants.Account.CLASSES.ICON_MD} />
                </button>
              </div>
            </div>

            <div className={AppConstants.Account.CLASSES.INVOICE_GRID}>
              <div className={AppConstants.Account.CLASSES.BILLED_BOX}>
                <span className={AppConstants.Account.CLASSES.BILLED_LABEL}>
                  {AppConstants.Account.COPY.BILLED_TO}
                </span>
                <p className={AppConstants.Account.CLASSES.BILLED_NAME}>
                  {selectedInvoiceOrder.shipping_address.full_name}
                </p>
                <p className={AppConstants.Account.CLASSES.BILLED_LINE}>
                  {selectedInvoiceOrder.shipping_address.address_line1}
                  {selectedInvoiceOrder.shipping_address.address_line2
                    ? `${AppConstants.Account.COPY.LINE2_PREFIX}${selectedInvoiceOrder.shipping_address.address_line2}`
                    : AppConstants.Account.EMPTY_VALUE}
                </p>
                <p className={AppConstants.Account.CLASSES.BILLED_LINE}>
                  {AppConstants.Account.COPY.INVOICE_CITY_LINE(
                    selectedInvoiceOrder.shipping_address.city,
                    selectedInvoiceOrder.shipping_address.state,
                    selectedInvoiceOrder.shipping_address.postal_code
                  )}
                </p>
                <p className={AppConstants.Account.CLASSES.BILLED_LINE}>
                  {AppConstants.Account.COPY.INVOICE_PHONE(
                    selectedInvoiceOrder.shipping_address.phone
                  )}
                </p>
              </div>

              <div className={AppConstants.Account.CLASSES.META_BOX}>
                <div className={AppConstants.Account.CLASSES.SPLIT_ROW}>
                  <span className={AppConstants.Account.CLASSES.MUTED_LABEL}>
                    {AppConstants.Account.COPY.INVOICE_NO}
                  </span>
                  <strong className={AppConstants.Account.CLASSES.META_MONO_STRONG}>
                    {selectedInvoiceOrder.order_number}
                  </strong>
                </div>
                <div className={AppConstants.Account.CLASSES.SPLIT_ROW}>
                  <span className={AppConstants.Account.CLASSES.MUTED_LABEL}>
                    {AppConstants.Account.COPY.ORDER_DATE}
                  </span>
                  <strong className={AppConstants.Account.CLASSES.META_STRONG}>
                    {new Date(selectedInvoiceOrder.created_at).toLocaleDateString(
                      AppConstants.Account.LOCALE
                    )}
                  </strong>
                </div>
                <div className={AppConstants.Account.CLASSES.SPLIT_ROW}>
                  <span className={AppConstants.Account.CLASSES.MUTED_LABEL}>
                    {AppConstants.Account.COPY.DELIVERY_STATUS}
                  </span>
                  <strong className={AppConstants.Account.CLASSES.META_STATUS}>
                    {selectedInvoiceOrder.status}
                  </strong>
                </div>
                {selectedInvoiceOrder.delivered_at && (
                  <div className={AppConstants.Account.CLASSES.SPLIT_ROW}>
                    <span className={AppConstants.Account.CLASSES.MUTED_LABEL}>
                      {AppConstants.Account.COPY.DELIVERED_ON_LABEL}
                    </span>
                    <strong className={AppConstants.Account.CLASSES.META_STRONG}>
                      {new Date(
                        selectedInvoiceOrder.delivered_at
                      ).toLocaleDateString(AppConstants.Account.LOCALE)}
                    </strong>
                  </div>
                )}
                <div className={AppConstants.Account.CLASSES.SPLIT_ROW}>
                  <span className={AppConstants.Account.CLASSES.MUTED_LABEL}>
                    {AppConstants.Account.COPY.PAYMENT_REFERENCE}
                  </span>
                  <span className={AppConstants.Account.CLASSES.META_MONO}>
                    {selectedInvoiceOrder.payment_reference}
                  </span>
                </div>
              </div>
            </div>

            <table className={AppConstants.Account.CLASSES.TABLE}>
              <thead>
                <tr className={AppConstants.Account.CLASSES.THEAD_ROW}>
                  <th className={AppConstants.Account.CLASSES.TH}>
                    {AppConstants.Account.COPY.TH_ITEM}
                  </th>
                  <th className={AppConstants.Account.CLASSES.TH}>
                    {AppConstants.Account.COPY.TH_SIZE}
                  </th>
                  <th className={AppConstants.Account.CLASSES.TH}>
                    {AppConstants.Account.COPY.TH_QTY}
                  </th>
                  <th className={AppConstants.Account.CLASSES.TH_RIGHT}>
                    {AppConstants.Account.COPY.TH_UNIT_PRICE}
                  </th>
                  <th className={AppConstants.Account.CLASSES.TH_RIGHT}>
                    {AppConstants.Account.COPY.TH_LINE_TOTAL}
                  </th>
                </tr>
              </thead>
              <tbody className={AppConstants.Account.CLASSES.TBODY}>
                {selectedInvoiceOrder.items?.map((item) => (
                  <tr key={item.id}>
                    <td className={AppConstants.Account.CLASSES.TD_ITEM}>
                      <span className={AppConstants.Account.CLASSES.TD_SKU}>
                        {item.sku}
                      </span>
                      <strong className={AppConstants.Account.CLASSES.TD_NAME}>
                        {item.product_name}
                      </strong>
                    </td>
                    <td className={AppConstants.Account.CLASSES.TD_SIZE}>
                      {item.selected_size}
                    </td>
                    <td className={AppConstants.Account.CLASSES.TD_ITEM}>
                      {item.quantity}
                    </td>
                    <td className={AppConstants.Account.CLASSES.TD_RIGHT}>
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className={AppConstants.Account.CLASSES.TD_RIGHT_BOLD}>
                      {formatPrice(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={AppConstants.Account.CLASSES.TOTALS}>
              <div className={AppConstants.Account.CLASSES.TOTAL_ROW}>
                <span>{AppConstants.Account.COPY.SUBTOTAL}</span>
                <span>{formatPrice(selectedInvoiceOrder.subtotal_amount)}</span>
              </div>
              <div className={AppConstants.Account.CLASSES.TOTAL_ROW}>
                <span>{AppConstants.Account.COPY.SHIPPING}</span>
                <span>
                  {selectedInvoiceOrder.shipping_amount ===
                  AppConstants.Account.FREE_SHIPPING_AMOUNT
                    ? AppConstants.Account.COPY.FREE
                    : formatPrice(selectedInvoiceOrder.shipping_amount)}
                </span>
              </div>
              <div className={AppConstants.Account.CLASSES.GRAND_ROW}>
                <span>{AppConstants.Account.COPY.GRAND_TOTAL}</span>
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
          title={AppConstants.Account.COPY.LOADING_TITLE}
          subtitle={AppConstants.Account.COPY.LOADING_SUBTITLE}
        />
      }
    >
      <CustomerAccountContent />
    </Suspense>
  );
}
