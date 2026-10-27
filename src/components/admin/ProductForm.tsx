// ============================================================================
// Admin Product Form: src/components/admin/ProductForm.tsx
// Reusable Create / Edit product form structured around SKU, S3 keys, sizes,
// pricing, stock, and status—aligned with the future Google Drive CSV schema.
// ============================================================================

'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FolderSync,
} from 'lucide-react';
import { saveProductAction } from '@/app/admin/actions';
import { STANDARD_SIZES, type Category, type Collection, type Product } from '@/types/domain';
import { buildStandardS3Key } from '@/services/storage.service';
import { LuxurySpinner } from '@/components/ui/LuxurySpinner';
import { AppConstants } from '@/constants/app.constants';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: Product | null;
  categories: Category[];
  collections: Collection[];
}

export function ProductForm({
  mode,
  initialProduct,
  categories,
  collections,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formCopy = AppConstants.Admin.COPY.PRODUCT_FORM;

  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id ?? categories[0]?.id ?? ''
  );
  const [collectionId, setCollectionId] = useState(
    initialProduct?.collection_id ?? collections[0]?.id ?? ''
  );
  const [price, setPrice] = useState<string>(
    initialProduct ? String(initialProduct.price) : ''
  );
  const [salePrice, setSalePrice] = useState<string>(
    initialProduct?.sale_price !== null && initialProduct?.sale_price !== undefined
      ? String(initialProduct.sale_price)
      : ''
  );
  const [stock, setStock] = useState<string>(
    initialProduct ? String(initialProduct.stock) : formCopy.DEFAULT_STOCK
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialProduct?.sizes ?? [...formCopy.DEFAULT_SIZES]
  );
  const [color, setColor] = useState(initialProduct?.color ?? '');
  const [vendorCode, setVendorCode] = useState(initialProduct?.vendor_code ?? '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DRAFT'>(
    initialProduct?.status ?? 'ACTIVE'
  );

  const [images, setImages] = useState<
    Array<{ image_url: string; s3_key: string; alt_text: string }>
  >(
    initialProduct?.images.length
      ? initialProduct.images.map((img) => ({
          image_url: img.image_url,
          s3_key: img.s3_key ?? '',
          alt_text: img.alt_text ?? '',
        }))
      : [
          {
            image_url: formCopy.DEFAULT_IMAGE_URL,
            s3_key: formCopy.DEFAULT_S3_KEY,
            alt_text: formCopy.DEFAULT_ALT,
          },
        ]
  );

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddImageRow = () => {
    const index = images.length;
    const defaultName =
      index === 0
        ? formCopy.FRONT_JPG
        : index === 1
          ? formCopy.MODEL_JPG
          : `view-${index + 1}.jpg`;
    setImages((prev) => [
      ...prev,
      {
        image_url: '',
        s3_key: buildStandardS3Key(sku || formCopy.FALLBACK_SKU, defaultName),
        alt_text: `${name || 'Product'} - View ${index + 1}`,
      },
    ]);
  };

  const handleRemoveImageRow = (idx: number) => {
    if (images.length <= 1) return;
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const response = await saveProductAction({
        sku: sku.trim().toUpperCase(),
        name,
        description,
        category_id: categoryId,
        collection_id: collectionId || null,
        price: Number(price),
        sale_price: salePrice.trim() ? Number(salePrice) : null,
        stock: Number(stock),
        sizes: selectedSizes,
        color,
        vendor_code: vendorCode || null,
        status,
        images: images.map((img, i) => ({
          image_url: img.image_url,
          s3_key:
            img.s3_key ||
            buildStandardS3Key(
              sku || formCopy.FALLBACK_SKU,
              i === 0 ? formCopy.FRONT_JPG : `view-${i + 1}.jpg`
            ),
          alt_text: img.alt_text || `${name} - View ${i + 1}`,
          is_primary: i === 0,
        })),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          text: response.message || formCopy.VALIDATION_FAILED,
        });
        return;
      }

      setFeedback({
        type: 'success',
        text: response.message || formCopy.SAVED_SUCCESS,
      });

      if (mode === 'create' && response.sku) {
        router.push(AppConstants.Admin.ROUTES.PRODUCT_EDIT(response.sku));
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isPending && (
        <LuxurySpinner
          fullScreenOverlay
          title={formCopy.SPINNER_TITLE(sku)}
          subtitle={formCopy.SPINNER_SUBTITLE}
        />
      )}
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <Link
            href={AppConstants.Admin.ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {formCopy.BACK_LINK}
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950">
            {mode === 'create'
              ? formCopy.TITLE_CREATE
              : `${formCopy.TITLE_EDIT_PREFIX}${initialProduct?.sku}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'edit' && initialProduct && (
            <Link
              href={AppConstants.Admin.ROUTES.PRODUCT_LIVE(initialProduct.sku)}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100"
            >
              {formCopy.BTN_LIVE_PAGE}
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? formCopy.BTN_SAVING : formCopy.BTN_SAVE}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Core CSV-Mapped Fields & Images */}
        <div className="lg:col-span-8 space-y-6">
          {/* Core Identity Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              {formCopy.SEC1_TITLE}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_SKU}
                </label>
                <input
                  required
                  type="text"
                  value={sku}
                  disabled={mode === 'edit'}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder={formCopy.PLACEHOLDER_SKU}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase bg-white disabled:bg-stone-100 disabled:text-stone-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  {formCopy.HINT_SKU}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_NAME}
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_NAME}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {formCopy.LABEL_DESC}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={formCopy.PLACEHOLDER_DESC}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_COLOR}
                </label>
                <input
                  required
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_COLOR}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_VENDOR}
                </label>
                <input
                  type="text"
                  value={vendorCode}
                  onChange={(e) => setVendorCode(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_VENDOR}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Inventory Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              {formCopy.SEC2_TITLE}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_PRICE}
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_PRICE}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_SALE_PRICE}
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_SALE_PRICE}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {formCopy.LABEL_STOCK}
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder={formCopy.PLACEHOLDER_STOCK}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  {formCopy.LABEL_SIZES_PRE}
                  <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                    {selectedSizes.join('|') || formCopy.LABEL_SIZES_FALLBACK}
                  </code>
                  {formCopy.LABEL_SIZES_POST}
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {STANDARD_SIZES.map((sz) => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Images & S3 Keys Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
                  {formCopy.SEC3_TITLE}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {formCopy.SEC3_SUBTITLE}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddImageRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100"
              >
                <Plus className="w-3.5 h-3.5" />
                {formCopy.BTN_ADD_IMAGE}
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row gap-3 items-start"
                >
                  <div className="relative w-16 aspect-[3/4] rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                    {img.image_url ? (
                      <Image
                        src={img.image_url}
                        alt={img.alt_text || 'Preview'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        {idx === 0 ? formCopy.LABEL_PRIMARY_IMG : formCopy.LABEL_IMG_N(idx + 1)}
                      </label>
                      <input
                        required
                        type="url"
                        value={img.image_url}
                        onChange={(e) => {
                          const next = [...images];
                          next[idx] = { ...next[idx], image_url: e.target.value };
                          setImages(next);
                        }}
                        placeholder={formCopy.PLACEHOLDER_URL}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        {formCopy.LABEL_S3_KEY}
                      </label>
                      <input
                        type="text"
                        value={img.s3_key}
                        onChange={(e) => {
                          const next = [...images];
                          next[idx] = { ...next[idx], s3_key: e.target.value };
                          setImages(next);
                        }}
                        placeholder={`${sku || 'SKU001'}/front.jpg`}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {formCopy.LABEL_ALT}
                        </label>
                        <input
                          type="text"
                          value={img.alt_text}
                          onChange={(e) => {
                            const next = [...images];
                            next[idx] = { ...next[idx], alt_text: e.target.value };
                            setImages(next);
                          }}
                          placeholder={formCopy.PLACEHOLDER_ALT}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                        />
                      </div>

                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageRow(idx)}
                          aria-label={formCopy.ARIA_REMOVE_IMG}
                          className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Status, Category, Collection, Drive Sync Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              {formCopy.SEC_PUBLISHING}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {formCopy.LABEL_VISIBILITY}
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'DRAFT')
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white font-medium"
              >
                <option value="ACTIVE">{formCopy.OPT_ACTIVE}</option>
                <option value="INACTIVE">{formCopy.OPT_INACTIVE}</option>
                <option value="DRAFT">{formCopy.OPT_DRAFT}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {formCopy.LABEL_CATEGORY}
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {formCopy.LABEL_COLLECTION}
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
              >
                <option value="">{formCopy.OPT_NONE}</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Google Drive CSV Row Equivalent Preview */}
          <div className="p-5 rounded-2xl bg-stone-900 text-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <FolderSync className="w-4 h-4" />
              <span>{formCopy.DRIVE_MAPPING_TITLE}</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {formCopy.DRIVE_MAPPING_DESC_PRE}
              <code className="text-white">{formCopy.DRIVE_MAPPING_CSV}</code>{' '}
              {formCopy.DRIVE_MAPPING_DESC_MID}
              <code className="text-white">
                Clothing Store/{sku || 'SKU001'}
                {formCopy.DRIVE_MAPPING_FOLDER_SUFFIX}
              </code>{' '}
            </p>
            <div className="p-3 rounded-xl bg-stone-950 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-nowrap">
              {sku || 'SKU001'},{name || 'Product Name'},
              {categories.find((c) => c.id === categoryId)?.name ?? 'Category'},
              {collections.find((c) => c.id === collectionId)?.name ?? 'Collection'},
              &quot;{(description || '').slice(0, 28)}...&quot;,{price || 0},
              {salePrice || ''},{stock || 0},{selectedSizes.join('|')},{color || 'Color'},
              {status}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
