// ============================================================================
// Unit Tests: src/__tests__/catalog-and-validation.test.ts
// Verifies SKU validation, Google Drive CSV parsing (`products.csv`),
// image ordering convention (`front.jpg` -> `model.jpg` -> `back.jpg`),
// S3 key generation, and end-to-end Google Drive -> S3 -> Database sync.
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  getDiscountPercentage,
  getEffectivePrice,
  parseSizesInput,
} from '../lib/format';
import {
  upsertProductSchema,
  updateStockSchema,
} from '../validation/product.schema';
import { buildStandardS3Key } from '../services/storage.service';
import { applyInMemoryCatalogFilters } from '../services/catalog.service';
import { SEED_PRODUCTS } from '../database/seed-data';
import { parseProductsCsv } from '../lib/csv-parser';
import { sortDriveImagesByConvention } from '../services/google-drive.service';
import { runGoogleDriveToS3Sync } from '../services/gdrive-s3-sync.service';

describe('Domain Formatting & Google Drive CSV Helpers', () => {
  it('parses pipe-separated sizes from CSV format (M|L|XL)', () => {
    const parsed = parseSizesInput('m|L|xl|M');
    assert.deepEqual(parsed, ['M', 'L', 'XL']);
  });

  it('computes effective price and discount percentage accurately', () => {
    assert.equal(getEffectivePrice(1299, 1199), 1199);
    assert.equal(getEffectivePrice(1299, null), 1299);
    assert.equal(getDiscountPercentage(2000, 1500), 25);
    assert.equal(getDiscountPercentage(1299, null), null);
    assert.ok(formatPrice(1299).includes('1,299'));
  });

  it('builds standardized S3 keys matching Google Drive SKU folder structure', () => {
    assert.equal(buildStandardS3Key('sku001', 'front.jpg'), 'SKU001/front.jpg');
  });
});

describe('Google Drive products.csv Parser & Image Convention', () => {
  it('parses valid CSV rows and captures row-level validation errors', () => {
    const sampleCsv = [
      'SKU,Product_Name,Category,Collection,Description,Price,Sale_Price,Stock,Size,Color,Status',
      'SKU001,Floral Cotton Kurti,Kurti,New Collection,"Beautiful floral cotton kurti, pure mulmul",1299,1199,10,M|L|XL,Blue,ACTIVE',
      'SKU_BAD,Broken Price Item,Kurti,New Collection,Invalid sale price higher than MRP,1000,1500,5,M|L,Red,ACTIVE',
    ].join('\n');

    const { validRows, errors } = parseProductsCsv(sampleCsv);
    assert.equal(validRows.length, 1);
    assert.equal(validRows[0].sku, 'SKU001');
    assert.equal(validRows[0].price, 1299);
    assert.equal(validRows[0].salePrice, 1199);
    assert.deepEqual(validRows[0].sizes, ['M', 'L', 'XL']);
    assert.equal(
      validRows[0].description,
      'Beautiful floral cotton kurti, pure mulmul'
    );

    assert.equal(errors.length, 1);
    assert.equal(errors[0].rowNumber, 3);
    assert.equal(errors[0].sku, 'SKU_BAD');
  });

  it('sorts SKU folder images so front.jpg is primary (0), model.jpg is (1), and back.jpg is (2)', () => {
    const unsorted = [
      { id: '3', name: 'back.jpg', mimeType: 'image/jpeg' },
      { id: '1', name: 'front.jpg', mimeType: 'image/jpeg' },
      { id: '2', name: 'model.jpg', mimeType: 'image/jpeg' },
    ];
    const sorted = sortDriveImagesByConvention(unsorted);
    assert.deepEqual(
      sorted.map((i) => i.name),
      ['front.jpg', 'model.jpg', 'back.jpg']
    );
  });

  it('executes end-to-end Google Drive CSV -> S3 Key -> Catalog upsert sync', async () => {
    const csvPayload = [
      'SKU,Product_Name,Category,Collection,Description,Price,Sale_Price,Stock,Size,Color,Status',
      'SKU011,Royal Peacock Banarasi Brocade Kurta Set,Festive Suit Sets,New Collection,Banarasi brocade kurta set,3899,3299,12,M|L|XL|XXL,Emerald Peacock,ACTIVE',
    ].join('\n');

    const report = await runGoogleDriveToS3Sync({ customCsvText: csvPayload });
    assert.equal(report.syncedCount, 1);
    assert.equal(report.errorCount, 0);
    assert.equal(report.syncedProducts[0].sku, 'SKU011');
    assert.deepEqual(report.syncedProducts[0].s3Keys, [
      'SKU011/front.jpg',
      'SKU011/model.jpg',
      'SKU011/back.jpg',
    ]);
  });
});

describe('Product & Inventory Input Validation', () => {
  it('validates a complete product matching CSV structure', () => {
    const valid = upsertProductSchema.parse({
      sku: 'sku001',
      name: 'Floral Cotton Kurti',
      description: 'Beautiful floral cotton kurti',
      category_id: '11111111-1111-4111-8111-111111111101',
      collection_id: '22222222-2222-4222-8222-222222222201',
      price: '1299',
      sale_price: '1199',
      stock: '10',
      sizes: 'M|L|XL',
      color: 'Blue',
      status: 'ACTIVE',
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
          s3_key: 'SKU001/front.jpg',
        },
      ],
    });

    assert.equal(valid.sku, 'SKU001');
    assert.deepEqual(valid.sizes, ['M', 'L', 'XL']);
    assert.equal(valid.price, 1299);
    assert.equal(valid.sale_price, 1199);
    assert.equal(valid.stock, 10);
  });

  it('rejects sale_price greater than regular price', () => {
    assert.throws(() => {
      upsertProductSchema.parse({
        sku: 'SKU099',
        name: 'Invalid Sale Product',
        description: 'Test',
        category_id: 'cat-1',
        price: 1000,
        sale_price: 1200,
        stock: 5,
        sizes: ['M'],
        color: 'Red',
        status: 'ACTIVE',
        images: [{ image_url: 'https://images.unsplash.com/photo-1' }],
      });
    });
  });

  it('validates stock updates', () => {
    const res = updateStockSchema.parse({ sku: 'sku002', stock: '25' });
    assert.equal(res.sku, 'SKU002');
    assert.equal(res.stock, 25);
  });
});

describe('Catalog Filtering Service', () => {
  it('filters active products by search query and size', () => {
    const result = applyInMemoryCatalogFilters(SEED_PRODUCTS, {
      search: 'SKU001',
      size: 'M',
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].sku, 'SKU001');
  });
});
