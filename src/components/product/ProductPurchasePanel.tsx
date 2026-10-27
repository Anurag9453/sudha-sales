// ============================================================================
// Product Purchase Panel: src/components/product/ProductPurchasePanel.tsx
// Handles size selection, quantity selection, stock validation, Add to Cart,
// and instant Buy Now redirection to the Cart page.
// Bound to AppConstants.Product.PURCHASE and AppConstants.Product.ROUTES.
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
import { AppConstants } from '@/constants/app.constants';
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
    if (!product.sizes || product.sizes.length === 0)
      return AppConstants.Sizes.FREE_SIZE;
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

  const isOverallOutOfStock =
    product.stock <= 0 ||
    product.status !== AppConstants.Product.STATUS.ACTIVE;
  const currentSizeStock = getStockForSize(selectedSize);
  const isSelectedSizeOutOfStock = isOverallOutOfStock || currentSizeStock <= 0;
  const isOverQuantity = quantity > currentSizeStock;
  const cannotProceed = isSelectedSizeOutOfStock || isOverQuantity;
  const effectivePrice = getEffectivePrice(product.price, product.sale_price);

  const handleQuantityChange = (next: number) => {
    if (next < 1) return;
    if (next > currentSizeStock) {
      setErrorMessage(
        AppConstants.Product.PURCHASE.COPY.MAX_QUANTITY_REACHED(
          currentSizeStock,
          selectedSize
        )
      );
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
      AppConstants.Assets.FALLBACK_PRODUCT_IMAGE,
    color: product.color,
    size: selectedSize,
    unitPrice: effectivePrice,
    originalPrice: product.price,
    quantity,
    maxStock: currentSizeStock,
  });

  const handleAddToCart = () => {
    if (cannotProceed) return;
    if (!isAuthenticated) {
      router.push(
        AppConstants.Product.ROUTES.LOGIN_WITH_PURCHASE(product.sku)
      );
      return;
    }
    if (!selectedSize) {
      setErrorMessage(AppConstants.Product.PURCHASE.COPY.SELECT_SIZE_FIRST);
      return;
    }
    setErrorMessage(null);
    addItem(buildCartItem());
    setAddedFeedback(true);
    setTimeout(
      () => setAddedFeedback(false),
      AppConstants.Product.PURCHASE.FEEDBACK_DURATION_MS
    );
  };

  const handleBuyNow = () => {
    if (cannotProceed) return;
    if (!isAuthenticated) {
      router.push(
        AppConstants.Product.ROUTES.LOGIN_WITH_PURCHASE(product.sku)
      );
      return;
    }
    if (!selectedSize) {
      setErrorMessage(AppConstants.Product.PURCHASE.COPY.SELECT_SIZE_FIRST);
      return;
    }
    addItem(buildCartItem());
    router.push(AppConstants.Product.ROUTES.CART);
  };

  return (
    <div className={AppConstants.Product.PURCHASE.CLASSES.PANEL}>
      {/* Stock Status Indicator */}
      <div className={AppConstants.Product.PURCHASE.CLASSES.STATUS_WRAPPER}>
        {isOverallOutOfStock ? (
          <span
            className={
              AppConstants.Product.PURCHASE.CLASSES.BADGE_OUT_OF_STOCK
            }
          >
            <span className={AppConstants.Product.PURCHASE.CLASSES.DOT_ROSE} />
            {AppConstants.Product.PURCHASE.COPY.OUT_OF_STOCK}
          </span>
        ) : isSelectedSizeOutOfStock ? (
          <span
            className={
              AppConstants.Product.PURCHASE.CLASSES.BADGE_OUT_OF_STOCK
            }
          >
            <span className={AppConstants.Product.PURCHASE.CLASSES.DOT_ROSE} />
            {AppConstants.Product.PURCHASE.COPY.SIZE_OUT_OF_STOCK(selectedSize)}
          </span>
        ) : currentSizeStock < AppConstants.Inventory.LOW_STOCK_THRESHOLD ? (
          <span
            className={AppConstants.Product.PURCHASE.CLASSES.BADGE_LOW_STOCK}
          >
            <span
              className={AppConstants.Product.PURCHASE.CLASSES.DOT_AMBER_PULSE}
            />
            {AppConstants.Product.PURCHASE.COPY.ONLY_AVAILABLE(
              currentSizeStock,
              selectedSize
            )}
          </span>
        ) : (
          <span
            className={AppConstants.Product.PURCHASE.CLASSES.BADGE_IN_STOCK}
          >
            <span
              className={AppConstants.Product.PURCHASE.CLASSES.DOT_EMERALD}
            />
            {AppConstants.Product.PURCHASE.COPY.IN_STOCK_DISPATCH(
              currentSizeStock,
              selectedSize
            )}
          </span>
        )}
      </div>

      {/* Size Selector */}
      <div>
        <div className={AppConstants.Product.PURCHASE.CLASSES.SIZE_HEADER}>
          <label className={AppConstants.Product.PURCHASE.CLASSES.SIZE_LABEL}>
            {AppConstants.Product.PURCHASE.COPY.SELECT_SIZE_LABEL}
            <span
              className={
                AppConstants.Product.PURCHASE.CLASSES.SIZE_LABEL_SELECTED
              }
            >
              {selectedSize}
            </span>
          </label>
          <span className={AppConstants.Product.PURCHASE.CLASSES.FIT_SUBTITLE}>
            {AppConstants.Product.PURCHASE.FIT_TEXT}
          </span>
        </div>

        <div className={AppConstants.Product.PURCHASE.CLASSES.SIZE_GRID}>
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
                  if (quantity > sizeQty) {
                    setQuantity(Math.max(1, sizeQty));
                    setErrorMessage(
                      AppConstants.Product.PURCHASE.COPY.QUANTITY_ADJUSTED(
                        sizeQty,
                        size
                      )
                    );
                  } else {
                    setErrorMessage(null);
                  }
                }}
                className={AppConstants.Product.PURCHASE.CLASSES.SIZE_BUTTON(
                  isSelected,
                  isSizeSoldOut
                )}
              >
                <span className={AppConstants.Product.PURCHASE.CLASSES.SIZE_NAME}>
                  {size}
                </span>
                {isSizeSoldOut ? (
                  <span
                    className={
                      AppConstants.Product.PURCHASE.CLASSES.SIZE_SOLD_OUT_TAG
                    }
                  >
                    {AppConstants.Product.PURCHASE.COPY.SOLD_OUT_SMALL}
                  </span>
                ) : sizeQty < AppConstants.Inventory.LOW_STOCK_THRESHOLD ? (
                  <span
                    className={AppConstants.Product.PURCHASE.CLASSES.SIZE_LOW_TAG(
                      isSelected
                    )}
                  >
                    {AppConstants.Product.PURCHASE.COPY.LEFT_COUNT(sizeQty)}
                  </span>
                ) : (
                  <span
                    className={AppConstants.Product.PURCHASE.CLASSES.SIZE_STOCK_TAG(
                      isSelected
                    )}
                  >
                    {AppConstants.Product.PURCHASE.COPY.IN_STOCK_COUNT(sizeQty)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div>
        <div className={AppConstants.Product.PURCHASE.CLASSES.QTY_HEADER}>
          <label className={AppConstants.Product.PURCHASE.CLASSES.QTY_LABEL}>
            {AppConstants.Product.PURCHASE.COPY.QUANTITY_LABEL}
          </label>
          {currentSizeStock < AppConstants.Inventory.LOW_STOCK_THRESHOLD &&
            currentSizeStock > 0 && (
              <span
                className={
                  AppConstants.Product.PURCHASE.CLASSES.QTY_LIMIT_TEXT
                }
              >
                {AppConstants.Product.PURCHASE.COPY.STOCK_LIMIT_LABEL(
                  currentSizeStock
                )}
              </span>
            )}
        </div>
        <div className={AppConstants.Product.PURCHASE.CLASSES.QTY_SELECTOR}>
          <button
            type="button"
            disabled={isSelectedSizeOutOfStock || quantity <= 1}
            onClick={() => handleQuantityChange(quantity - 1)}
            aria-label={AppConstants.Product.PURCHASE.COPY.DECREASE_ARIA}
            className={AppConstants.Product.PURCHASE.CLASSES.QTY_DEC}
          >
            <Minus className={AppConstants.Product.PURCHASE.CLASSES.QTY_ICON} />
          </button>
          <span className={AppConstants.Product.PURCHASE.CLASSES.QTY_VALUE}>
            {quantity}
          </span>
          <button
            type="button"
            disabled={
              isSelectedSizeOutOfStock || quantity >= currentSizeStock
            }
            onClick={() => handleQuantityChange(quantity + 1)}
            aria-label={AppConstants.Product.PURCHASE.COPY.INCREASE_ARIA}
            className={AppConstants.Product.PURCHASE.CLASSES.QTY_INC}
          >
            <Plus className={AppConstants.Product.PURCHASE.CLASSES.QTY_ICON} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className={AppConstants.Product.PURCHASE.CLASSES.ERROR_BANNER}>
          <AlertCircle
            className={AppConstants.Product.PURCHASE.CLASSES.ERROR_ICON}
          />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Action CTAs */}
      <div className={AppConstants.Product.PURCHASE.CLASSES.ACTIONS_GRID}>
        <button
          type="button"
          disabled={cannotProceed}
          onClick={handleAddToCart}
          className={AppConstants.Product.PURCHASE.CLASSES.ADD_BAG_BUTTON(
            addedFeedback
          )}
        >
          {addedFeedback ? (
            <>
              <Check className={AppConstants.Product.PURCHASE.CLASSES.CHECK_ICON} />
              {AppConstants.Product.PURCHASE.COPY.ADDED_TO_BAG}
            </>
          ) : (
            <>
              <ShoppingBag
                className={AppConstants.Product.PURCHASE.CLASSES.BAG_ICON}
              />
              {isSelectedSizeOutOfStock
                ? AppConstants.Product.PURCHASE.COPY.SOLD_OUT_SMALL
                : isOverQuantity
                ? AppConstants.Product.PURCHASE.COPY.ONLY_AVAILABLE(
                    currentSizeStock,
                    selectedSize
                  )
                : AppConstants.Product.PURCHASE.COPY.ADD_TO_BAG}
            </>
          )}
        </button>

        <button
          type="button"
          disabled={cannotProceed}
          onClick={handleBuyNow}
          className={AppConstants.Product.PURCHASE.CLASSES.BUY_NOW_BUTTON}
        >
          {cannotProceed && isOverQuantity
            ? AppConstants.Product.PURCHASE.COPY.REDUCE_QTY_TO_BUY
            : AppConstants.Product.PURCHASE.COPY.BUY_NOW}
        </button>
      </div>

      {/* Reassurance / Trust Highlights */}
      <div className={AppConstants.Product.PURCHASE.CLASSES.TRUST_GRID}>
        <div className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ITEM}>
          <Truck className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ICON} />
          <p className={AppConstants.Product.PURCHASE.CLASSES.TRUST_TEXT}>
            {AppConstants.Shipping.DISPATCH_TIMELINE}
          </p>
        </div>
        <div className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ITEM}>
          <RefreshCw
            className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ICON}
          />
          <p className={AppConstants.Product.PURCHASE.CLASSES.TRUST_TEXT}>
            {AppConstants.Shipping.EXCHANGE_POLICY}
          </p>
        </div>
        <div className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ITEM}>
          <ShieldCheck
            className={AppConstants.Product.PURCHASE.CLASSES.TRUST_ICON}
          />
          <p className={AppConstants.Product.PURCHASE.CLASSES.TRUST_TEXT}>
            {AppConstants.Shipping.QUALITY_ASSURANCE}
          </p>
        </div>
      </div>
    </div>
  );
}
