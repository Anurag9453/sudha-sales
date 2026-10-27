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
  parseSizesAndStock,
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
import {
  computeRazorpaySignature,
  createRazorpayOrderSession,
  verifyRazorpayPaymentSignature,
} from '../services/razorpay.service';
import { createPersistedOrder } from '../services/order.service';

describe('Domain Formatting & Google Drive CSV Helpers', () => {
  it('parses pipe-separated sizes from CSV format (M|L|XL)', () => {
    const parsed = parseSizesInput('m|L|xl|M');
    assert.deepEqual(parsed, ['M', 'L', 'XL']);
  });

  it('parses variant-level stock counts (M:5|L:3|XL:2 or FREE SIZE:8)', () => {
    const res = parseSizesAndStock('M:5|L:3|XL:2');
    assert.deepEqual(res.sizes, ['M', 'L', 'XL']);
    assert.deepEqual(res.size_stock, { M: 5, L: 3, XL: 2 });
    assert.equal(res.totalStock, 10);
    assert.equal(res.hasGranularStock, true);

    const freeSizeRes = parseSizesAndStock('FREE SIZE:8');
    assert.deepEqual(freeSizeRes.sizes, ['FREE SIZE']);
    assert.deepEqual(freeSizeRes.size_stock, { 'FREE SIZE': 8 });
    assert.equal(freeSizeRes.totalStock, 8);
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

  it('paginates products into batches for lazy loading', async () => {
    const { getProductsPaginated } = await import('../services/catalog.service');
    const page1 = await getProductsPaginated({ page: 1, limit: 2 });
    assert.equal(page1.page, 1);
    assert.equal(page1.limit, 2);
    assert.equal(page1.products.length, 2);
    assert.ok(page1.total >= 2);
    assert.equal(page1.hasMore, true);

    const page2 = await getProductsPaginated({ page: 2, limit: 2 });
    assert.equal(page2.page, 2);
    assert.equal(page2.limit, 2);
    assert.notEqual(page1.products[0].sku, page2.products[0].sku);
  });
});

describe('Razorpay Payment Signature & Order Persistence', () => {
  it('computes HMAC-SHA256 Razorpay signature and creates order session', async () => {
    const sig = computeRazorpaySignature('order_123', 'pay_456', 'secret_key');
    assert.equal(sig.length, 64);

    const session = await createRazorpayOrderSession({
      amountInRupees: 1199,
      receipt: 'rcpt_test_1',
    });
    assert.equal(session.amountInPaise, 119900);
    assert.equal(session.currency, 'INR');

    const verified = verifyRazorpayPaymentSignature({
      razorpayOrderId: session.razorpayOrderId,
      razorpayPaymentId: 'pay_sim_1',
      razorpaySignature: `sim_sig_${session.razorpayOrderId}`,
    });
    assert.equal(verified, true);
  });

  it('persists verified order and deducts product stock by SKU', async () => {
    const order = await createPersistedOrder({
      customerName: 'Ananya Sharma',
      customerEmail: 'ananya@example.com',
      customerPhone: '+91 9876543210',
      shippingAddress: {
        full_name: 'Ananya Sharma',
        phone: '+91 9876543210',
        address_line1: 'Flat 402, Lotus Enclave',
        city: 'Jaipur',
        state: 'Rajasthan',
        postal_code: '302001',
        country: 'IN',
      },
      items: [
        {
          sku: 'SKU001',
          productId: '33333333-3333-4333-8333-333333333301',
          name: 'Floral Handblock Mulmul Cotton Kurti',
          slug: 'floral-handblock-mulmul-cotton-kurti-sku001',
          imageUrl: 'https://images.unsplash.com/photo-1',
          color: 'Indigo Blue',
          size: 'M',
          unitPrice: 1199,
          originalPrice: 1299,
          quantity: 1,
          maxStock: 14,
        },
      ],
      subtotalAmount: 1199,
      discountAmount: 100,
      shippingAmount: 99,
      totalAmount: 1298,
      paymentProvider: 'Razorpay',
      paymentReference: 'pay_test_999',
      paymentStatus: 'PAID',
    });

    assert.ok(order.order_number.startsWith('ORD-'));
    assert.equal(order.payment_status, 'PAID');
    assert.equal(order.total_amount, 1298);
    assert.equal(order.items?.length, 1);
  });

  it('automatically deducts both variant-level size stock and aggregate product stock on purchase', async () => {
    const { readLocalCatalog, writeLocalCatalog } = await import(
      '../database/local-store'
    );

    // Prepare a test product in local catalog
    const snapshot = await readLocalCatalog();
    let testProd = snapshot.products.find((p) => p.sku === 'SKU001');
    if (!testProd) {
      testProd = { ...snapshot.products[0], sku: 'SKU001' };
      snapshot.products.push(testProd);
    }
    testProd.stock = 10;
    testProd.sizes = ['M', 'L'];
    testProd.size_stock = { M: 4, L: 6 };
    await writeLocalCatalog(snapshot);

    // Place an order for 2 pieces of size M
    await createPersistedOrder({
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: {
        full_name: 'Aarav Sharma',
        phone: '+91 98765 43210',
        address_line1: '12 Rose Villa',
        city: 'Jaipur',
        state: 'Rajasthan',
        postal_code: '302001',
        country: 'IN',
      },
      items: [
        {
          sku: 'SKU001',
          productId: testProd.id,
          name: testProd.name,
          slug: testProd.slug,
          imageUrl: 'https://images.unsplash.com/photo-1',
          color: 'Blue',
          size: 'M',
          unitPrice: 1199,
          originalPrice: 1299,
          quantity: 2,
          maxStock: 4,
        },
      ],
      subtotalAmount: 2398,
      discountAmount: 0,
      shippingAmount: 0,
      totalAmount: 2398,
      paymentProvider: 'COD',
      paymentReference: 'COD-TEST',
      paymentStatus: 'COD',
    });

    const updatedSnapshot = await readLocalCatalog();
    const updatedProd = updatedSnapshot.products.find((p) => p.sku === 'SKU001')!;

    // Total stock should have reduced from 10 to 8
    assert.equal(updatedProd.stock, 8);
    // Size M should have reduced from 4 to 2
    assert.equal(updatedProd.size_stock['M'], 2);
    // Size L should have remained untouched at 6
    assert.equal(updatedProd.size_stock['L'], 6);
  });

  it('rejects order placement and returns validation error if requested quantity exceeds available stock', async () => {
    const { validateItemsStock } = await import('../services/order.service');
    const { readLocalCatalog, writeLocalCatalog } = await import('../database/local-store');

    const snapshot = await readLocalCatalog();
    let testProd = snapshot.products.find((p) => p.sku === 'SKU001');
    if (!testProd) {
      testProd = { ...snapshot.products[0], sku: 'SKU001' };
      snapshot.products.push(testProd);
    }
    // Set stock to 6 for size M
    testProd.stock = 6;
    testProd.sizes = ['M'];
    testProd.size_stock = { M: 6 };
    await writeLocalCatalog(snapshot);

    // Customer requests 10 of size M
    const result = await validateItemsStock([
      {
        sku: 'SKU001',
        productId: testProd.id,
        name: testProd.name,
        slug: testProd.slug,
        imageUrl: 'https://images.unsplash.com/photo-1',
        color: 'Blue',
        size: 'M',
        unitPrice: 1199,
        originalPrice: 1299,
        quantity: 10,
        maxStock: 6,
      },
    ]);

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].availableQty, 6);
    assert.equal(result.errors[0].requestedQty, 10);
    assert.ok(result.errors[0].message.includes('Only 6 piece(s) available in Size M'));

    // Attempting to create order should reject
    await assert.rejects(
      async () => {
        await createPersistedOrder({
          customerName: 'Test Overstock Buyer',
          customerEmail: 'test@example.com',
          customerPhone: '+91 99999 88888',
          shippingAddress: {
            full_name: 'Test Buyer',
            phone: '+91 99999 88888',
            address_line1: '12 Test St',
            city: 'Jaipur',
            state: 'Rajasthan',
            postal_code: '302001',
            country: 'IN',
          },
          items: [
            {
              sku: 'SKU001',
              productId: testProd.id,
              name: testProd.name,
              slug: testProd.slug,
              imageUrl: 'https://images.unsplash.com/photo-1',
              color: 'Blue',
              size: 'M',
              unitPrice: 1199,
              originalPrice: 1299,
              quantity: 10,
              maxStock: 6,
            },
          ],
          subtotalAmount: 11990,
          discountAmount: 0,
          shippingAmount: 0,
          totalAmount: 11990,
          paymentProvider: 'COD',
          paymentReference: 'COD-FAIL',
          paymentStatus: 'COD',
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes('Only 6 piece(s) available in Size M'));
        return true;
      }
    );
  });
});

describe('Customer Reviews & Average Rating Calculation', () => {
  it('starts with 0 reviews (null average rating) and updates average rating when customers leave reviews', async () => {
    const { computeReviewStats, addProductReviewBySku } = await import(
      '../services/review.service'
    );
    const { readLocalCatalog, writeLocalCatalog } = await import(
      '../database/local-store'
    );

    // Ensure SKU002 starts clean with 0 reviews before testing
    const snapshot = await readLocalCatalog();
    const target = snapshot.products.find((p) => p.sku === 'SKU002');
    if (target) {
      target.reviews = [];
      target.review_count = 0;
      target.average_rating = null;
      target.size_stock = {};
      await writeLocalCatalog(snapshot);
    }

    const initialStats = computeReviewStats([]);
    assert.equal(initialStats.review_count, 0);
    assert.equal(initialStats.average_rating, null);

    const firstResult = await addProductReviewBySku({
      sku: 'SKU002',
      customerName: 'Priya Verma',
      rating: 5,
      title: 'Beautiful Linen Fabric',
      comment: 'Loved the fit and breathable fabric quality!',
      selectedSize: 'M',
    });

    assert.equal(firstResult.review_count, 1);
    assert.equal(firstResult.average_rating, 5);

    const secondResult = await addProductReviewBySku({
      sku: 'SKU002',
      customerName: 'Meera Nair',
      rating: 4,
      comment: 'Very elegant shade and comfortable for all-day wear.',
      selectedSize: 'L',
    });

    assert.equal(secondResult.review_count, 2);
    assert.equal(secondResult.average_rating, 4.5);

    // Clean up test reviews so initial catalog state remains at 0 reviews
    if (target) {
      target.reviews = [];
      target.review_count = 0;
      target.average_rating = null;
      target.size_stock = {};
      await writeLocalCatalog(snapshot);
    }
  });
});

describe('Central Application Constants Class', () => {
  it('exposes well-defined store, shipping, and inventory constants without magic strings', async () => {
    const { AppConstants } = await import('../constants/app.constants');

    assert.equal(AppConstants.Store.NAME, 'Sudha Sales');
    assert.equal(AppConstants.Store.DEFAULT_CURRENCY, 'INR');
    assert.equal(AppConstants.Store.DEFAULT_COUNTRY, 'IN');

    assert.equal(AppConstants.Shipping.FREE_SHIPPING_THRESHOLD, 1499);
    assert.equal(AppConstants.Shipping.STANDARD_FEE, 99);
    assert.equal(AppConstants.Shipping.DEFAULT_CARRIER, 'Delhivery Express');

    assert.equal(AppConstants.Inventory.LOW_STOCK_THRESHOLD, 10);
    assert.equal(AppConstants.Inventory.DEFAULT_PAGE_SIZE, 8);
    assert.equal(AppConstants.Inventory.MAX_LINE_QUANTITY, 10);

    assert.equal(AppConstants.OrderStatus.CONFIRMED, 'CONFIRMED');
    assert.equal(AppConstants.PaymentStatus.PAID, 'PAID');
    assert.equal(AppConstants.PaymentStatus.COD, 'COD');
  });
});
