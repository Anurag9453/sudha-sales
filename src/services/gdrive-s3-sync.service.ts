// ============================================================================
// Google Drive -> Amazon S3 -> Supabase Synchronization Orchestrator
// File: src/services/gdrive-s3-sync.service.ts
//
// Executes the complete product ingestion pipeline:
// 1. Fetches `products.csv` and `SKUxxx/` image folders from Google Drive.
// 2. Parses and validates every CSV row by `SKU`.
// 3. Auto-resolves (or creates) Categories and Collections by name/slug.
// 4. Streams each SKU's images (`front.jpg`, `model.jpg`, `back.jpg`) to
//    Amazon S3 under `SKU001/front.jpg` and records the S3 keys & CDN URLs.
// 5. Upserts the product and image metadata into Supabase PostgreSQL (or local
//    catalog store when running locally without credentials).
// ============================================================================

import crypto from 'crypto';
import { parseProductsCsv, type CsvParseError } from '@/lib/csv-parser';
import { slugify } from '@/lib/format';
import {
  downloadDriveFileBuffer,
  fetchGoogleDriveWorkspace,
  sortDriveImagesByConvention,
  type DriveSkuFolder,
} from './google-drive.service';
import {
  getPublicUrlForS3Key,
  isS3Configured,
  uploadProductImageToS3,
} from './s3-storage.service';
import { buildStandardS3Key } from './storage.service';
import { upsertProductBySku } from './admin-product.service';
import { getSupabaseServerAdminClient } from '@/database/supabase-server';
import { readLocalCatalog, writeLocalCatalog } from '@/database/local-store';
import type { Category, Collection } from '@/types/domain';

export interface SyncedProductReportItem {
  sku: string;
  name: string;
  status: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sizes: string[];
  s3Keys: string[];
  driveFolderFound: boolean;
}

export interface DriveSyncExecutionReport {
  startedAt: string;
  completedAt: string;
  mode: 'live-google-drive' | 'sample-drive-simulation';
  s3LiveUploadEnabled: boolean;
  totalRowsParsed: number;
  syncedCount: number;
  errorCount: number;
  syncedProducts: SyncedProductReportItem[];
  rowErrors: CsvParseError[];
}

const FALLBACK_DRIVE_IMAGES = [
  {
    name: 'front.jpg',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'model.jpg',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'back.jpg',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
  },
];

async function resolveOrCreateCategoryByName(name: string): Promise<Category> {
  const cleanName = name.trim();
  const targetSlug = slugify(cleanName);

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from('categories')
      .select('*')
      .or(`slug.eq.${targetSlug},name.ilike.${cleanName}`)
      .limit(1)
      .maybeSingle();

    if (!lookupError || lookupError.code !== 'PGRST205') {
      if (existing) {
        return existing as Category;
      }

      const { data: created, error } = await supabase
        .from('categories')
        .insert({
          name: cleanName,
          slug: targetSlug,
          description: `${cleanName} collection`,
          is_active: true,
        })
        .select('*')
        .single();

      if (error || !created) {
        throw new Error(`Failed to auto-create category "${cleanName}": ${error?.message}`);
      }
      return created as Category;
    }
  }

  const snapshot = await readLocalCatalog();
  const found = snapshot.categories.find(
    (c) =>
      c.slug === targetSlug ||
      c.name.toLowerCase() === cleanName.toLowerCase() ||
      c.name.toLowerCase().includes(cleanName.toLowerCase())
  );

  if (found) {
    return found;
  }

  const now = new Date().toISOString();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    name: cleanName,
    slug: targetSlug,
    description: `${cleanName} collection`,
    image_url:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    display_order: snapshot.categories.length + 1,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  snapshot.categories.push(newCategory);
  await writeLocalCatalog(snapshot);
  return newCategory;
}

