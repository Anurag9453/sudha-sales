// ============================================================================
// Validation Schemas: src/validation/product.schema.ts
// Validates admin inputs, stock updates, and future Google Drive CSV rows.
// ============================================================================

import { z } from 'zod';
import { parseSizesInput } from '@/lib/format';
import { AppConstants } from '@/constants/app.constants';

const schemaErrors = AppConstants.Api.SCHEMA_ERRORS;

export const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, schemaErrors.SKU_MIN)
  .max(64, schemaErrors.SKU_MAX)
  .regex(/^[A-Z0-9_-]+$/, schemaErrors.SKU_REGEX);

export const productStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']);

export const productImageInputSchema = z.object({
  image_url: z.string().trim().url(schemaErrors.IMG_URL_INVALID),
  s3_key: z.string().trim().optional().nullable(),
  alt_text: z.string().trim().max(255).optional().default(''),
  is_primary: z.boolean().optional().default(false),
});

export const upsertProductSchema = z
  .object({
    sku: skuSchema,
    name: z
      .string()
      .trim()
      .min(3, schemaErrors.NAME_MIN)
      .max(255, schemaErrors.NAME_MAX),
    description: z.string().trim().max(5000).default(''),
    category_id: z.string().trim().min(1, schemaErrors.CATEGORY_REQUIRED),
    collection_id: z.string().trim().optional().nullable(),
    price: z.coerce
      .number()
      .positive(schemaErrors.PRICE_POSITIVE)
      .max(999999, schemaErrors.PRICE_TOO_HIGH),
    sale_price: z
      .union([z.coerce.number().positive(), z.literal(''), z.null(), z.undefined()])
      .transform((val) => (val === '' || val === undefined ? null : val)),
    stock: z.coerce
      .number()
      .int(schemaErrors.STOCK_INTEGER)
      .min(0, schemaErrors.STOCK_NEGATIVE)
      .max(AppConstants.Inventory.MAX_STOCK_LIMIT),
    sizes: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => parseSizesInput(val))
      .refine((arr) => arr.length > 0, schemaErrors.SIZES_REQUIRED),
    size_stock: z.record(z.string(), z.number()).optional().default({}),
    color: z.string().trim().min(1, schemaErrors.COLOR_REQUIRED).max(64),
    vendor_code: z.string().trim().max(64).optional().nullable(),
    status: productStatusSchema.default('ACTIVE'),
    images: z
      .array(productImageInputSchema)
      .min(1, schemaErrors.IMG_REQUIRED),
  })
  .refine(
    (data) => data.sale_price === null || data.sale_price <= data.price,
    {
      message: schemaErrors.SALE_PRICE_INVALID,
      path: ['sale_price'],
    }
  );

export const updateStockSchema = z.object({
  sku: skuSchema,
  stock: z.coerce
    .number()
    .int()
    .min(0, schemaErrors.STOCK_NEGATIVE)
    .max(AppConstants.Inventory.MAX_STOCK_LIMIT),
});

export const toggleStatusSchema = z.object({
  sku: skuSchema,
  status: productStatusSchema,
});

export type UpsertProductInput = z.input<typeof upsertProductSchema>;
export type UpsertProductOutput = z.output<typeof upsertProductSchema>;
export type UpdateStockInput = z.input<typeof updateStockSchema>;
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;
