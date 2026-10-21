// ============================================================================
// Protected Admin Layout: src/app/admin/layout.tsx
// Enforces server-side authentication before rendering any admin route.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Package, ExternalLink, LogOut, ShieldCheck, FolderSync } from 'lucide-react';
import { isAdminAuthenticated } from '@/services/admin-auth.service';
import { AdminLoginGate } from '@/components/admin/AdminLoginGate';
import { logoutAdminAction } from './actions';
import { publicEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLoginGate />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      {/* Admin Top Navigation */}
      <header className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <span className="font-serif text-lg tracking-wider font-semibold block leading-none">
                  {publicEnv.storeName}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">
                  Retailer Admin
                </span>
              </div>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-stone-200 hover:bg-stone-800 inline-flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Products &amp; Inventory
              </Link>
              <Link
                href="/admin/sync"
                className="px-3 py-2 rounded-lg text-amber-300 hover:bg-stone-800 inline-flex items-center gap-1.5"
              >
                <FolderSync className="w-3.5 h-3.5" />
                Google Drive + S3 Sync
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-xs font-medium text-stone-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
