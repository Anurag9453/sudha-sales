// ============================================================================
// Admin Server Actions: src/app/admin/actions.ts
// Protected server-side mutations for admin login/logout, product creation,
// product editing, status toggling (ACTIVE/INACTIVE), and stock updates.
// ============================================================================

'use server';

import { revalidatePath } from 'next/cache';
import {
  clearAdminSession,
  isAdminAuthenticated,
  verifyAndCreateAdminSession,
} from '@/services/admin-auth.service';
import {
  updateProductStatusBySku,
  updateProductStockBySku,
  upsertProductBySku,
} from '@/services/admin-product.service';
import {
  runGoogleDriveToS3Sync,
  type DriveSyncExecutionReport,
} from '@/services/gdrive-s3-sync.service';
import type { ProductStatus } from '@/types/domain';
import type { UpsertProductInput } from '@/validation/product.schema';

export interface ActionResponse {
  ok: boolean;
  message?: string;
  sku?: string;
  syncReport?: DriveSyncExecutionReport;
}

async function assertAdminAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error('Unauthorized: Please sign in to the Admin Portal first.');
  }
}

export async function loginAdminAction(passcode: string): Promise<ActionResponse> {
  const ok = await verifyAndCreateAdminSession(passcode);
  if (!ok) {
    return {
      ok: false,
      message: 'Invalid admin passcode. Please check ADMIN_PASSCODE in your environment.',
    };
  }
  revalidatePath('/admin');
  return { ok: true };
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  revalidatePath('/admin');
}

export async function saveProductAction(
  payload: UpsertProductInput
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const saved = await upsertProductBySku(payload);
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${saved.sku}`);
    revalidatePath('/admin');
    revalidatePath(`/admin/products/${saved.sku}`);
    return {
      ok: true,
      sku: saved.sku,
      message: `Product ${saved.sku} saved successfully.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save product';
    return { ok: false, message };
  }
}

export async function quickUpdateStockAction(
  sku: string,
  stock: number
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const updated = await updateProductStockBySku({ sku, stock });
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${updated.sku}`);
    revalidatePath('/admin');
    return {
      ok: true,
      sku: updated.sku,
      message: `Stock for ${updated.sku} updated to ${updated.stock}.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update stock';
    return { ok: false, message };
  }
}

export async function quickToggleStatusAction(
  sku: string,
  status: ProductStatus
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const updated = await updateProductStatusBySku({ sku, status });
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${updated.sku}`);
    revalidatePath('/admin');
    return {
      ok: true,
      sku: updated.sku,
      message: `${updated.sku} is now ${updated.status}.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update status';
    return { ok: false, message };
  }
}

export async function triggerGoogleDriveSyncAction(
  customCsvText?: string
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const report = await runGoogleDriveToS3Sync({ customCsvText });
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin');
    revalidatePath('/admin/sync');
    for (const item of report.syncedProducts) {
      revalidatePath(`/product/${item.sku}`);
    }
    return {
      ok: true,
      message: `Synced ${report.syncedCount} products from CSV & Drive folders.`,
      syncReport: report,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to run Google Drive sync';
    return { ok: false, message };
  }
}

