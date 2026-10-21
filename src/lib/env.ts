// ============================================================================
// Environment Configuration: src/lib/env.ts
// Centralizes access to public & server-only environment variables.
// ============================================================================

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  cdnBaseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL ?? '',
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'SUDHA SALES',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    publicEnv.supabaseUrl &&
      publicEnv.supabaseAnonKey &&
      !publicEnv.supabaseUrl.includes('your-project-id') &&
      !publicEnv.supabaseAnonKey.includes('your-supabase-anon-key')
  );
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  return Boolean(
    keyId &&
      keySecret &&
      !keyId.includes('your_key_id') &&
      !keySecret.includes('your_key_secret')
  );
}

/**
 * Server-only environment variables.
 * Throws if accessed from browser bundles.
 */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed in the browser.');
  }

  return {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    adminEmails: (process.env.ADMIN_EMAILS ?? 'admin@vastrastudio.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    adminPasscode: process.env.ADMIN_PASSCODE || 'vastra2026',
    awsRegion: process.env.AWS_REGION ?? 'ap-south-1',
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME ?? '',
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  };
}
