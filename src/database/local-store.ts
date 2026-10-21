// ============================================================================
// Local Demo Store Fallback: src/database/local-store.ts
// When Supabase credentials are not yet configured in `.env.local`, this module
// provides a persistent file-backed catalog initialized from `seed-data.ts`
// so both Storefront and Admin CRUD (Create, Edit, Activate/Deactivate, Stock)
// work end-to-end immediately during local development.
// ============================================================================

import fs from 'fs/promises';
import path from 'path';
import { SEED_CATEGORIES, SEED_COLLECTIONS, SEED_PRODUCTS } from './seed-data';
import type { Category, Collection, Product } from '@/types/domain';

interface LocalCatalogSnapshot {
  categories: Category[];
  collections: Collection[];
  products: Product[];
}

const SNAPSHOT_FILE = path.join(process.cwd(), '.local-catalog-state.json');

let memoryCache: LocalCatalogSnapshot | null = null;

function hydrateRelations(snapshot: LocalCatalogSnapshot): Product[] {
  const catMap = new Map(snapshot.categories.map((c) => [c.id, c]));
  const colMap = new Map(snapshot.collections.map((c) => [c.id, c]));

  return snapshot.products.map((p) => ({
    ...p,
    category: p.category_id ? catMap.get(p.category_id) ?? null : null,
    collection: p.collection_id ? colMap.get(p.collection_id) ?? null : null,
    images: [...p.images].sort((a, b) => a.display_order - b.display_order),
  }));
}

export async function readLocalCatalog(): Promise<LocalCatalogSnapshot> {
  if (memoryCache) {
    return {
      categories: memoryCache.categories,
      collections: memoryCache.collections,
      products: hydrateRelations(memoryCache),
    };
  }

  try {
    const raw = await fs.readFile(SNAPSHOT_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as LocalCatalogSnapshot;
    const loaded: LocalCatalogSnapshot = {
      categories: parsed.categories ?? SEED_CATEGORIES,
      collections: parsed.collections ?? SEED_COLLECTIONS,
      products: hydrateRelations(parsed),
    };
    memoryCache = loaded;
    return loaded;
  } catch {
    const initial: LocalCatalogSnapshot = {
      categories: SEED_CATEGORIES,
      collections: SEED_COLLECTIONS,
      products: hydrateRelations({
        categories: SEED_CATEGORIES,
        collections: SEED_COLLECTIONS,
        products: SEED_PRODUCTS,
      }),
    };
    memoryCache = initial;
    return initial;
  }
}

export async function writeLocalCatalog(snapshot: LocalCatalogSnapshot): Promise<void> {
  memoryCache = {
    categories: snapshot.categories,
    collections: snapshot.collections,
    products: hydrateRelations(snapshot),
  };
  try {
    await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only serverless environments
  }
}
