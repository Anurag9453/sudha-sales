// ============================================================================
// CSV Parser & Validator: src/lib/csv-parser.ts
// Parses Google Drive `products.csv` matching the exact retailer specification:
// SKU,Product_Name,Category,Collection,Description,Price,Sale_Price,Stock,Size,Color,Status
// Example:
// SKU001,Floral Cotton Kurti,Kurti,New Collection,Beautiful floral cotton kurti,1299,1199,10,M|L|XL,Blue,ACTIVE
// ============================================================================

import { z } from 'zod';
import { parseSizesInput, parseSizesAndStock } from './format';
import { skuSchema, productStatusSchema } from '@/validation/product.schema';
import type { ProductStatus } from '@/types/domain';

export interface ParsedCsvProductRow {
  rowNumber: number;
  sku: string;
  name: string;
  categoryName: string;
  collectionName: string | null;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sizes: string[];
  size_stock: Record<string, number>;
  color: string;
  status: ProductStatus;
}

export interface CsvParseError {
  rowNumber: number;
  sku?: string;
  message: string;
}

export interface CsvParseResult {
  validRows: ParsedCsvProductRow[];
  errors: CsvParseError[];
}

/**
 * Splits a single CSV line into fields, properly handling double-quoted fields
 * that contain commas or escaped quotes (`""`).
 */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result;
}

const rawCsvRowSchema = z
  .object({
    SKU: skuSchema,
    Product_Name: z.string().trim().min(2, 'Product_Name is required'),
    Category: z.string().trim().min(1, 'Category is required'),
    Collection: z.string().trim().optional().default(''),
    Description: z.string().trim().optional().default(''),
    Price: z.coerce.number().positive('Price must be greater than 0'),
    Sale_Price: z
      .union([z.string(), z.number(), z.undefined(), z.null()])
      .transform((val) => {
        if (val === undefined || val === null || String(val).trim() === '') {
          return null;
        }
        const n = Number(val);
        return Number.isNaN(n) || n <= 0 ? null : n;
      }),
    Stock: z.coerce.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
    Size: z
      .string()
      .transform((val) => parseSizesInput(val))
      .refine((arr) => arr.length > 0, 'At least one size is required (e.g. M|L|XL)'),
    Color: z.string().trim().min(1, 'Color is required'),
    Status: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .default('ACTIVE')
      .pipe(productStatusSchema),
  })
  .refine(
    (row) => row.Sale_Price === null || row.Sale_Price <= row.Price,
    {
      message: 'Sale_Price cannot be higher than regular Price',
      path: ['Sale_Price'],
    }
  );

const EXPECTED_HEADERS = [
  'SKU',
  'Product_Name',
  'Category',
  'Collection',
  'Description',
  'Price',
  'Sale_Price',
  'Stock',
  'Size',
  'Color',
  'Status',
] as const;

/**
 * Parses a full `products.csv` text payload into validated rows and row-level errors.
 */
export function parseProductsCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, message: 'CSV file is empty' }],
    };
  }

  // Check if line 1 is a header row or data row
  const firstRowCols = splitCsvLine(lines[0]);
  const hasHeader =
    firstRowCols[0]?.toUpperCase() === 'SKU' ||
    firstRowCols[1]?.toLowerCase() === 'product_name';

  const headerMap = new Map<string, number>();
  if (hasHeader) {
    firstRowCols.forEach((col, index) => {
      headerMap.set(col.trim().toLowerCase(), index);
    });
  } else {
    EXPECTED_HEADERS.forEach((col, index) => {
      headerMap.set(col.toLowerCase(), index);
    });
  }

  const startIndex = hasHeader ? 1 : 0;
  const validRows: ParsedCsvProductRow[] = [];
  const errors: CsvParseError[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rowNumber = i + 1;
    const cols = splitCsvLine(lines[i]);

    const getCol = (name: string, fallbackIndex: number): string => {
      const idx = headerMap.get(name.toLowerCase()) ?? fallbackIndex;
      return cols[idx] ?? '';
    };

    const rawCandidate = {
      SKU: getCol('SKU', 0),
      Product_Name: getCol('Product_Name', 1),
      Category: getCol('Category', 2),
      Collection: getCol('Collection', 3),
      Description: getCol('Description', 4),
      Price: getCol('Price', 5),
      Sale_Price: getCol('Sale_Price', 6),
      Stock: getCol('Stock', 7),
      Size: getCol('Size', 8),
      Color: getCol('Color', 9),
      Status: getCol('Status', 10) || 'ACTIVE',
    };

    const parsed = rawCsvRowSchema.safeParse(rawCandidate);
    if (!parsed.success) {
      const issueMsg = parsed.error.issues
        .map((iss) => `${iss.path.join('.') || 'row'}: ${iss.message}`)
        .join('; ');
      errors.push({
        rowNumber,
        sku: rawCandidate.SKU || undefined,
        message: issueMsg,
      });
      continue;
    }

    const data = parsed.data;
    const sizeStockInfo = parseSizesAndStock(rawCandidate.Size, data.Stock);
    const resolvedStock = sizeStockInfo.hasGranularStock
      ? sizeStockInfo.totalStock
      : data.Stock;

    validRows.push({
      rowNumber,
      sku: data.SKU,
      name: data.Product_Name,
      categoryName: data.Category,
      collectionName: data.Collection ? data.Collection : null,
      description: data.Description,
      price: data.Price,
      salePrice: data.Sale_Price,
      stock: resolvedStock,
      sizes: sizeStockInfo.sizes.length > 0 ? sizeStockInfo.sizes : data.Size,
      size_stock: sizeStockInfo.size_stock,
      color: data.Color,
      status: data.Status,
    });
  }

  return { validRows, errors };
}
