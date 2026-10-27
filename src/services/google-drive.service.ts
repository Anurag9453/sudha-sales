// ============================================================================
// Google Drive Reader Service: src/services/google-drive.service.ts
// Connects to the Retailer's `Clothing Store/` Google Drive root folder:
//   Clothing Store/
//     products.csv
//     SKU001/
//       front.jpg
//       back.jpg
//       model.jpg
//     SKU002/
//       front.jpg
//       model.jpg
// Supports Service Account JWT or API Key authentication via Google Drive v3
// REST API using native `fetch` and `crypto`.
// ============================================================================

import crypto from 'crypto';
import { AppConstants } from '@/constants/app.constants';

export interface DriveImageFile {
  id: string;
  name: string; // e.g. "front.jpg", "model.jpg", "back.jpg"
  mimeType: string;
  md5Checksum?: string;
  modifiedTime?: string;
  /** Optional direct preview URL when simulating or using public Drive files */
  previewUrl?: string;
}

export interface DriveSkuFolder {
  sku: string;
  folderId: string;
  images: DriveImageFile[];
}

export interface DriveWorkspaceSnapshot {
  mode: 'live-google-drive' | 'sample-drive-simulation';
  rootFolderId: string;
  csvContent: string;
  skuFolders: Record<string, DriveSkuFolder>;
}

export function isGoogleDriveConfigured(): boolean {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '';
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY ?? '';
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '';

  const hasAuth =
    (Boolean(apiKey) && !apiKey.includes('your-google-drive-api-key')) ||
    (Boolean(serviceEmail) &&
      Boolean(privateKey) &&
      !serviceEmail.includes('your-service-account'));

  return Boolean(
    rootFolderId &&
      !rootFolderId.includes('your-drive-folder-id') &&
      hasAuth
  );
}

/**
 * Generates an OAuth2 access token from a Google Cloud Service Account using RS256 JWT.
 */
async function getServiceAccountAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' })
  ).toString('base64url');

  const claimSet = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claimSet}`);
  const signature = signer.sign(privateKey, 'base64url');

  const assertion = `${header}.${claimSet}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google OAuth2 token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function driveApiFetch(
  urlPath: string,
  accessToken: string | null
): Promise<Response> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const separator = urlPath.includes('?') ? '&' : '?';
  const url =
    !accessToken && apiKey
      ? `https://www.googleapis.com/drive/v3/${urlPath}${separator}key=${encodeURIComponent(apiKey)}`
      : `https://www.googleapis.com/drive/v3/${urlPath}`;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(url, { headers });
}

/**
 * Orders SKU folder images so `front.*` is always primary (index 0),
 * followed by `model.*`, `back.*`, and any other angles alphabetically.
 */
