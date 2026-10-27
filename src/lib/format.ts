// ============================================================================
// Formatting & Domain Helpers: src/lib/format.ts
// ============================================================================

import { AppConstants } from '@/constants/app.constants';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: AppConstants.Store.DEFAULT_CURRENCY,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return inrFormatter.format(amount);
}

export function getEffectivePrice(price: number, salePrice: number | null): number {
  if (salePrice !== null && salePrice > 0 && salePrice < price) {
    return salePrice;
  }
  return price;
}

export function getDiscountPercentage(price: number, salePrice: number | null): number | null {
  if (salePrice === null || salePrice <= 0 || salePrice >= price) {
    return null;
  }
  return Math.round(((price - salePrice) / price) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses pipe-separated or comma-separated sizes.
 * Supports both plain formats ("M|L|XL", "M, L, XL") and
 * count-weighted formats ("M:5|L:3|XL:2", "M=5|L=3", "M(5)|L(3)").
 */
export function parseSizesInput(raw: string | string[]): string[] {
  const { sizes } = parseSizesAndStock(raw);
  return sizes;
}

export interface ParsedSizeStockResult {
  sizes: string[];
  size_stock: Record<string, number>;
  totalStock: number;
  hasGranularStock: boolean;
}

/**
 * Parses size definitions and optional per-size stock counts.
 * Examples:
 * - "M:5|L:3|XL:2" -> sizes: ['M','L','XL'], size_stock: {M:5, L:3, XL:2}, total: 10
 * - "Free Size: 8" -> sizes: ['FREE SIZE'], size_stock: {'FREE SIZE': 8}, total: 8
 * - "M|L|XL" with fallback 15 -> sizes: ['M','L','XL'], size_stock: {M:15, L:15, XL:15}, total: 15
 */
export function parseSizesAndStock(
  raw: string | string[],
  fallbackStock: number = 0
): ParsedSizeStockResult {
  const items = Array.isArray(raw) ? raw : String(raw || '').split(/[|,]/);
  const seen = new Set<string>();
  const sizes: string[] = [];
  const size_stock: Record<string, number> = {};
  let totalStock = 0;
  let hasGranularStock = false;

  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    // Matches: "M:5", "M=5", "M(5)", "Free Size: 10"
    const match = trimmed.match(/^([A-Za-z0-9\s-]+)(?:[:=]|\s*\()\s*(\d+)\)?$/);
    if (match) {
      hasGranularStock = true;
      const sizeName = match[1].trim().toUpperCase();
      const count = parseInt(match[2], 10) || 0;
      if (!seen.has(sizeName)) {
        seen.add(sizeName);
        sizes.push(sizeName);
      }
      size_stock[sizeName] = count;
      totalStock += count;
    } else {
      const clean = trimmed.toUpperCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        sizes.push(clean);
      }
    }
  }

  // If no granular counts were explicitly supplied in the string,
  // initialize each size's variant pool up to the aggregate stock.
  if (!hasGranularStock) {
    totalStock = fallbackStock;
    for (const s of sizes) {
      size_stock[s] = fallbackStock;
    }
  }

  return { sizes, size_stock, totalStock, hasGranularStock };
}
