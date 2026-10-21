// ============================================================================
// Admin Google Drive + CSV -> Amazon S3 -> Supabase Sync Console
// File: src/app/admin/sync/page.tsx
// Allows the retailer to:
// 1. Trigger a 1-click sync from Google Drive (`Clothing Store/products.csv` +
//    `SKU001/` image folders).
// 2. Edit/paste/upload `products.csv` rows directly to test & run the exact
//    SKU -> S3 -> Supabase pipeline immediately.
// 3. View detailed per-SKU sync results, S3 object keys, and any CSV row errors.
// ============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  FolderSync,
  Play,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  HardDriveUpload,
  Database,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { triggerGoogleDriveSyncAction } from '../actions';
import { SAMPLE_GOOGLE_DRIVE_CSV } from '@/lib/sample-csv';
import type { DriveSyncExecutionReport } from '@/services/gdrive-s3-sync.service';
import { formatPrice } from '@/lib/format';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';

export default function AdminSyncPage() {
  const [csvText, setCsvText] = useState<string>('');
  const [report, setReport] = useState<DriveSyncExecutionReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRunSync = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const customCsv = csvText.trim() ? csvText : undefined;
      const res = await triggerGoogleDriveSyncAction(customCsv);
      if (!res.ok || !res.syncReport) {
        setErrorMsg(res.message || 'Sync failed');
        return;
      }
      setReport(res.syncReport);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  return (
    <div className="space-y-8">
      {isPending && (
        <LuxurySpinner
          fullScreenOverlay
          title="Synchronizing Google Drive & S3..."
          subtitle="Reading products.csv, scanning SKU image folders, and updating catalog"
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Product Catalog
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            Google Drive CSV &amp; S3 Sync Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Synchronize <code className="font-mono">Clothing Store/products.csv</code> and{' '}
            <code className="font-mono">SKU001/</code> image folders to Amazon S3 &amp;
            Supabase PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleRunSync}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Sync Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Sync Now</span>
            </>
          )}
        </button>
      </div>

      {/* Pipeline Architecture Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span>Step 1: Google Drive Source</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Reads <code className="font-mono bg-stone-100 px-1 rounded">products.csv</code>{' '}
            and discovers matching <code className="font-mono bg-stone-100 px-1 rounded">SKU001/</code>,{' '}
            <code className="font-mono bg-stone-100 px-1 rounded">SKU011/</code> folders
            containing <code className="font-mono">front.jpg</code>,{' '}
            <code className="font-mono">model.jpg</code>, <code className="font-mono">back.jpg</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <HardDriveUpload className="w-4 h-4 text-amber-700" />
            <span>Step 2: Amazon S3 Image Sync</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Maps each photo to its standardized S3 object key{' '}
            <code className="font-mono bg-stone-100 px-1 rounded">SKU001/front.jpg</code>{' '}
            and streams new images to your S3 bucket / CloudFront CDN.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <Database className="w-4 h-4 text-amber-700" />
            <span>Step 3: Supabase Upsert by SKU</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Auto-creates Categories &amp; Collections if new, upserts products by unique{' '}
            <code className="font-mono bg-stone-100 px-1 rounded">sku</code>, and refreshes
            the Sudha Sales website immediately.
          </p>
        </div>
      </div>

      {/* Interactive products.csv Editor / Uploader */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Optional Manual <code className="font-mono">products.csv</code> Override
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Leave blank to read <code className="font-mono text-stone-800">products.csv</code> directly from your live Google Drive folder, or paste/upload a CSV override below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCsvText(SAMPLE_GOOGLE_DRIVE_CSV)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700"
            >
              Load Sample CSV
            </button>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 cursor-pointer">
              <FolderSync className="w-3.5 h-3.5" />
              <span>Upload Local .CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Leave empty to pull products.csv directly from your Google Drive folder (13nZuFJyo1u5BGV4PUDwvauEOFQ4YmLTB)..."
          spellCheck={false}
          className="w-full p-4 rounded-xl bg-stone-950 text-emerald-300 placeholder:text-stone-500 font-mono text-xs leading-relaxed border border-stone-800 focus:outline-none"
        />

        <p className="text-[11px] text-stone-500">
          Tip: Try editing a price, changing stock, or adding a new line like{' '}
          <code className="font-mono text-stone-800">
            SKU015,Festive Silk Kurta,Kurtis &amp; Tunics,New Collection,Pure silk kurta,1999,1599,20,M|L|XL,Maroon,ACTIVE
          </code>{' '}
          and click <strong>Run Sync Now</strong> to see it appear on the storefront!
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sync Execution Report */}
      {report && (
        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-950">
                  Synchronization Complete ({report.syncedCount} of{' '}
                  {report.totalRowsParsed} SKUs Upserted)
                </h3>
                <p className="text-xs text-stone-500">
                  Mode: <strong className="text-stone-800">{report.mode}</strong> •
                  Completed at {new Date(report.completedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <Link
              href="/shop?collection=new-collection"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-900"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Synced Products Table */}
          {report.syncedProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Price / Sale</th>
                    <th className="py-2.5 px-3">Stock &amp; Sizes</th>
                    <th className="py-2.5 px-3">Mapped S3 Image Keys</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {report.syncedProducts.map((item) => (
                    <tr key={item.sku} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">
                        {item.sku}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-3">
                        {item.salePrice ? (
                          <span>
                            <strong>{formatPrice(item.salePrice)}</strong>{' '}
                            <span className="line-through text-stone-400">
                              {formatPrice(item.price)}
                            </span>
                          </span>
                        ) : (
                          <strong>{formatPrice(item.price)}</strong>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold">{item.stock} pcs</span> •{' '}
                        <span className="font-mono text-stone-600">
                          {item.sizes.join('|')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.s3Keys.map((key) => (
                            <span
                              key={key}
                              className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                            >
                              {key}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/product/${item.sku}`}
                          target="_blank"
                          className="text-stone-900 font-semibold hover:underline"
                        >
                          Open Page ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Row Validation Errors */}
          {report.rowErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                CSV Validation Errors ({report.rowErrors.length})
              </h4>
              <ul className="space-y-1 text-xs text-rose-800">
                {report.rowErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.rowNumber} {err.sku ? `(${err.sku})` : ''}:{' '}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
