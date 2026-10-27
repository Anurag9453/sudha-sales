// ============================================================================
// Admin Orders & Payments Dashboard: src/app/admin/orders/page.tsx
// Displays all customer orders stored in Supabase PostgreSQL (or local store),
// Razorpay payment references, delivery addresses, WhatsApp contact numbers,
// and 1-click order delivery status updates.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  ArrowLeft,
  Database,
} from 'lucide-react';
import { getAllOrdersForAdmin } from '@/services/order.service';
import { isSupabaseConfigured, isRazorpayConfigured } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { AdminOrderStatusControl } from '@/components/admin/AdminOrderStatusControl';
import { AppConstants } from '@/constants/app.constants';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();
  const supabaseLive = isSupabaseConfigured();
  const razorpayLive = isRazorpayConfigured();

  const copy = AppConstants.Admin.COPY.ORDERS;
  const routes = AppConstants.Admin.ROUTES;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <Link
            href={routes.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {copy.BACK_LINK}
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            {copy.TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {copy.SUBTITLE}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border ${
              supabaseLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {supabaseLive ? copy.SUPABASE_LIVE : copy.SUPABASE_FALLBACK}
            </span>
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border ${
              razorpayLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>
              {razorpayLive ? copy.RAZORPAY_LIVE : copy.RAZORPAY_SIMULATED}
            </span>
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto" />
          <h2 className="font-serif text-2xl font-semibold text-stone-900">
            {copy.EMPTY_TITLE}
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            {copy.EMPTY_DESC_PREFIX}<code className="font-mono">{copy.EMPTY_DESC_CODE}</code>{copy.EMPTY_DESC_SUFFIX}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl bg-white border border-stone-200 p-6 space-y-4 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-stone-400 uppercase block text-[10px] font-bold">
                      {copy.LABEL_ORDER_NUMBER}
                    </span>
                    <span className="font-mono font-bold text-sm text-stone-950">
                      {order.order_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 uppercase block text-[10px] font-bold">
                      {copy.LABEL_RAZORPAY_REF}
                    </span>
                    <span className="font-mono font-semibold text-emerald-800">
                      {order.payment_reference || copy.PAID_DEFAULT}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 uppercase block text-[10px] font-bold">
                      {copy.LABEL_TOTAL_PAID}
                    </span>
                    <span className="font-bold text-sm text-stone-950">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 uppercase block text-[10px] font-bold">
                      {copy.LABEL_CUSTOMER_PHONE}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {order.shipping_address.full_name} ({order.shipping_address.phone})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500">
                    {copy.LABEL_UPDATE_STATUS}
                  </span>
                  <AdminOrderStatusControl
                    orderNumber={order.order_number}
                    initialStatus={order.status}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {copy.LABEL_ORDERED_ITEMS}
                  </span>
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0"
                    >
                      <div>
                        <span className="font-mono font-bold text-stone-700 mr-2">
                          {item.sku}
                        </span>
                        <span className="font-semibold text-stone-900">
                          {item.product_name}
                        </span>{' '}
                        <span className="text-stone-500">
                          (Size: {item.selected_size} × {item.quantity})
                        </span>
                      </div>
                      <span className="font-bold text-stone-900">
                        {formatPrice(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-5 p-3.5 rounded-2xl bg-stone-50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {copy.LABEL_DELIVERY_ADDRESS}
                  </span>
                  <p className="font-semibold text-stone-900">
                    {order.shipping_address.full_name}
                  </p>
                  <p className="text-stone-600">
                    {order.shipping_address.address_line1}
                    {order.shipping_address.address_line2
                      ? `, ${order.shipping_address.address_line2}`
                      : ''}
                  </p>
                  <p className="text-stone-600">
                    {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                    <strong>{order.shipping_address.postal_code}</strong>
                  </p>
                  {order.delivered_at && (
                    <p className="text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {copy.DELIVERED_PREFIX}
                      {new Date(order.delivered_at).toLocaleString(copy.LOCALE_IN)}
                    </p>
                  )}
                  {!order.delivered_at && order.tracking_number && (
                    <p className="text-stone-500 pt-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      {copy.AWB_PREFIX}<code className="font-mono">{order.tracking_number}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
