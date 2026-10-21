# Vastra Studio — Production Clothing E-Commerce Platform (Phase 1)

A mobile-first clothing e-commerce storefront and retailer admin portal built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**, engineered specifically for daily warehouse collection drops and future **Google Drive → Amazon S3 → Supabase** synchronization.

---

## Project Location & Isolation

This project lives in its own standalone folder (`./clothing-store/`) with its own `package.json`, `tsconfig.json`, and dependencies, completely isolated from the `CodeRush` app in the parent directory.

---

## Quick Start

```bash
cd clothing-store
npm install
npm run dev
```

- **Customer Storefront**: `http://localhost:3000`
- **Product Catalog**: `http://localhost:3000/shop`
- **Shopping Bag**: `http://localhost:3000/cart`
- **Protected Admin Portal**: `http://localhost:3000/admin` (Default local passcode: `vastra2026`)

---

## Database Migrations & Seed Data

All PostgreSQL schema definitions, indexes, triggers, and Row Level Security (RLS) policies are located in:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/seed.sql`

When running locally prior to connecting your live Supabase project in `.env.local`, the service layer automatically uses the local seed store (`src/database/seed-data.ts` + `src/database/local-store.ts`) so you can immediately browse products, filter categories, add sizes to the cart, and create/edit products or stock from `/admin`.
