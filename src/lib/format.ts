// ============================================================================
// Formatting & Domain Helpers: src/lib/format.ts
// ============================================================================

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
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
 * Parses pipe-separated or comma-separated sizes (e.g. "M|L|XL" from Google Drive CSV)
 */
export function parseSizesInput(raw: string | string[]): string[] {
  const items = Array.isArray(raw) ? raw : raw.split(/[|,]/);
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of items) {
    const clean = item.trim().toUpperCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      normalized.push(clean);
    }
  }
  return normalized;
}
