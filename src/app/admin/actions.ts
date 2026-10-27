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
import { updateOrderStatusForAdmin } from '@/services/order.service';
import type { OrderStatus, ProductStatus } from '@/types/domain';
import type { UpsertProductInput } from '@/validation/product.schema';
import { AppConstants } from '@/constants/app.constants';

export interface ActionResponse {
  ok: boolean;
  message?: string;
  sku?: string;
  syncReport?: DriveSyncExecutionReport;
}

const copy = AppConstants.Admin.COPY.ACTIONS;
const routes = AppConstants.Admin.ROUTES;

async function assertAdminAuth() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error(copy.UNAUTHORIZED);
  }
}

export async function loginAdminAction(passcode: string): Promise<ActionResponse> {
  const ok = await verifyAndCreateAdminSession(passcode);
  if (!ok) {
    return {
      ok: false,
      message: copy.INVALID_PASSCODE,
    };
  }
  revalidatePath(routes.DASHBOARD);
  return { ok: true };
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  revalidatePath(routes.DASHBOARD);
}

export async function saveProductAction(
  payload: UpsertProductInput
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const saved = await upsertProductBySku(payload);
    revalidatePath(routes.STOREFRONT);
    revalidatePath('/shop');
    revalidatePath(routes.PRODUCT_LIVE(saved.sku));
    revalidatePath(routes.DASHBOARD);
    revalidatePath(routes.PRODUCT_EDIT(saved.sku));
    return {
      ok: true,
      sku: saved.sku,
      message: copy.PRODUCT_SAVED(saved.sku),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : copy.PRODUCT_SAVE_FAILED;
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
    revalidatePath(routes.STOREFRONT);
    revalidatePath('/shop');
    revalidatePath(routes.PRODUCT_LIVE(updated.sku));
    revalidatePath(routes.DASHBOARD);
    return {
      ok: true,
      sku: updated.sku,
      message: copy.STOCK_UPDATED(updated.sku, updated.stock),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : copy.STOCK_UPDATE_FAILED;
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
    revalidatePath(routes.STOREFRONT);
    revalidatePath('/shop');
    revalidatePath(routes.PRODUCT_LIVE(updated.sku));
    revalidatePath(routes.DASHBOARD);
    return {
      ok: true,
      sku: updated.sku,
      message: copy.STATUS_UPDATED(updated.sku, updated.status),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : copy.STATUS_UPDATE_FAILED;
    return { ok: false, message };
  }
}

export async function triggerGoogleDriveSyncAction(
  customCsvText?: string
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    const report = await runGoogleDriveToS3Sync({ customCsvText });
    revalidatePath(routes.STOREFRONT);
    revalidatePath('/shop');
    revalidatePath(routes.DASHBOARD);
    revalidatePath(routes.SYNC);
    for (const item of report.syncedProducts) {
      revalidatePath(routes.PRODUCT_LIVE(item.sku));
    }
    return {
      ok: true,
      message: copy.SYNC_SUCCESS(report.syncedCount),
      syncReport: report,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : copy.SYNC_FAILED;
    return { ok: false, message };
  }
}

export async function updateAdminOrderStatusAction(
  orderNumber: string,
  status: OrderStatus
): Promise<ActionResponse> {
  try {
    await assertAdminAuth();
    await updateOrderStatusForAdmin({ orderNumber, status });
    revalidatePath(routes.ORDERS);
    revalidatePath(routes.ACCOUNT);
    return {
      ok: true,
      message: copy.ORDER_UPDATED(orderNumber, status),
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : copy.ORDER_UPDATE_FAILED;
    return { ok: false, message };
  }
}
