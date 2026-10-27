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
import { AppConstants } from '@/constants/app.constants';

export default function AdminSyncPage() {
  const [csvText, setCsvText] = useState<string>('');
  const [report, setReport] = useState<DriveSyncExecutionReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copy = AppConstants.Admin.COPY.SYNC;
  const routes = AppConstants.Admin.ROUTES;

  const handleRunSync = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const customCsv = csvText.trim() ? csvText : undefined;
      const res = await triggerGoogleDriveSyncAction(customCsv);
      if (!res.ok || !res.syncReport) {
        setErrorMsg(res.message || copy.ERROR_DEFAULT);
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
          title={copy.SPINNER_TITLE}
          subtitle={copy.SPINNER_SUBTITLE}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <Link
            href={routes.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {copy.BACK_LINK}
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            {copy.TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {copy.SUBTITLE_PREFIX}<code className="font-mono">{copy.SUBTITLE_CSV}</code>
            {copy.SUBTITLE_MID}<code className="font-mono">{copy.SUBTITLE_FOLDERS}</code>
            {copy.SUBTITLE_SUFFIX}
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
              <span>{copy.BTN_RUNNING}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>{copy.BTN_RUN_SYNC}</span>
            </>
          )}
        </button>
      </div>

      {/* Pipeline Architecture Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span>{copy.STEP1_TITLE}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {copy.STEP1_DESC_PRE}
            <code className="font-mono bg-stone-100 px-1 rounded">{copy.STEP1_CSV}</code>{' '}
            {copy.STEP1_DESC_MID}
            <code className="font-mono bg-stone-100 px-1 rounded">{copy.STEP1_SKU1}</code>,{' '}
            <code className="font-mono bg-stone-100 px-1 rounded">{copy.STEP1_SKU2}</code>
            {copy.STEP1_DESC_POST}
            <code className="font-mono">{copy.STEP1_IMG1}</code>,{' '}
            <code className="font-mono">{copy.STEP1_IMG2}</code>,{' '}
            <code className="font-mono">{copy.STEP1_IMG3}</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <HardDriveUpload className="w-4 h-4 text-amber-700" />
            <span>{copy.STEP2_TITLE}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {copy.STEP2_DESC_PRE}
            <code className="font-mono bg-stone-100 px-1 rounded">{copy.STEP2_KEY}</code>
            {copy.STEP2_DESC_POST}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            <Database className="w-4 h-4 text-amber-700" />
            <span>{copy.STEP3_TITLE}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {copy.STEP3_DESC_PRE}
            <code className="font-mono bg-stone-100 px-1 rounded">{copy.STEP3_SKU}</code>
            {copy.STEP3_DESC_POST}
          </p>
        </div>
      </div>

      {/* Interactive products.csv Editor / Uploader */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              {copy.OVERRIDE_TITLE}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {copy.OVERRIDE_DESC}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCsvText(SAMPLE_GOOGLE_DRIVE_CSV)}
              className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700"
            >
              {copy.BTN_LOAD_SAMPLE}
            </button>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 cursor-pointer">
              <FolderSync className="w-3.5 h-3.5" />
              <span>{copy.BTN_UPLOAD_CSV}</span>
              <input
                type="file"
                accept={copy.INPUT_ACCEPT_CSV}
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
          placeholder={copy.PLACEHOLDER_CSV}
          spellCheck={false}
          className="w-full p-4 rounded-xl bg-stone-950 text-emerald-300 placeholder:text-stone-500 font-mono text-xs leading-relaxed border border-stone-800 focus:outline-none"
        />

        <p className="text-[11px] text-stone-500">
          {copy.CSV_TIP_PRE}
          <code className="font-mono text-stone-800">
            {copy.CSV_TIP_CODE}
          </code>
          {copy.CSV_TIP_MID}
          <strong>{copy.CSV_TIP_BTN}</strong>
          {copy.CSV_TIP_POST}
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
                  {copy.REPORT_TITLE(report.syncedCount, report.totalRowsParsed)}
                </h3>
                <p className="text-xs text-stone-500">
                  {copy.REPORT_MODE_LABEL}<strong className="text-stone-800">{report.mode}</strong>
                  {copy.REPORT_COMPLETED_LABEL}{new Date(report.completedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <Link
              href={routes.SHOP_COLLECTION(copy.DEFAULT_COLLECTION_SLUG)}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-900"
            >
              <span>{copy.BTN_VIEW_STOREFRONT}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Synced Products Table */}
          {report.syncedProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">{copy.TH_SKU}</th>
                    <th className="py-2.5 px-3">{copy.TH_NAME}</th>
                    <th className="py-2.5 px-3">{copy.TH_PRICE}</th>
                    <th className="py-2.5 px-3">{copy.TH_STOCK_SIZES}</th>
                    <th className="py-2.5 px-3">{copy.TH_S3_KEYS}</th>
                    <th className="py-2.5 px-3">{copy.TH_STATUS}</th>
                    <th className="py-2.5 px-3 text-right">{copy.TH_VERIFY}</th>
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
                          href={routes.PRODUCT_LIVE(item.sku)}
                          target="_blank"
                          className="text-stone-900 font-semibold hover:underline"
                        >
                          {copy.LINK_OPEN_PAGE}
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
                {copy.CSV_ERRORS_TITLE(report.rowErrors.length)}
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
