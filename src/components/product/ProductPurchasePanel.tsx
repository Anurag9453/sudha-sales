// ============================================================================
// Product Purchase Panel: src/components/product/ProductPurchasePanel.tsx
// Handles size selection, quantity selection, stock validation, Add to Cart,
// and instant Buy Now redirection to the Cart page.
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/store/cart-context';
import { useCustomerAuth } from '@/store/customer-auth-context';
import { getEffectivePrice } from '@/lib/format';
import type { Product } from '@/types/domain';

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  const getStockForSize = (s: string): number => {
    if (product.size_stock && typeof product.size_stock[s] === 'number') {
      return Math.min(product.stock, product.size_stock[s]);
    }
    return product.stock;
  };

  const initialSize = React.useMemo(() => {
    if (!product.sizes || product.sizes.length === 0) return 'FREE';
    const firstAvailable = product.sizes.find((s) => {
      const q =
        product.size_stock && typeof product.size_stock[s] === 'number'
          ? Math.min(product.stock, product.size_stock[s])
          : product.stock;
      return q > 0;
    });
    return firstAvailable ?? product.sizes[0];
  }, [product.sizes, product.size_stock, product.stock]);

  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOverallOutOfStock = product.stock <= 0 || product.status !== 'ACTIVE';
  const currentSizeStock = getStockForSize(selectedSize);
  const isSelectedSizeOutOfStock = isOverallOutOfStock || currentSizeStock <= 0;
  const maxAllowedQty = Math.max(1, Math.min(currentSizeStock, 10));
  const effectivePrice = getEffectivePrice(product.price, product.sale_price);

  const handleQuantityChange = (next: number) => {
    if (next < 1) return;
    if (next > maxAllowedQty) {
      setErrorMessage(`Maximum available stock in size ${selectedSize} is ${currentSizeStock}.`);
      return;
    }
    setErrorMessage(null);
    setQuantity(next);
  };

  const buildCartItem = () => ({
    sku: product.sku,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl:
      product.images[0]?.image_url ??
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    color: product.color,
    size: selectedSize,
    unitPrice: effectivePrice,
    originalPrice: product.price,
    quantity,
    maxStock: currentSizeStock,
  });

  const handleAddToCart = () => {
    if (isSelectedSizeOutOfStock) return;
    if (!isAuthenticated) {
      router.push(`/login?next=/product/${product.sku}&reason=purchase`);
      return;
    }
    if (!selectedSize) {
      setErrorMessage('Please select a size first.');
      return;
    }
    setErrorMessage(null);
    addItem(buildCartItem());
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2200);
  };

  const handleBuyNow = () => {
    if (isSelectedSizeOutOfStock) return;
    if (!isAuthenticated) {
      router.push(`/login?next=/product/${product.sku}&reason=purchase`);
      return;
    }
    if (!selectedSize) {
      setErrorMessage('Please select a size first.');
      return;
    }
    addItem(buildCartItem());
    router.push('/cart');
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Stock Status Indicator */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {isOverallOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Currently Out of Stock
          </span>
        ) : isSelectedSizeOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Size {selectedSize} is Out of Stock — please choose another size
          </span>
        ) : currentSizeStock <= 5 ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Hurry! Only {currentSizeStock} left in size {selectedSize}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            In Stock ({currentSizeStock} ready to dispatch in size {selectedSize})
          </span>
        )}
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-800">
            Select Size:{' '}
            <span className="text-stone-950 font-bold">{selectedSize}</span>
          </label>
          <span className="text-xs text-stone-500">Standard Indian Fit</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const sizeQty = getStockForSize(size);
            const isSizeSoldOut = isOverallOutOfStock || sizeQty <= 0;

            return (
              <button
                key={size}
                type="button"
                disabled={isSizeSoldOut}
                onClick={() => {
                  if (isSizeSoldOut) return;
                  setSelectedSize(size);
                  setErrorMessage(null);
                  const nextMax = Math.max(1, Math.min(sizeQty, 10));
                  if (quantity > nextMax) {
                    setQuantity(nextMax);
                  }
                }}
                className={`relative min-w-[3.75rem] min-h-[2.85rem] px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all border flex flex-col items-center justify-center leading-tight ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-2 ring-stone-900/10'
                    : isSizeSoldOut
                    ? 'bg-stone-100/80 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-stone-900'
                }`}
              >
                <span>{size}</span>
                {sizeQty > 0 && sizeQty <= 5 && (
                  <span
                    className={`text-[9.5px] font-medium leading-none tracking-tight ${
                      isSelected ? 'text-amber-300' : 'text-amber-600'
                    }`}
                  >
                    {sizeQty} left
                  </span>
                )}
                {isSizeSoldOut && (
                  <span className="text-[9px] font-normal leading-none text-stone-400 no-underline">
                    Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800 mb-2.5">
          Quantity
        </label>
        <div className="inline-flex items-center rounded-xl border border-stone-300 bg-white">
          <button
            type="button"
            disabled={isSelectedSizeOutOfStock || quantity <= 1}
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label="Decrease quantity"
            className="w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-l-xl disabled:opacity-40 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold tabular-nums text-stone-900">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isSelectedSizeOutOfStock || quantity >= maxAllowedQty}
            onClick={() => handleQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
            className="w-11 h-11 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-r-xl disabled:opacity-40 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          disabled={isSelectedSizeOutOfStock}
          onClick={handleAddToCart}
          className={`h-13 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
            addedFeedback
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800 active:scale-[0.99]'
          } disabled:bg-stone-200 disabled:text-stone-500 disabled:border-stone-200 disabled:cursor-not-allowed`}
        >
          {addedFeedback ? (
            <>
              <Check className="w-4 h-4" />
              Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              {isSelectedSizeOutOfStock ? 'Sold Out' : 'Add to Bag'}
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isSelectedSizeOutOfStock}
          onClick={handleBuyNow}
          className="h-13 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-amber-600/15 text-amber-950 border border-amber-700/30 hover:bg-amber-600/25 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>

      {/* Reassurance / Trust Highlights */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center">
        <div className="p-2.5 rounded-xl bg-stone-50 space-y-1">
          <Truck className="w-4 h-4 mx-auto text-stone-700" />
          <p className="text-[11px] font-medium text-stone-700">24–48hr Dispatch</p>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-50 space-y-1">
          <RefreshCw className="w-4 h-4 mx-auto text-stone-700" />
          <p className="text-[11px] font-medium text-stone-700">7-Day Size Exchange</p>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-50 space-y-1">
          <ShieldCheck className="w-4 h-4 mx-auto text-stone-700" />
          <p className="text-[11px] font-medium text-stone-700">Quality Checked</p>
        </div>
      </div>
    </div>
  );
}
