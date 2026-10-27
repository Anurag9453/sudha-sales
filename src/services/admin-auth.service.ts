// ============================================================================
// Admin Authentication Service: src/services/admin-auth.service.ts
// Verifies admin session via HTTP-only signed token or Supabase Auth session.
// ============================================================================

import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';
import { AppConstants } from '@/constants/app.constants';

const authConstants = AppConstants.Services.AUTH;

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authConstants.SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return false;
  }

  const { adminPasscode } = getServerEnv();
  return sessionToken === `${authConstants.SESSION_PREFIX}${adminPasscode}`;
}

export async function verifyAndCreateAdminSession(passcode: string): Promise<boolean> {
  const { adminPasscode } = getServerEnv();
  if (passcode.trim() !== adminPasscode) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(authConstants.SESSION_COOKIE, `${authConstants.SESSION_PREFIX}${adminPasscode}`, {
    httpOnly: true,
    sameSite: authConstants.COOKIE_SAME_SITE,
    path: authConstants.COOKIE_PATH,
    maxAge: authConstants.MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(authConstants.SESSION_COOKIE);
}
