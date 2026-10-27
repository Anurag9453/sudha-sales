// ============================================================================
// Admin Product Service: src/services/admin-product.service.ts
// Handles creating products, editing product details, toggling ACTIVE/INACTIVE
// status, and updating stock counts. Designed around `sku` as the primary
// business identifier so the future Google Drive CSV sync can call the exact
// same upsert methods.
// ============================================================================

import crypto from 'crypto';
import { getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog, writeLocalCatalog } from '@/database/local-store';
import { buildStandardS3Key } from './storage.service';
import { slugify } from '@/lib/format';
import {
  toggleStatusSchema,
  updateStockSchema,
  upsertProductSchema,
  type ToggleStatusInput,
  type UpdateStockInput,
  type UpsertProductInput,
} from '@/validation/product.schema';
import type { Product, ProductImage } from '@/types/domain';

export async function upsertProductBySku(rawInput: UpsertProductInput): Promise<Product> {
  const input = upsertProductSchema.parse(rawInput);
  const slug = `${slugify(input.name)}-${input.sku.toLowerCase()}`;
  const now = new Date().toISOString();

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data: upserted, error: prodError } = await supabase
      .from('products')
      .upsert(
        {
          sku: input.sku,
          name: input.name,
          slug,
          description: input.description,
          category_id: input.category_id || null,
          collection_id: input.collection_id || null,
          price: input.price,
          sale_price: input.sale_price,
          stock: input.stock,
          sizes: input.sizes,
          size_stock: input.size_stock ?? {},
          color: input.color,
          vendor_code: input.vendor_code || null,
          status: input.status,
        },
        { onConflict: 'sku' }
      )
      .select('*')
      .single();

    if (!prodError && upserted) {
      const productId = String(upserted.id);

      // Replace product images cleanly
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imageRows = input.images.map((img, idx) => ({
        product_id: productId,
        sku: input.sku,
        s3_key:
          img.s3_key ||
          buildStandardS3Key(input.sku, idx === 0 ? 'front.jpg' : `view-${idx + 1}.jpg`),
        image_url: img.image_url,
        alt_text: img.alt_text || `${input.name} - View ${idx + 1}`,
        display_order: idx,
        is_primary: idx === 0,
      }));

      const { data: insertedImages } = await supabase
        .from('product_images')
        .insert(imageRows)
        .select('*');

      return {
        ...(upserted as unknown as Product),
        price: Number(upserted.price),
        sale_price: upserted.sale_price !== null ? Number(upserted.sale_price) : null,
        images: (insertedImages as ProductImage[]) ?? [],
      };
    }

    if (prodError && prodError.code !== 'PGRST205' && prodError.code !== '42501') {
      throw new Error(prodError.message || 'Failed to upsert product in Supabase');
    }
  }

  // Fallback: Local persistent catalog
  const snapshot = await readLocalCatalog();
  const existingIndex = snapshot.products.findIndex(
    (p) => p.sku.toUpperCase() === input.sku.toUpperCase()
  );

  const productId =
    existingIndex >= 0 ? snapshot.products[existingIndex].id : crypto.randomUUID();

  const images: ProductImage[] = input.images.map((img, idx) => ({
    id: crypto.randomUUID(),
    product_id: productId,
    sku: input.sku,
    s3_key:
      img.s3_key ||
      buildStandardS3Key(input.sku, idx === 0 ? 'front.jpg' : `view-${idx + 1}.jpg`),
    image_url: img.image_url,
    alt_text: img.alt_text || `${input.name} - View ${idx + 1}`,
    display_order: idx,
    is_primary: idx === 0,
    created_at: now,
  }));

  const category =
    snapshot.categories.find((c) => c.id === input.category_id) ?? null;
  const collection =
    snapshot.collections.find((c) => c.id === input.collection_id) ?? null;

  const productRecord: Product = {
    id: productId,
    sku: input.sku,
    name: input.name,
    slug,
    description: input.description,
    category_id: input.category_id || null,
    collection_id: input.collection_id || null,
    price: input.price,
    sale_price: input.sale_price,
    stock: input.stock,
    sizes: input.sizes,
    size_stock:
      input.size_stock && Object.keys(input.size_stock).length > 0
        ? input.size_stock
        : (existingIndex >= 0 ? snapshot.products[existingIndex].size_stock : {}),
    color: input.color,
    vendor_code: input.vendor_code || null,
    status: input.status,
    gdrive_folder_id:
      existingIndex >= 0 ? snapshot.products[existingIndex].gdrive_folder_id : null,
    last_synced_at:
      existingIndex >= 0 ? snapshot.products[existingIndex].last_synced_at : null,
    created_at: existingIndex >= 0 ? snapshot.products[existingIndex].created_at : now,
    updated_at: now,
    category,
    collection,
    images,
  };

  if (existingIndex >= 0) {
    snapshot.products[existingIndex] = productRecord;
  } else {
    snapshot.products.unshift(productRecord);
  }

  await writeLocalCatalog(snapshot);
  return productRecord;
}

export async function updateProductStockBySku(rawInput: UpdateStockInput): Promise<Product> {
  const { sku, stock } = updateStockSchema.parse(rawInput);

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('sku', sku)
      .select('*, categories(*), collections(*), product_images(*)')
      .single();

    if (!error && data) {
      return data as unknown as Product;
    }
    if (error && error.code !== 'PGRST205' && error.code !== '42501') {
      throw new Error(error.message || `Failed to update stock for ${sku}`);
    }
  }

  const snapshot = await readLocalCatalog();
  const product = snapshot.products.find((p) => p.sku.toUpperCase() === sku);
  if (!product) {
    throw new Error(`Product with SKU ${sku} not found`);
  }

  product.stock = stock;
  product.updated_at = new Date().toISOString();
  await writeLocalCatalog(snapshot);
  return product;
}

export async function updateProductStatusBySku(rawInput: ToggleStatusInput): Promise<Product> {
  const { sku, status } = toggleStatusSchema.parse(rawInput);

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ status })
      .eq('sku', sku)
      .select('*, categories(*), collections(*), product_images(*)')
      .single();

    if (!error && data) {
      return data as unknown as Product;
    }
    if (error && error.code !== 'PGRST205' && error.code !== '42501') {
      throw new Error(error.message || `Failed to update status for ${sku}`);
    }
  }

  const snapshot = await readLocalCatalog();
  const product = snapshot.products.find((p) => p.sku.toUpperCase() === sku);
  if (!product) {
    throw new Error(`Product with SKU ${sku} not found`);
  }

  product.status = status;
  product.updated_at = new Date().toISOString();
  await writeLocalCatalog(snapshot);
  return product;
}
