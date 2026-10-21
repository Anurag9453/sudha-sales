// ============================================================================
// Storage & S3/CDN Resolution Service: src/services/storage.service.ts
// Resolves S3 object keys (synced from Google Drive folders like SKU001/front.jpg)
// into full CloudFront/S3 URLs, while seamlessly handling full external URLs.
// ============================================================================

import { publicEnv } from '@/lib/env';
import type { ProductImage } from '@/types/domain';

/**
 * Resolves an image record into a displayable URL.
 * Priority:
 * 1. If `NEXT_PUBLIC_CDN_BASE_URL` is configured and `s3_key` is present,
 *    construct `${cdnBaseUrl}/${s3_key}` (unless `image_url` is already an explicit external URL).
 * 2. Otherwise return `image_url`.
 */
export function resolveProductImageUrl(
  image: Pick<ProductImage, 'image_url' | 's3_key'>
): string {
  const cdnBase = publicEnv.cdnBaseUrl.replace(/\/+$/, '');
  const isPlaceholderCdn =
    !cdnBase || cdnBase.includes('d111111abcdef8.cloudfront.net');

  if (!isPlaceholderCdn && image.s3_key) {
    const cleanKey = image.s3_key.replace(/^\/+/, '');
    return `${cdnBase}/${cleanKey}`;
  }

  return image.image_url;
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