async function resolveOrCreateCollectionByName(
  name: string | null
): Promise<Collection | null> {
  if (!name || !name.trim()) return null;
  const cleanName = name.trim();
  const targetSlug = slugify(cleanName);

  const supabase = getSupabaseServerAdminClient();
  if (supabase) {
    const { data: existing, error: lookupError } = await supabase
      .from('collections')
      .select('*')
      .or(`slug.eq.${targetSlug},name.ilike.${cleanName}`)
      .limit(1)
      .maybeSingle();

    if (!lookupError || lookupError.code !== 'PGRST205') {
      if (existing) {
        return existing as Collection;
      }

      const { data: created, error } = await supabase
        .from('collections')
        .insert({
          name: cleanName,
          slug: targetSlug,
          description: `${cleanName} drop`,
          is_featured: true,
          is_active: true,
        })
        .select('*')
        .single();

      if (error || !created) {
        throw new Error(
          `Failed to auto-create collection "${cleanName}": ${error?.message}`
        );
      }
      return created as Collection;
    }
  }

  const snapshot = await readLocalCatalog();
  const found = snapshot.collections.find(
    (c) =>
      c.slug === targetSlug ||
      c.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (found) {
    return found;
  }

  const now = new Date().toISOString();
  const newCollection: Collection = {
    id: crypto.randomUUID(),
    name: cleanName,
    slug: targetSlug,
    description: `${cleanName} arrivals`,
    banner_url: null,
    is_featured: true,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  snapshot.collections.push(newCollection);
  await writeLocalCatalog(snapshot);
  return newCollection;
}

/**
 * Syncs images for a single SKU from its Google Drive folder (`Clothing Store/SKU001/`)
 * to Amazon S3 (`SKU001/front.jpg`, `SKU001/model.jpg`, `SKU001/back.jpg`).
 */
async function syncSkuImagesFromDriveToS3(params: {
  sku: string;
  productName: string;
  driveFolder: DriveSkuFolder | undefined;
  isLiveDrive: boolean;
}): Promise<{
  images: Array<{
    image_url: string;
    s3_key: string;
    alt_text: string;
    is_primary: boolean;
  }>;
  s3Keys: string[];
}> {
  const { sku, productName, driveFolder, isLiveDrive } = params;

  if (driveFolder && driveFolder.images.length > 0) {
    const orderedImages = sortDriveImagesByConvention(driveFolder.images);
    const syncedImages: Array<{
      image_url: string;
      s3_key: string;
      alt_text: string;
      is_primary: boolean;
    }> = [];
    const s3Keys: string[] = [];

    for (let i = 0; i < orderedImages.length; i++) {
      const driveImg = orderedImages[i];
      const s3Key = buildStandardS3Key(sku, driveImg.name);
      s3Keys.push(s3Key);

      let resolvedUrl =
        driveImg.previewUrl || getPublicUrlForS3Key(s3Key);

      // When connected to live Google Drive + live Amazon S3, stream binary -> S3
      if (isLiveDrive && isS3Configured()) {
        const buffer = await downloadDriveFileBuffer(driveImg.id);
        const uploadRes = await uploadProductImageToS3({
          s3Key,
          body: buffer,
          contentType: driveImg.mimeType || 'image/jpeg',
          fallbackUrl: driveImg.previewUrl,
        });
        resolvedUrl = uploadRes.publicUrl;
      }

      syncedImages.push({
        image_url: resolvedUrl,
        s3_key: s3Key,
        alt_text: `${productName} - ${driveImg.name.replace(/\.[^.]+$/, '')}`,
        is_primary: i === 0,
      });
    }

    return { images: syncedImages, s3Keys };
  }

  // Fallback if a new SKU row was added to products.csv before its folder had images
  const defaultImages = FALLBACK_DRIVE_IMAGES.map((item, idx) => {
    const s3Key = buildStandardS3Key(sku, item.name);
    return {
      image_url: item.url,
      s3_key: s3Key,
      alt_text: `${productName} - ${item.name.replace('.jpg', '')}`,
      is_primary: idx === 0,
    };
  });

  return {
    images: defaultImages,
    s3Keys: defaultImages.map((d) => d.s3_key),
  };
}

/**
 * Main entry point to run the Google Drive -> Amazon S3 -> Supabase sync.
 * Accepts optional `customCsvText` so the retailer can also paste/upload a CSV
 * directly from `/admin/sync` or let it pull `products.csv` from Google Drive.
 */
export async function runGoogleDriveToS3Sync(options?: {
  customCsvText?: string;
}): Promise<DriveSyncExecutionReport> {
  const startedAt = new Date().toISOString();

  const workspace = await fetchGoogleDriveWorkspace(options?.customCsvText);
  const { validRows, errors: rowErrors } = parseProductsCsv(workspace.csvContent);

  const syncedProducts: SyncedProductReportItem[] = [];

  for (const row of validRows) {
    try {
      const category = await resolveOrCreateCategoryByName(row.categoryName);
      const collection = await resolveOrCreateCollectionByName(row.collectionName);

      const driveFolder = workspace.skuFolders[row.sku];
      const { images, s3Keys } = await syncSkuImagesFromDriveToS3({
        sku: row.sku,
        productName: row.name,
        driveFolder,
        isLiveDrive: workspace.mode === 'live-google-drive',
      });

      const saved = await upsertProductBySku({
        sku: row.sku,
        name: row.name,
        description: row.description,
        category_id: category.id,
        collection_id: collection?.id ?? null,
        price: row.price,
        sale_price: row.salePrice,
        stock: row.stock,
        sizes: row.sizes,
        color: row.color,
        vendor_code: 'GDRIVE-SYNC',
        status: row.status,
        images,
      });

      syncedProducts.push({
        sku: saved.sku,
        name: saved.name,
        status: saved.status,
        price: saved.price,
        salePrice: saved.sale_price,
        stock: saved.stock,
        sizes: saved.sizes,
        s3Keys,
        driveFolderFound: Boolean(driveFolder),
      });
    } catch (err) {
      rowErrors.push({
        rowNumber: row.rowNumber,
        sku: row.sku,
        message: err instanceof Error ? err.message : 'Failed to upsert SKU',
      });
    }
  }

  return {
    startedAt,
    completedAt: new Date().toISOString(),
    mode: workspace.mode,
    s3LiveUploadEnabled: isS3Configured(),
    totalRowsParsed: validRows.length + rowErrors.length,
    syncedCount: syncedProducts.length,
    errorCount: rowErrors.length,
    syncedProducts,
    rowErrors,
  };
}
