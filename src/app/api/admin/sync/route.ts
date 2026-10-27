// ============================================================================
// Sync API Endpoint: src/app/api/admin/sync/route.ts
// Triggers the Google Drive (`products.csv` + `SKU001/` image folders) ->
// Amazon S3 -> Supabase PostgreSQL synchronization pipeline.
// Can be triggered by:
// 1. Authenticated Retailer Admin UI (`/admin/sync`)
// 2. Scheduled Cron Job or Google Drive Webhook using `Authorization: Bearer <SYNC_WEBHOOK_SECRET>`
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/services/admin-auth.service';
import { runGoogleDriveToS3Sync } from '@/services/gdrive-s3-sync.service';
import { AppConstants } from '@/constants/app.constants';

const apiConstants = AppConstants.Api;

export async function POST(request: NextRequest) {
  try {
    // Allow either an authenticated Admin browser session OR a valid webhook/cron Bearer secret
    const adminSessionValid = await isAdminAuthenticated();
    const webhookSecret = process.env.SYNC_WEBHOOK_SECRET || apiConstants.DEFAULTS.SYNC_WEBHOOK_SECRET;
    const authHeader = request.headers.get(apiConstants.HEADERS.AUTHORIZATION);
    const bearerValid = authHeader === `${apiConstants.HEADERS.BEARER_PREFIX}${webhookSecret}`;

    if (!adminSessionValid && !bearerValid) {
      return NextResponse.json(
        { ok: false, error: apiConstants.MESSAGES.UNAUTHORIZED_SYNC },
        { status: 401 }
      );
    }

    let customCsvText: string | undefined;
    try {
      const body = (await request.json()) as { csvText?: string };
      if (body?.csvText && typeof body.csvText === 'string') {
        customCsvText = body.csvText;
      }
    } catch {
      // Empty POST body is valid (uses Google Drive `products.csv`)
    }

    const report = await runGoogleDriveToS3Sync({ customCsvText });

    // Revalidate all storefront & admin pages so new SKUs appear immediately
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin');
    for (const item of report.syncedProducts) {
      revalidatePath(`/product/${item.sku}`);
    }

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : apiConstants.MESSAGES.UNEXPECTED_SYNC_FAILURE;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
