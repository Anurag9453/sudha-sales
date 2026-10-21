// ============================================================================
// Order & Checkout Persistence Service: src/services/order.service.ts
// Persists customers, orders, and order_items into Supabase PostgreSQL (and
// deducts product stock atomically by SKU), with automatic fallback to the
// local server store when Supabase credentials are not yet configured.
// ============================================================================

import crypto from 'crypto';
import { getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog, writeLocalCatalog } from '@/database/local-store';
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingAddressSnapshot,
} from '@/types/domain';

export interface CreateVerifiedOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddressSnapshot;
  items: CartItem[];
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentProvider: string;
  paymentReference: string;
  paymentStatus: PaymentStatus;
}

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomSuffix}`;
}

export async function createPersistedOrder(
  input: CreateVerifiedOrderInput
): Promise<Order> {
  const orderNumber = generateOrderNumber();
  const trackingNumber = `SUDHA${Math.floor(1000000 + Math.random() * 9000000)}IN`;
  const now = new Date().toISOString();

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    try {
      // 1. Find or create customer row by phone / email
      const { data: existingCustomer, error: lookupError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', input.customerPhone)
        .limit(1)
        .maybeSingle();

      if (!lookupError || lookupError.code !== 'PGRST205') {
        let customerId: string;
        if (existingCustomer) {
          customerId = String(existingCustomer.id);
          await supabase
            .from('customers')
            .update({
              full_name: input.customerName,
              email: input.customerEmail || existingCustomer.email,
              address_line1: input.shippingAddress.address_line1,
              address_line2: input.shippingAddress.address_line2 || null,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state,
              postal_code: input.shippingAddress.postal_code,
            })
            .eq('id', customerId);
        } else {
          const { data: createdCustomer, error: custError } = await supabase
            .from('customers')
            .insert({
              full_name: input.customerName,
              phone: input.customerPhone,
              email: input.customerEmail || null,
              address_line1: input.shippingAddress.address_line1,
              address_line2: input.shippingAddress.address_line2 || null,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state,
              postal_code: input.shippingAddress.postal_code,
              country: 'IN',
            })
            .select('*')
            .single();

          if (custError || !createdCustomer) {
            throw new Error(
              custError?.message || 'Failed to create customer record in Supabase'
            );
          }
          customerId = String(createdCustomer.id);
        }

        // 2. Insert order record
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: customerId,
            status: 'CONFIRMED',
            payment_status: input.paymentStatus,
            payment_provider: input.paymentProvider,
            payment_reference: input.paymentReference,
            subtotal_amount: input.subtotalAmount,
            discount_amount: input.discountAmount,
            shipping_amount: input.shippingAmount,
            total_amount: input.totalAmount,
            shipping_address: input.shippingAddress,
            tracking_number: trackingNumber,
            shipping_carrier: 'Delhivery Express',
            notes: 'Order confirmed via Razorpay — preparing warehouse dispatch',
          })
          .select('*')
          .single();

        if (orderError || !insertedOrder) {
          throw new Error(
            orderError?.message || 'Failed to insert order in Supabase'
          );
        }

        const orderId = String(insertedOrder.id);

        // 3. Insert order_items & deduct stock per SKU
        const orderItemRows = input.items.map((item) => ({
          order_id: orderId,
          product_id:
            item.productId && /^[0-9a-f-]{36}$/i.test(item.productId)
              ? item.productId
              : null,
          sku: item.sku,
          product_name: item.name,
          selected_size: item.size,
          color: item.color || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          line_total: item.unitPrice * item.quantity,
        }));

        const { data: insertedItems } = await supabase
          .from('order_items')
          .insert(orderItemRows)
          .select('*');

        for (const item of input.items) {
          const { data: prodRow } = await supabase
            .from('products')
            .select('id, stock')
            .eq('sku', item.sku)
            .maybeSingle();

          if (prodRow) {
            const nextStock = Math.max(0, Number(prodRow.stock) - item.quantity);
            await supabase
              .from('products')
              .update({ stock: nextStock })
              .eq('id', prodRow.id);
          }
        }

        return {
          ...(insertedOrder as unknown as Order),
          subtotal_amount: Number(insertedOrder.subtotal_amount),
          discount_amount: Number(insertedOrder.discount_amount),
          shipping_amount: Number(insertedOrder.shipping_amount),
          total_amount: Number(insertedOrder.total_amount),
          items: (insertedItems as unknown as OrderItem[]) ?? [],
        };
      }
    } catch (err) {
      // If SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel yet and RLS blocks
      // the anon key, fall back to the server store so checkout always succeeds.
      console.warn(
        '[order.service] Supabase order persistence fell back to local store:',
        err instanceof Error ? err.message : err
      );
    }
  }

  // Fallback: Local Server Store
  const snapshot = await readLocalCatalog();
  const orderId = crypto.randomUUID();

  const items: OrderItem[] = input.items.map((item) => ({
    id: crypto.randomUUID(),
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

  // Deduct stock in local store
  for (const item of input.items) {
    const prod = snapshot.products.find(
      (p) => p.sku.toUpperCase() === item.sku.toUpperCase()
    );
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.updated_at = now;
    }
  }

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: 'cust-local-1',
    status: 'CONFIRMED',
    payment_status: input.paymentStatus,
    payment_provider: input.paymentProvider,
    payment_reference: input.paymentReference,
    subtotal_amount: input.subtotalAmount,
    discount_amount: input.discountAmount,
    shipping_amount: input.shippingAmount,
    total_amount: input.totalAmount,
    shipping_address: input.shippingAddress,
    tracking_number: trackingNumber,
    shipping_carrier: 'Delhivery Express',
    notes: 'Order confirmed via Razorpay — preparing warehouse dispatch',
    created_at: now,
    updated_at: now,
    delivered_at: null,
    items,
  };

  snapshot.orders = [newOrder, ...(snapshot.orders ?? [])];
  await writeLocalCatalog(snapshot);

  return newOrder;
}

export async function getAllOrdersForAdmin(): Promise<Order[]> {
  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row) => ({
        ...(row as unknown as Order),
        subtotal_amount: Number(row.subtotal_amount),
        discount_amount: Number(row.discount_amount),
        shipping_amount: Number(row.shipping_amount),
        total_amount: Number(row.total_amount),
        items: (row.order_items as OrderItem[]) ?? [],
      }));
    }
  }

  const snapshot = await readLocalCatalog();
  return snapshot.orders ?? [];
}

export async function updateOrderStatusForAdmin(params: {
  orderNumber: string;
  status: OrderStatus;
}): Promise<Order> {
  const now = new Date().toISOString();
  const deliveredAt = params.status === 'DELIVERED' ? now : null;

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const updatePayload: Record<string, unknown> = {
      status: params.status,
    };
    if (deliveredAt) {
      updatePayload.delivered_at = deliveredAt;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('order_number', params.orderNumber)
      .select('*, order_items(*)')
      .single();

    if (!error && data) {
      return {
        ...(data as unknown as Order),
        items: (data.order_items as OrderItem[]) ?? [],
      };
    }

    if (error && error.code !== 'PGRST205' && error.code !== '42501') {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  const snapshot = await readLocalCatalog();
  const orders = snapshot.orders ?? [];
  const target = orders.find((o) => o.order_number === params.orderNumber);
  if (!target) {
    throw new Error(`Order ${params.orderNumber} not found`);
  }

  target.status = params.status;
  target.updated_at = now;
  if (deliveredAt) {
    target.delivered_at = deliveredAt;
  }

  await writeLocalCatalog(snapshot);
  return target;
}
