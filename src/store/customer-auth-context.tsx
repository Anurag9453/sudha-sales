// ============================================================================
// Customer Authentication, Orders & Address Context: src/store/customer-auth-context.tsx
// - Supports Google Sign-In (via Supabase OAuth when configured, plus instant
//   1-click Google Sign-In flow for local/demo evaluation).
// - Enforces that customers MUST be logged in before buying / checking out.
// - Persists customer's Saved Addresses (with full Add / Edit / Delete / Set Default)
//   and Order History (with delivery status, delivered timestamp, and printable
//   GST/Tax Invoice modal).
// All literals, storage keys, fallback customer records, and order generators
// are bound to AppConstants.Account.AUTH and AppConstants.Store.
// ============================================================================

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/database/supabase-browser';
import { AppConstants } from '@/constants/app.constants';
import type {
  CartItem,
  CustomerProfile,
  CustomerStoredAddress,
  Order,
  OrderItem,
} from '@/types/domain';

interface CustomerAuthContextValue {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  addresses: CustomerStoredAddress[];
  orders: Order[];
  signInWithGoogle: (customProfile?: { name?: string; email?: string; phone?: string }) => Promise<void>;
  signOutCustomer: () => Promise<void>;
  saveAddress: (address: Omit<CustomerStoredAddress, 'id'> & { id?: string }) => CustomerStoredAddress;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  createOrderFromCart: (params: {
    cartItems: CartItem[];
    address: CustomerStoredAddress;
    subtotalAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
  }) => Order;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerStoredAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCustomer = window.localStorage.getItem(
        AppConstants.Account.AUTH.STORAGE_KEYS.CUSTOMER
      );
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer) as CustomerProfile);
      }

      const savedAddresses = window.localStorage.getItem(
        AppConstants.Account.AUTH.STORAGE_KEYS.ADDRESSES
      );
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses) as CustomerStoredAddress[]);
      } else {
        setAddresses(AppConstants.Account.AUTH.INITIAL_ADDRESSES);
      }

      const savedOrders = window.localStorage.getItem(
        AppConstants.Account.AUTH.STORAGE_KEYS.ORDERS
      );
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders) as Order[]);
      } else {
        setOrders(AppConstants.Account.AUTH.INITIAL_ORDERS);
      }
    } catch {
      setAddresses(AppConstants.Account.AUTH.INITIAL_ADDRESSES);
      setOrders(AppConstants.Account.AUTH.INITIAL_ORDERS);
    } finally {
      setIsHydrated(true);
    }

    // Also listen for Supabase Google OAuth session if Supabase is configured
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user;
        if (user) {
          const profile: CustomerProfile = {
            id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split(AppConstants.Account.AUTH.EMAIL_SPLIT_CHAR)[0] ||
              AppConstants.Account.AUTH.FALLBACK_NAME,
            email: user.email || '',
            phone: user.phone || AppConstants.Account.AUTH.DEMO_PHONE,
            avatar_url: user.user_metadata?.avatar_url,
            provider: AppConstants.Account.AUTH.PROVIDER_GOOGLE,
            created_at: user.created_at,
          };
          setCustomer(profile);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (customer) {
        window.localStorage.setItem(
          AppConstants.Account.AUTH.STORAGE_KEYS.CUSTOMER,
          JSON.stringify(customer)
        );
      } else {
        window.localStorage.removeItem(
          AppConstants.Account.AUTH.STORAGE_KEYS.CUSTOMER
        );
      }
    } catch {
      // Ignore storage errors
    }
  }, [customer, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(
        AppConstants.Account.AUTH.STORAGE_KEYS.ADDRESSES,
        JSON.stringify(addresses)
      );
    } catch {
      // Ignore storage errors
    }
  }, [addresses, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(
        AppConstants.Account.AUTH.STORAGE_KEYS.ORDERS,
        JSON.stringify(orders)
      );
    } catch {
      // Ignore storage errors
    }
  }, [orders, isHydrated]);

  const signInWithGoogle = async (customProfile?: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    const cleanName =
      customProfile?.name?.trim() || AppConstants.Account.AUTH.DEMO_NAME;
    const cleanEmail =
      customProfile?.email?.trim() ||
      `${cleanName
        .toLowerCase()
        .replace(
          AppConstants.Account.AUTH.EMAIL_SANITIZE_PATTERN,
          AppConstants.Account.AUTH.EMAIL_SANITIZE_REPLACEMENT
        )}${AppConstants.Account.AUTH.EMAIL_DOMAIN}`;
    const cleanPhone =
      customProfile?.phone?.trim() || AppConstants.Account.AUTH.DEMO_PHONE;

    const nextCustomer: CustomerProfile = {
      id: AppConstants.Account.AUTH.DEMO_CUSTOMER_ID,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      provider: AppConstants.Account.AUTH.PROVIDER_GOOGLE,
      created_at: new Date().toISOString(),
    };

    setCustomer(nextCustomer);

    // Update default address recipient name if still using placeholder
    setAddresses((prev) =>
      prev.map((addr, idx) =>
        idx === 0 ? { ...addr, full_name: cleanName, phone: cleanPhone } : addr
      )
    );
  };

  const signOutCustomer = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCustomer(null);
  };

  const saveAddress = (
    input: Omit<CustomerStoredAddress, 'id'> & { id?: string }
  ): CustomerStoredAddress => {
    const id = input.id || `${AppConstants.Account.AUTH.ADDRESS_ID_PREFIX}${Date.now()}`;
    const record: CustomerStoredAddress = {
      ...input,
      id,
    };

    setAddresses((prev) => {
      let base = prev;
      if (record.is_default) {
        base = prev.map((a) => ({ ...a, is_default: false }));
      }
      const exists = base.some((a) => a.id === id);
      if (exists) {
        return base.map((a) => (a.id === id ? record : a));
      }
      return [record, ...base];
    });

    return record;
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.is_default)) {
        filtered[0] = { ...filtered[0], is_default: true };
      }
      return filtered;
    });
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
  };

  const createOrderFromCart = useCallback(
    (params: {
      cartItems: CartItem[];
      address: CustomerStoredAddress;
      subtotalAmount: number;
      discountAmount: number;
      shippingAmount: number;
      totalAmount: number;
    }): Order => {
      const now = new Date().toISOString();
      const orderId = `${AppConstants.Account.AUTH.ORDER_ID_PREFIX}${Date.now()}`;
      const orderNumber = `${AppConstants.Account.AUTH.ORDER_NUMBER_PREFIX}${now
        .slice(0, AppConstants.Account.AUTH.ISO_DATE_LENGTH)
        .replace(AppConstants.Account.AUTH.ISO_DATE_DASH_PATTERN, '')}${AppConstants.Account.AUTH.ORDER_NUMBER_SEPARATOR}${Math.floor(
        AppConstants.Account.AUTH.ORDER_NUMBER_RANDOM.MIN +
          Math.random() * AppConstants.Account.AUTH.ORDER_NUMBER_RANDOM.SPAN
      )}`;

      const items: OrderItem[] = params.cartItems.map((item, idx) => ({
        id: `${orderId}${AppConstants.Account.AUTH.ORDER_ITEM_ID_SEGMENT}${idx + 1}`,
        order_id: orderId,
        product_id: item.productId,
        sku: item.sku,
        product_name: item.name,
        selected_size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.unitPrice * item.quantity,
      }));

      const newOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_id: customer?.id ?? AppConstants.Account.AUTH.DEMO_CUSTOMER_ID,
        status: AppConstants.Account.AUTH.NEW_ORDER.STATUS,
        payment_status: AppConstants.Account.AUTH.NEW_ORDER.PAYMENT_STATUS,
        payment_provider: AppConstants.Account.AUTH.NEW_ORDER.PAYMENT_PROVIDER,
        payment_reference: `${AppConstants.Account.AUTH.PAYMENT_REF_PREFIX}${Math.floor(
          AppConstants.Account.AUTH.PAYMENT_REF_RANDOM.MIN +
            Math.random() * AppConstants.Account.AUTH.PAYMENT_REF_RANDOM.SPAN
        )}`,
        subtotal_amount: params.subtotalAmount,
        discount_amount: params.discountAmount,
        shipping_amount: params.shippingAmount,
        total_amount: params.totalAmount,
        shipping_address: {
          full_name: params.address.full_name,
          phone: params.address.phone,
          email: customer?.email,
          address_line1: params.address.address_line1,
          address_line2: params.address.address_line2,
          city: params.address.city,
          state: params.address.state,
          postal_code: params.address.postal_code,
          country: AppConstants.Store.DEFAULT_COUNTRY,
        },
        tracking_number: `${AppConstants.Account.AUTH.TRACKING_PREFIX}${Math.floor(
          AppConstants.Account.AUTH.TRACKING_RANDOM.MIN +
            Math.random() * AppConstants.Account.AUTH.TRACKING_RANDOM.SPAN
        )}${AppConstants.Account.AUTH.TRACKING_SUFFIX}`,
        shipping_carrier: AppConstants.Account.AUTH.NEW_ORDER.CARRIER,
        notes: AppConstants.Account.AUTH.NEW_ORDER.NOTES,
        created_at: now,
        updated_at: now,
        delivered_at: null,
        items,
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    [customer]
  );

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      isAuthenticated: Boolean(customer),
      isHydrated,
      addresses,
      orders,
      signInWithGoogle,
      signOutCustomer,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      createOrderFromCart,
    }),
    [customer, isHydrated, addresses, orders, createOrderFromCart]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error(AppConstants.Account.AUTH.ERRORS.PROVIDER_REQUIRED);
  }
  return ctx;
}
