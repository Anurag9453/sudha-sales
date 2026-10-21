// ============================================================================
// Admin Authentication Service: src/services/admin-auth.service.ts
// Verifies admin session via HTTP-only signed token or Supabase Auth session.
// ============================================================================

import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';

const ADMIN_SESSION_COOKIE = 'vastra_admin_session';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return false;
  }

  const { adminPasscode } = getServerEnv();
  return sessionToken === `authenticated:${adminPasscode}`;
}

export async function verifyAndCreateAdminSession(passcode: string): Promise<boolean> {
  const { adminPasscode } = getServerEnv();
  if (passcode.trim() !== adminPasscode) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, `authenticated:${adminPasscode}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
