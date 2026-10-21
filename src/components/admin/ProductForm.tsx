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
    initialProduct ? String(initialProduct.stock) : '10'
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialProduct?.sizes ?? ['M', 'L', 'XL']
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
            image_url:
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
            s3_key: 'SKU011/front.jpg',
            alt_text: 'Front View',
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
      index === 0 ? 'front.jpg' : index === 1 ? 'model.jpg' : `view-${index + 1}.jpg`;
    setImages((prev) => [
      ...prev,
      {
        image_url: '',
        s3_key: buildStandardS3Key(sku || 'SKU000', defaultName),
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
            buildStandardS3Key(sku || 'SKU000', i === 0 ? 'front.jpg' : `view-${i + 1}.jpg`),
          alt_text: img.alt_text || `${name} - View ${i + 1}`,
          is_primary: i === 0,
        })),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          text: response.message || 'Validation failed. Please check your inputs.',
        });
        return;
      }

      setFeedback({
        type: 'success',
        text: response.message || 'Product saved!',
      });

      if (mode === 'create' && response.sku) {
        router.push(`/admin/products/${response.sku}`);
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
          title={`Saving ${sku || 'Product'}...`}
          subtitle="Updating catalog and revalidating storefront pages"
        />
      )}
      {/* Top Action Bar */}
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
            {mode === 'create'
              ? 'Add New Clothing Product'
              : `Edit Product • ${initialProduct?.sku}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'edit' && initialProduct && (
            <Link
              href={`/product/${initialProduct.sku}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100"
            >
              View Live Page ↗
            </Link>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? 'Saving...' : 'Save Product'}</span>
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
              1. SKU &amp; Product Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  SKU (Unique ID) *
                </label>
                <input
                  required
                  type="text"
                  value={sku}
                  disabled={mode === 'edit'}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="SKU011"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase bg-white disabled:bg-stone-100 disabled:text-stone-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Matches Drive folder &amp; CSV SKU
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Floral Cotton Kurti"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Description &amp; Fabric Notes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe fabric weave, embroidery details, silhouette, and wash care..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Color / Shade *
                </label>
                <input
                  required
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Indigo Blue"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Warehouse / Vendor Code (Optional)
                </label>
                <input
                  type="text"
                  value={vendorCode}
                  onChange={(e) => setVendorCode(e.target.value)}
                  placeholder="VEND-JPR-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Inventory Card */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-800">
              2. Pricing, Stock &amp; Sizes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  MRP / Regular Price (₹) *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1299"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sale Price (₹) (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="1199"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Available Stock Quantity *
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Available Sizes * (CSV equivalent:{' '}
                  <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                    {selectedSizes.join('|') || 'M|L|XL'}
                  </code>
                  )
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
                  3. Product Images (S3 / CDN Ready)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  First image is the primary cover (`front.jpg`). Add additional angles
                  (`model.jpg`, `back.jpg`).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddImageRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-100"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image Angle
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
                        {idx === 0 ? 'Primary Image URL (front.jpg) *' : `Image #${idx + 1} URL *`}
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
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Amazon S3 Object Key
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
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={img.alt_text}
                          onChange={(e) => {
                            const next = [...images];
                            next[idx] = { ...next[idx], alt_text: e.target.value };
                            setImages(next);
                          }}
                          placeholder="Front view"
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs"
                        />
                      </div>

                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageRow(idx)}
                          aria-label="Remove image"
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
              Publishing Status
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'DRAFT')
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white font-medium"
              >
                <option value="ACTIVE">ACTIVE (Visible on Storefront)</option>
                <option value="INACTIVE">INACTIVE (Hidden from Customers)</option>
                <option value="DRAFT">DRAFT (Work in Progress)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category *
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
                Collection
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
              >
                <option value="">— None —</option>
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
              <span>Google Drive CSV Mapping</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              This product maps 1:1 to your future{' '}
              <code className="text-white">products.csv</code> row and{' '}
              <code className="text-white">
                Clothing Store/{sku || 'SKU001'}/
              </code>{' '}
              image folder:
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
