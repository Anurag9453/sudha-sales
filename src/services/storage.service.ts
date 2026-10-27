// ============================================================================
// Storage & S3/CDN Resolution Service: src/services/storage.service.ts
// Resolves S3 object keys (synced from Google Drive folders like SKU001/front.jpg)
// into full CloudFront/S3 URLs, while seamlessly handling full external URLs.
// ============================================================================

import { publicEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';
import type { ProductImage } from '@/types/domain';

/**
 * Normalizes any Google Drive thumbnail or web URL into a high-performance,
 * direct edge CDN URL (lh3.googleusercontent.com/d/<id>=w1200) that serves
 * with `Access-Control-Allow-Origin: *` and does not encounter cross-origin
 * redirect / ORB blocking in modern browsers.
 */
export function normalizeGoogleDriveDirectUrl(url: string): string {
  if (!url) return url;

  if (url.includes(AppConstants.Services.STORAGE.DRIVE_CDN_HOST)) {
    return url;
  }

  // Google Drive thumbnail / uc / open link with query ?id=...
  const queryIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && queryIdMatch?.[1]) {
    return AppConstants.Services.STORAGE.DRIVE_DIRECT_URL(queryIdMatch[1]);
  }

  // Google Drive file link: https://drive.google.com/file/d/<id>/...
  const pathIdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (pathIdMatch?.[1]) {
    return AppConstants.Services.STORAGE.DRIVE_DIRECT_URL(pathIdMatch[1]);
  }

  return url;
}

/**
 * Resolves an image record into a displayable URL.
 * Priority:
 * 1. If `NEXT_PUBLIC_CDN_BASE_URL` is configured and `s3_key` is present,
 *    construct `${cdnBaseUrl}/${s3_key}` (unless `image_url` is already an explicit external URL).
 * 2. Otherwise return `image_url` (normalized for direct CDN delivery).
 */
export function resolveProductImageUrl(
  image: Pick<ProductImage, 'image_url' | 's3_key'>
): string {
  const cdnBase = publicEnv.cdnBaseUrl.replace(/\/+$/, '');
  const isPlaceholderCdn =
    !cdnBase || cdnBase.includes(AppConstants.Services.STORAGE.PLACEHOLDER_CDN_SUBSTRING);

  let rawUrl = image.image_url;

  if (!isPlaceholderCdn && image.s3_key) {
    const cleanKey = image.s3_key.replace(/^\/+/, '');
    rawUrl = `${cdnBase}/${cleanKey}`;
  }

  return normalizeGoogleDriveDirectUrl(rawUrl);
}

/**
 * Generates the standardized S3 key for the Google Drive -> S3 sync pipeline.
 * Matches structure: `SKU001/front.jpg`
 */
export function buildStandardS3Key(sku: string, filename: string): string {
  const cleanSku = sku.trim().toUpperCase();
  const cleanFile = filename.trim().replace(/^\/+/, '');
  return `${cleanSku}/${cleanFile}`;
}
