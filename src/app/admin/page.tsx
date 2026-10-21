// ============================================================================
// Admin Product List & Inventory Dashboard: src/app/admin/page.tsx
// Displays all products (ACTIVE, INACTIVE, DRAFT), summary KPIs, search by SKU,
// 1-click Activate/Deactivate toggle, inline stock updater, and Edit links.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Edit3,
  PackageCheck,
  AlertTriangle,
  EyeOff,
  FolderSync,
} from 'lucide-react';
import { getProducts } from '@/services/catalog.service';
import { formatPrice } from '@/lib/format';
import {
  StatusQuickToggle,
  StockQuickControl,
} from '@/components/admin/AdminProductRowControls';

export const dynamic = 'force-dynamic';

interface AdminDashboardProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardProps) {
  const { q = '' } = await searchParams;
  const products = await getProducts({
    includeInactive: true,
    search: q,
  });

  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const inactiveCount = products.filter((p) => p.status !== 'ACTIVE').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-8">
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            Product Catalog &amp; Warehouse Stock
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            All products are synced from your Google Drive <code className="font-mono">products.csv</code> &amp; SKU folders. Manage stock counts or toggle visibility below.
          </p>
        </div>

        <Link
          href="/admin/sync"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors shrink-0"
        >
          <FolderSync className="w-4 h-4 text-amber-300" />
          <span>Sync from Google Drive CSV</span>
        </Link>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Active SKUs</p>
            <p className="text-2xl font-bold text-stone-950 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Low / Out of Stock</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{lowStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Hidden / Inactive</p>
            <p className="text-2xl font-bold text-stone-700 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        <Link
          href="/admin/sync"
          className="p-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-medium text-stone-400">Sync Pipeline</p>
            <p className="text-sm font-semibold text-amber-300 mt-1">
              Run Google Drive + S3 Sync →
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Drive CSV → S3 → Supabase
            </p>
          </div>
          <FolderSync className="w-5 h-5 text-amber-300 shrink-0" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
        <form action="/admin" method="GET" className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Filter by SKU (e.g. SKU001), name, or color..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm"
          />
        </form>

        <div className="text-xs text-stone-500">
          Total <strong className="text-stone-900">{products.length}</strong> products
        </div>
      </div>

      {/* Product Management Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Product &amp; SKU</th>
                <th className="py-3.5 px-4">Category / Collection</th>
                <th className="py-3.5 px-4">Price / Sale</th>
                <th className="py-3.5 px-4">Sizes</th>
                <th className="py-3.5 px-4">Quick Stock Update</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {products.map((product) => {
                const thumb = product.images[0]?.image_url;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-stone-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 aspect-[3/4] rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          {thumb && (
                            <Image
                              src={thumb}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover object-top"
                            />
                          )}
                        </div>
                        <div>
                          <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                            {product.sku}
                          </span>
                          <Link
                            href={`/admin/products/${product.sku}`}
                            className="block font-semibold text-stone-900 hover:underline mt-0.5 line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs text-stone-500">
                            {product.color} • {product.images.length} photos
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-stone-900 block">
                        {product.category?.name ?? 'Uncategorized'}
                      </span>
                      {product.collection && (
                        <span className="text-amber-800 font-medium">
                          {product.collection.name}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {product.sale_price !== null &&
                      product.sale_price < product.price ? (
                        <div>
                          <span className="font-bold text-stone-950 text-sm">
                            {formatPrice(product.sale_price)}
                          </span>
                          <span className="block text-stone-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-stone-950 text-sm">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {product.sizes.map((sz) => (
                          <span
                            key={sz}
                            className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StockQuickControl
                        sku={product.sku}
                        initialStock={product.stock}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusQuickToggle
                        sku={product.sku}
                        status={product.status}
                      />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/products/${product.sku}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Details / Edit</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
