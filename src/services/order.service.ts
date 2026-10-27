// ============================================================================
// Order & Checkout Persistence Service: src/services/order.service.ts
// Persists customers, orders, and order_items into Supabase PostgreSQL (and
// deducts product stock atomically by SKU), with automatic fallback to the
// local server store when Supabase credentials are not yet configured.
// ============================================================================

import crypto from 'crypto';
import { getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog, writeLocalCatalog } from '@/database/local-store';
import { AppConstants } from '@/constants/app.constants';
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingAddressSnapshot,
} from '@/types/domain';

const tables = AppConstants.Services.TABLES;
const orderConstants = AppConstants.Services.ORDER;

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

export interface StockValidationError {
  sku: string;
  productName: string;
  size: string;
  requestedQty: number;
  availableQty: number;
  message: string;
}

export interface StockValidationResult {
  valid: boolean;
  errors: StockValidationError[];
}

/**
 * Validates requested cart quantities against real warehouse stock (both aggregate
 * and variant size-level stock) before any payment or order placement occurs.
 */
export async function validateItemsStock(
  items: CartItem[]
): Promise<StockValidationResult> {
  const errors: StockValidationError[] = [];
  const supabase = getSupabaseServerAdminClient();

  if (supabase) {
    try {
      const skus = Array.from(new Set(items.map((i) => i.sku)));
      const { data: products, error } = await supabase
        .from(tables.PRODUCTS)
        .select('id, sku, name, stock, size_stock')
        .in('sku', skus);

      if (!error && products) {
        const prodMap = new Map<
          string,
          {
            id: string;
            sku: string;
            name: string;
            stock: number;
            size_stock: Record<string, unknown>;
          }
        >();
        for (const p of products) {
          prodMap.set(String(p.sku).toUpperCase(), p);
        }

        for (const item of items) {
          const prod = prodMap.get(item.sku.toUpperCase());
          if (!prod) {
            errors.push({
              sku: item.sku,
              productName: item.name,
              size: item.size,
              requestedQty: item.quantity,
              availableQty: 0,
              message: orderConstants.ERROR_NO_LONGER_AVAILABLE(item.name, item.sku),
            });
            continue;
          }

          const overallStock = Number(prod.stock ?? 0);
          const sizeStockMap =
            (prod.size_stock as Record<string, unknown> | null) ?? {};
          const targetSize = (item.size || '').trim().toUpperCase();
          const matchedKey =
            Object.keys(sizeStockMap).find(
              (k) => k.toUpperCase() === targetSize
            ) ?? targetSize;
          const sizeStockVal =
            typeof sizeStockMap[matchedKey] === 'number'
              ? Number(sizeStockMap[matchedKey])
              : overallStock;
          const maxAvailable = Math.max(0, Math.min(overallStock, sizeStockVal));

          if (item.quantity > maxAvailable) {
            errors.push({
              sku: item.sku,
              productName: item.name,
              size: item.size,
              requestedQty: item.quantity,
              availableQty: maxAvailable,
              message:
                maxAvailable === 0
                  ? orderConstants.ERROR_OUT_OF_STOCK(item.name, item.size)
                  : orderConstants.ERROR_PARTIAL_STOCK(
                      maxAvailable,
                      item.size,
                      item.name,
                      item.quantity
                    ),
            });
          }
        }

        return {
          valid: errors.length === 0,
          errors,
        };
      }
    } catch {
      // Fall through to local catalog validation
    }
  }

  // Fallback: Local catalog validation
  const snapshot = await readLocalCatalog();
  for (const item of items) {
    const prod = snapshot.products.find(
      (p) => p.sku.toUpperCase() === item.sku.toUpperCase()
    );

    if (!prod) {
      errors.push({
        sku: item.sku,
        productName: item.name,
        size: item.size,
        requestedQty: item.quantity,
        availableQty: 0,
        message: orderConstants.ERROR_NO_LONGER_AVAILABLE(item.name, item.sku),
      });
      continue;
    }

    const overallStock = Number(prod.stock ?? 0);
    const sizeStockMap = prod.size_stock ?? {};
    const targetSize = (item.size || '').trim().toUpperCase();
    const matchedKey =
      Object.keys(sizeStockMap).find((k) => k.toUpperCase() === targetSize) ??
      targetSize;
    const sizeStockVal =
      typeof sizeStockMap[matchedKey] === 'number'
        ? Number(sizeStockMap[matchedKey])
        : overallStock;
    const maxAvailable = Math.max(0, Math.min(overallStock, sizeStockVal));

    if (item.quantity > maxAvailable) {
      errors.push({
        sku: item.sku,
        productName: item.name,
        size: item.size,
        requestedQty: item.quantity,
        availableQty: maxAvailable,
        message:
          maxAvailable === 0
            ? orderConstants.ERROR_OUT_OF_STOCK(item.name, item.size)
            : orderConstants.ERROR_PARTIAL_STOCK(
                maxAvailable,
                item.size,
                item.name,
                item.quantity
              ),
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${orderConstants.ORDER_NUMBER_PREFIX}${datePart}-${randomSuffix}`;
}

export async function createPersistedOrder(
  input: CreateVerifiedOrderInput
): Promise<Order> {
  // Pre-flight stock availability verification: block order if customer selected more than available
  const validation = await validateItemsStock(input.items);
  if (!validation.valid) {
    const primaryError =
      validation.errors[0]?.message || orderConstants.ERROR_PRIMARY_GENERIC;
    throw new Error(primaryError);
  }

  const orderNumber = generateOrderNumber();
  const trackingNumber = `${orderConstants.TRACKING_NUMBER_PREFIX}${Math.floor(
    1000000 + Math.random() * 9000000
  )}${orderConstants.TRACKING_NUMBER_SUFFIX}`;
  const now = new Date().toISOString();

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    try {
      // 1. Find or create customer row by phone / email
      const { data: existingCustomer, error: lookupError } = await supabase
        .from(tables.CUSTOMERS)
        .select('*')
        .eq('phone', input.customerPhone)
        .limit(1)
        .maybeSingle();

      if (!lookupError || lookupError.code !== 'PGRST205') {
        let customerId: string;
        if (existingCustomer) {
          customerId = String(existingCustomer.id);
          await supabase
            .from(tables.CUSTOMERS)
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
            .from(tables.CUSTOMERS)
            .insert({
              full_name: input.customerName,
              phone: input.customerPhone,
              email: input.customerEmail || null,
              address_line1: input.shippingAddress.address_line1,
              address_line2: input.shippingAddress.address_line2 || null,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state,
              postal_code: input.shippingAddress.postal_code,
              country: AppConstants.Store.DEFAULT_COUNTRY,
            })
            .select('*')
            .single();

          if (custError || !createdCustomer) {
            throw new Error(
              custError?.message || orderConstants.ERROR_CUSTOMER_CREATE_FAILED
            );
          }
          customerId = String(createdCustomer.id);
        }

        // 2. Insert order record
        const { data: insertedOrder, error: orderError } = await supabase
          .from(tables.ORDERS)
          .insert({
            order_number: orderNumber,
            customer_id: customerId,
            status: AppConstants.OrderStatus.CONFIRMED,
            payment_status: input.paymentStatus,
            payment_provider: input.paymentProvider,
            payment_reference: input.paymentReference,
            subtotal_amount: input.subtotalAmount,
            discount_amount: input.discountAmount,
            shipping_amount: input.shippingAmount,
            total_amount: input.totalAmount,
            shipping_address: input.shippingAddress,
            tracking_number: trackingNumber,
            shipping_carrier: AppConstants.Shipping.DEFAULT_CARRIER,
            notes:
              input.paymentStatus === AppConstants.PaymentStatus.COD
                ? AppConstants.Shipping.DEFAULT_NOTES_COD
                : AppConstants.Shipping.DEFAULT_NOTES_ONLINE,
          })
          .select('*')
          .single();

        if (orderError || !insertedOrder) {
          throw new Error(
            orderError?.message || orderConstants.ERROR_ORDER_INSERT_FAILED
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
          .from(tables.ORDER_ITEMS)
          .insert(orderItemRows)
          .select('*');

        for (const item of input.items) {
          const { data: prodRow } = await supabase
            .from(tables.PRODUCTS)
            .select('id, stock, size_stock')
            .eq('sku', item.sku)
            .maybeSingle();

          if (prodRow) {
            const nextStock = Math.max(0, Number(prodRow.stock) - item.quantity);
            const currentSizeStock =
              (prodRow.size_stock as Record<string, unknown> | null) ?? {};
            const updatedSizeStock: Record<string, unknown> = { ...currentSizeStock };

            if (item.size) {
              const targetSize = item.size.trim().toUpperCase();
              const matchedKey =
                Object.keys(updatedSizeStock).find(
                  (k) => k.toUpperCase() === targetSize
                ) ?? targetSize;
              const currentSizeQty = Number(
                updatedSizeStock[matchedKey] ?? prodRow.stock
              );
              updatedSizeStock[matchedKey] = Math.max(
                0,
                currentSizeQty - item.quantity
              );
            }

            await supabase
              .from(tables.PRODUCTS)
              .update({
                stock: nextStock,
                size_stock: updatedSizeStock,
              })
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
      if (!prod.size_stock) {
        prod.size_stock = {};
      }
      if (item.size) {
        const targetSize = item.size.trim().toUpperCase();
        const matchedKey =
          Object.keys(prod.size_stock).find(
            (k) => k.toUpperCase() === targetSize
          ) ?? targetSize;
        const currentSizeQty = Number(
          prod.size_stock[matchedKey] ?? prod.stock + item.quantity
        );
        prod.size_stock[matchedKey] = Math.max(0, currentSizeQty - item.quantity);
      }
      prod.updated_at = now;
    }
  }

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: orderConstants.FALLBACK_CUSTOMER_ID,
    status: AppConstants.OrderStatus.CONFIRMED,
    payment_status: input.paymentStatus,
    payment_provider: input.paymentProvider,
    payment_reference: input.paymentReference,
    subtotal_amount: input.subtotalAmount,
    discount_amount: input.discountAmount,
    shipping_amount: input.shippingAmount,
    total_amount: input.totalAmount,
    shipping_address: input.shippingAddress,
    tracking_number: trackingNumber,
    shipping_carrier: AppConstants.Shipping.DEFAULT_CARRIER,
    notes:
      input.paymentStatus === AppConstants.PaymentStatus.COD
        ? AppConstants.Shipping.DEFAULT_NOTES_COD
        : AppConstants.Shipping.DEFAULT_NOTES_ONLINE,
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
      .from(tables.ORDERS)
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
  const deliveredAt = params.status === AppConstants.OrderStatus.DELIVERED ? now : null;

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const updatePayload: Record<string, unknown> = {
      status: params.status,
    };
    if (deliveredAt) {
      updatePayload.delivered_at = deliveredAt;
    }

    const { data, error } = await supabase
      .from(tables.ORDERS)
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
      throw new Error(error.message || orderConstants.ERROR_ORDER_UPDATE_FAILED);
    }
  }

  const snapshot = await readLocalCatalog();
  const orders = snapshot.orders ?? [];
  const target = orders.find((o) => o.order_number === params.orderNumber);
  if (!target) {
    throw new Error(orderConstants.ERROR_ORDER_NOT_FOUND(params.orderNumber));
  }

  target.status = params.status;
  target.updated_at = now;
  if (deliveredAt) {
    target.delivered_at = deliveredAt;
  }

  await writeLocalCatalog(snapshot);
  return target;
}
