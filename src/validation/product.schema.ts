// ============================================================================
// Validation Schemas: src/validation/product.schema.ts
// Validates admin inputs, stock updates, and future Google Drive CSV rows.
// ============================================================================

import { z } from 'zod';
import { parseSizesInput } from '@/lib/format';

export const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, 'SKU must be at least 3 characters (e.g. SKU001)')
  .max(64, 'SKU cannot exceed 64 characters')
  .regex(/^[A-Z0-9_-]+$/, 'SKU may only contain uppercase letters, numbers, hyphens, or underscores');

export const productStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']);

export const productImageInputSchema = z.object({
  image_url: z.string().trim().url('Must be a valid image URL'),
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
      .min(3, 'Product name must be at least 3 characters')
      .max(255, 'Product name cannot exceed 255 characters'),
    description: z.string().trim().max(5000).default(''),
    category_id: z.string().trim().min(1, 'Please select a category'),
    collection_id: z.string().trim().optional().nullable(),
    price: z.coerce
      .number()
      .positive('Regular price must be greater than 0')
      .max(999999, 'Price is too high'),
    sale_price: z
      .union([z.coerce.number().positive(), z.literal(''), z.null(), z.undefined()])
      .transform((val) => (val === '' || val === undefined ? null : val)),
    stock: z.coerce
      .number()
      .int('Stock must be a whole number')
      .min(0, 'Stock cannot be negative')
      .max(100000),
    sizes: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => parseSizesInput(val))
      .refine((arr) => arr.length > 0, 'Select or enter at least one size (e.g. S, M, L, XL)'),
    color: z.string().trim().min(1, 'Color is required').max(64),
    vendor_code: z.string().trim().max(64).optional().nullable(),
    status: productStatusSchema.default('ACTIVE'),
    images: z
      .array(productImageInputSchema)
      .min(1, 'At least one product image is required'),
  })
  .refine(
    (data) => data.sale_price === null || data.sale_price <= data.price,
    {
      message: 'Sale price must be less than or equal to regular price',
      path: ['sale_price'],
    }
  );

export const updateStockSchema = z.object({
  sku: skuSchema,
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').max(100000),
});

export const toggleStatusSchema = z.object({
  sku: skuSchema,
  status: productStatusSchema,
});

export type UpsertProductInput = z.infer<typeof upsertProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;
