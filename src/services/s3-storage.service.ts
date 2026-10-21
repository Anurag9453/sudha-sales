// ============================================================================
// Amazon S3 Uploader & Signer: src/services/s3-storage.service.ts
// Lightweight, zero-bloat AWS Signature V4 S3 PUT client using Node's native
// `crypto` and `fetch`. Streams product images from Google Drive directly into
// Amazon S3 under `products/<SKU>/<filename>` (e.g. `SKU001/front.jpg`).
// ============================================================================

import crypto from 'crypto';
import { publicEnv } from '@/lib/env';

export interface S3UploadResult {
  s3Key: string;
  publicUrl: string;
  uploadedToLiveS3: boolean;
}

export function isS3Configured(): boolean {
  const bucket = process.env.AWS_S3_BUCKET_NAME ?? '';
  const accessKey = process.env.AWS_ACCESS_KEY_ID ?? '';
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY ?? '';

  return Boolean(
    bucket &&
      accessKey &&
      secretKey &&
      !accessKey.includes('your-aws-access-key-id') &&
      !secretKey.includes('your-aws-secret-access-key')
  );
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

/**
 * Builds the public CloudFront CDN or S3 URL for a given S3 object key.
 */
export function getPublicUrlForS3Key(s3Key: string, fallbackUrl?: string): string {
  const cleanKey = s3Key.replace(/^\/+/, '');
  const cdnBase = publicEnv.cdnBaseUrl.replace(/\/+$/, '');

  if (cdnBase && !cdnBase.includes('d111111abcdef8.cloudfront.net')) {
    return `${cdnBase}/${cleanKey}`;
  }

  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'ap-south-1';

  if (bucket && isS3Configured()) {
    return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
  }

  return fallbackUrl || `https://s3.${region}.amazonaws.com/sudha-sales/${cleanKey}`;
}

/**
 * Uploads an image buffer directly to Amazon S3 using AWS Signature Version 4.
 */
export async function uploadProductImageToS3(params: {
  s3Key: string;
  body: Buffer;
  contentType: string;
  fallbackUrl?: string;
}): Promise<S3UploadResult> {
  const cleanKey = params.s3Key.replace(/^\/+/, '');

  if (!isS3Configured()) {
    return {
      s3Key: cleanKey,
      publicUrl: getPublicUrlForS3Key(cleanKey, params.fallbackUrl),
      uploadedToLiveS3: false,
    };
  }

  const bucket = process.env.AWS_S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const endpoint = `https://${host}/${cleanKey}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = sha256Hex(params.body);

  const canonicalUri = `/${cleanKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
  const canonicalQueryString = '';
  const canonicalHeaders =
    `content-type:${params.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, 's3');
  const kSigning = hmacSha256(kService, 'aws4_request');
  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign, 'utf8')
    .digest('hex');

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': params.contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      Authorization: authorizationHeader,
    },
    body: new Uint8Array(params.body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`S3 upload failed for ${cleanKey}: ${response.status} ${errorText}`);
  }

  return {
    s3Key: cleanKey,
    publicUrl: getPublicUrlForS3Key(cleanKey),
    uploadedToLiveS3: true,
  };
}
