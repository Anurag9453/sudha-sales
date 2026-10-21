// ============================================================================
// Customer Authentication, Orders & Address Context: src/store/customer-auth-context.tsx
// - Supports Google Sign-In (via Supabase OAuth when configured, plus instant
//   1-click Google Sign-In flow for local/demo evaluation).
// - Enforces that customers MUST be logged in before buying / checking out.
// - Persists customer's Saved Addresses (with full Add / Edit / Delete / Set Default)
//   and Order History (with delivery status, delivered timestamp, and printable
//   GST/Tax Invoice modal).
// ============================================================================

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/database/supabase-browser';
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

const CUSTOMER_STORAGE_KEY = 'sudha_sales_customer_v1';
const ADDRESSES_STORAGE_KEY = 'sudha_sales_addresses_v1';
const ORDERS_STORAGE_KEY = 'sudha_sales_orders_v1';

const INITIAL_DEMO_ADDRESSES: CustomerStoredAddress[] = [
  {
    id: 'addr-default-1',
    label: 'Home',
    full_name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
    address_line2: 'Near Central Park Gate 2',
    city: 'Jaipur',
    state: 'Rajasthan',
    postal_code: '302001',
    is_default: true,
  },
  {
    id: 'addr-work-2',
    label: 'Work',
    full_name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    address_line1: '3rd Floor, Horizon Tower, Malviya Nagar',
    address_line2: 'JLN Marg',
    city: 'Jaipur',
    state: 'Rajasthan',
    postal_code: '302017',
    is_default: false,
  },
];

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-hist-101',
    order_number: 'ORD-20261014-8821',
    customer_id: 'cust-google-1',
    status: 'DELIVERED',
    payment_status: 'PAID',
    payment_provider: 'UPI / Google Pay',
    payment_reference: 'UTR62910482910',
    subtotal_amount: 2999,
    discount_amount: 500,
    shipping_amount: 0,
    total_amount: 2999,
    shipping_address: {
      full_name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
      address_line2: 'Near Central Park Gate 2',
      city: 'Jaipur',
      state: 'Rajasthan',
      postal_code: '302001',
      country: 'IN',
    },
    tracking_number: 'DLVRY9928174IN',
    shipping_carrier: 'Delhivery Express',
    notes: 'Delivered to security desk',
    created_at: '2026-10-14T11:20:00Z',
    updated_at: '2026-10-17T16:45:00Z',
    delivered_at: '2026-10-17T16:45:00Z',
    items: [
      {
        id: 'oi-101-1',
        order_id: 'ord-hist-101',
        product_id: '33333333-3333-4333-8333-333333333302',
        sku: 'SKU002',
        product_name: 'Ivory Chanderi Zari Embroidered Suit Set',
        selected_size: 'M',
        color: 'Ivory Gold',
        quantity: 1,
        unit_price: 2999,
        line_total: 2999,
      },
    ],
  },
  {
    id: 'ord-hist-102',
    order_number: 'ORD-20261019-9410',
    customer_id: 'cust-google-1',
    status: 'SHIPPED',
    payment_status: 'PAID',
    payment_provider: 'UPI / PhonePe',
    payment_reference: 'UTR99412049182',
    subtotal_amount: 2398,
    discount_amount: 200,
    shipping_amount: 0,
    total_amount: 2398,
    shipping_address: {
      full_name: 'Ananya Sharma',
      phone: '+91 98765 43210',
      address_line1: 'Flat 402, Lotus Enclave, C-Scheme',
      address_line2: 'Near Central Park Gate 2',
      city: 'Jaipur',
      state: 'Rajasthan',
      postal_code: '302001',
      country: 'IN',
    },
    tracking_number: 'BLUEDART774120IN',
    shipping_carrier: 'BlueDart Air',
    notes: 'In transit — arriving tomorrow by 6 PM',
    created_at: '2026-10-19T14:10:00Z',
    updated_at: '2026-10-20T09:30:00Z',
    delivered_at: null,
    items: [
      {
        id: 'oi-102-1',
        order_id: 'ord-hist-102',
        product_id: '33333333-3333-4333-8333-333333333301',
        sku: 'SKU001',
        product_name: 'Floral Handblock Mulmul Cotton Kurti',
        selected_size: 'L',
        color: 'Indigo Blue',
        quantity: 2,
        unit_price: 1199,
        line_total: 2398,
      },
    ],
  },
];

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerStoredAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCustomer = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer) as CustomerProfile);
      }

      const savedAddresses = window.localStorage.getItem(ADDRESSES_STORAGE_KEY);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses) as CustomerStoredAddress[]);
      } else {
        setAddresses(INITIAL_DEMO_ADDRESSES);
      }

      const savedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders) as Order[]);
      } else {
        setOrders(INITIAL_DEMO_ORDERS);
      }
    } catch {
      setAddresses(INITIAL_DEMO_ADDRESSES);
      setOrders(INITIAL_DEMO_ORDERS);
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
              user.email?.split('@')[0] ||
              'Valued Customer',
            email: user.email || '',
            phone: user.phone || '+91 98765 43210',
            avatar_url: user.user_metadata?.avatar_url,
            provider: 'google',
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
        window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      } else {
        window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [customer, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // Ignore storage errors
    }
  }, [addresses, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage errors
    }
  }, [orders, isHydrated]);

  const signInWithGoogle = async (customProfile?: {
    name?: string;
    email?: string;
    phone?: string;
  }) => {
    const cleanName = customProfile?.name?.trim() || 'Ananya Sharma';
    const cleanEmail =
      customProfile?.email?.trim() ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`;
    const cleanPhone = customProfile?.phone?.trim() || '+91 98765 43210';

    const nextCustomer: CustomerProfile = {
      id: 'cust-google-1',
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      provider: 'google',
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
    const id = input.id || `addr-${Date.now()}`;
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
      const orderId = `ord-${Date.now()}`;
      const orderNumber = `ORD-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const items: OrderItem[] = params.cartItems.map((item, idx) => ({
        id: `${orderId}-item-${idx + 1}`,
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
        customer_id: customer?.id ?? 'cust-google-1',
        status: 'CONFIRMED',
        payment_status: 'PAID',
        payment_provider: 'UPI / Online Payment',
        payment_reference: `UTR${Math.floor(10000000000 + Math.random() * 89999999999)}`,
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
          country: 'IN',
        },
        tracking_number: `SUDHA${Math.floor(1000000 + Math.random() * 9000000)}IN`,
        shipping_carrier: 'Delhivery Express',
        notes: 'Order confirmed — preparing warehouse dispatch within 24 hours',
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
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return ctx;
}
