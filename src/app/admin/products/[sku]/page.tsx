// ============================================================================
// Admin Product Detail & Edit Page: src/app/admin/products/[sku]/page.tsx
// ============================================================================

import React from 'react';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getCollections,
  getProductBySku,
} from '@/services/catalog.service';
import { ProductForm } from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

interface AdminEditProductPageProps {
  params: Promise<{ sku: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { sku } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductBySku(sku, { includeInactive: true }),
    getCategories(),
    getCollections(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      initialProduct={product}
      categories={categories}
      collections={collections}
    />
  );
}