export function sortDriveImagesByConvention(
  images: DriveImageFile[]
): DriveImageFile[] {
  const rank = (filename: string): number => {
    const lower = filename.toLowerCase();
    if (lower.startsWith('front')) return 0;
    if (lower.startsWith('model')) return 1;
    if (lower.startsWith('back')) return 2;
    return 3;
  };

  return [...images].sort((a, b) => {
    const rDiff = rank(a.name) - rank(b.name);
    if (rDiff !== 0) return rDiff;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Downloads a raw file buffer from Google Drive by fileId.
 */
export async function downloadDriveFileBuffer(fileId: string): Promise<Buffer> {
  const token = await getServiceAccountAccessToken();
  const res = await driveApiFetch(`files/${fileId}?alt=media`, token);
  if (!res.ok) {
    throw new Error(`Failed to download Google Drive file ${fileId}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Reads `products.csv` and all `SKUxxx/` subfolders from the live Google Drive
 * root folder, or returns a realistic sample Google Drive workspace snapshot
 * when credentials are not yet configured.
 */
export async function fetchGoogleDriveWorkspace(
  overrideCsvText?: string
): Promise<DriveWorkspaceSnapshot> {
  if (!isGoogleDriveConfigured()) {
    return buildSampleDriveWorkspaceSnapshot(overrideCsvText);
  }

  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;
  const token = await getServiceAccountAccessToken();

  // 1. List all children inside `Clothing Store/` root folder
  const q = encodeURIComponent(`'${rootFolderId}' in parents and trashed = false`);
  const listRes = await driveApiFetch(
    `files?q=${q}&fields=files(id,name,mimeType,md5Checksum,modifiedTime)&pageSize=500`,
    token
  );

  if (!listRes.ok) {
    throw new Error(`Google Drive folder listing failed: ${listRes.status}`);
  }

  const listData = (await listRes.json()) as {
    files: Array<{
      id: string;
      name: string;
      mimeType: string;
      md5Checksum?: string;
      modifiedTime?: string;
    }>;
  };

  let csvContent = overrideCsvText ?? '';
  if (!csvContent) {
    const csvFile = listData.files.find(
      (f) => f.name.toLowerCase() === 'products.csv'
    );
    if (!csvFile) {
      throw new Error(
        'Could not find `products.csv` in the configured Google Drive root folder.'
      );
    }
    const csvBuffer = await downloadDriveFileBuffer(csvFile.id);
    csvContent = csvBuffer.toString('utf-8');
  }

  // 2. Discover SKU folders (e.g. SKU001/, SKU002/, etc.)
  const folderFiles = listData.files.filter(
    (f) => f.mimeType === 'application/vnd.google-apps.folder'
  );

  const skuFolders: Record<string, DriveSkuFolder> = {};

  for (const folder of folderFiles) {
    const skuKey = folder.name.trim().toUpperCase();
    const imgQuery = encodeURIComponent(
      `'${folder.id}' in parents and trashed = false and mimeType contains 'image/'`
    );
    const imgRes = await driveApiFetch(
      `files?q=${imgQuery}&fields=files(id,name,mimeType,md5Checksum,modifiedTime)&pageSize=50`,
      token
    );

    if (imgRes.ok) {
      const imgData = (await imgRes.json()) as { files: DriveImageFile[] };
      const hydratedFiles = (imgData.files ?? []).map((f) => ({
        ...f,
        previewUrl:
          f.previewUrl ||
          AppConstants.Services.STORAGE.DRIVE_DIRECT_URL(encodeURIComponent(f.id)),
      }));
      skuFolders[skuKey] = {
        sku: skuKey,
        folderId: folder.id,
        images: sortDriveImagesByConvention(hydratedFiles),
      };
    }
  }

  return {
    mode: 'live-google-drive',
    rootFolderId,
    csvContent,
    skuFolders,
  };
}

/**
 * Sample Google Drive folder structure matching the retailer's exact blueprint:
 * Clothing Store/
 *   products.csv
 *   SKU001/ (front.jpg, back.jpg, model.jpg)
 *   SKU011/ (front.jpg, model.jpg, back.jpg)
 *   SKU012/ (front.jpg, model.jpg)
 */
import { SAMPLE_GOOGLE_DRIVE_CSV } from '@/lib/sample-csv';
export { SAMPLE_GOOGLE_DRIVE_CSV };

function buildSampleDriveWorkspaceSnapshot(
  overrideCsvText?: string
): DriveWorkspaceSnapshot {
  const defaultPhotoPool = [
    {
      front: '/products/sku-001-navy-blue.jpg',
      model: '/products/sku-002-royal-plum.jpg',
      back: '/products/sku-003-midnight-black.jpg',
    },
    {
      front: '/products/kb-7847-black-dhoti-set.jpg',
      model: '/products/kb-8840-maroon-bandhani-anarkali.jpg',
      back: '/products/kb-7690-sky-blue-shibori-set.jpg',
    },
    {
      front: '/products/kb-9150-mustard-skirt-set.jpg',
      model: '/products/kb-5991-yellow-festive-suit.jpg',
      back: '/products/sku-004-emerald-green.jpg',
    },
  ];

  const csvToUse = overrideCsvText?.trim()
    ? overrideCsvText
    : SAMPLE_GOOGLE_DRIVE_CSV;

  const skuFolders: Record<string, DriveSkuFolder> = {
    SKU001: {
      sku: 'SKU001',
      folderId: 'gdrive-folder-SKU001',
      images: [
        {
          id: 'file-sku001-front',
          name: 'front.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[0].front,
        },
        {
          id: 'file-sku001-model',
          name: 'model.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[0].model,
        },
        {
          id: 'file-sku001-back',
          name: 'back.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[0].back,
        },
      ],
    },
    SKU011: {
      sku: 'SKU011',
      folderId: 'gdrive-folder-SKU011',
      images: [
        {
          id: 'file-sku011-front',
          name: 'front.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[1].front,
        },
        {
          id: 'file-sku011-model',
          name: 'model.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[1].model,
        },
        {
          id: 'file-sku011-back',
          name: 'back.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[1].back,
        },
      ],
    },
    SKU012: {
      sku: 'SKU012',
      folderId: 'gdrive-folder-SKU012',
      images: [
        {
          id: 'file-sku012-front',
          name: 'front.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[2].front,
        },
        {
          id: 'file-sku012-model',
          name: 'model.jpg',
          mimeType: 'image/jpeg',
          previewUrl: defaultPhotoPool[2].model,
        },
      ],
    },
  };

  return {
    mode: 'sample-drive-simulation',
    rootFolderId: 'Clothing Store (Demo Workspace)',
    csvContent: csvToUse,
    skuFolders,
  };
}
