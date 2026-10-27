// ============================================================================
// Paginated Products API: src/app/api/products/route.ts
// Powers infinite scroll and lazy loading for large inventories with server-side
// pagination, category/size/collection filtering, and full-text search.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getProductsPaginated } from '@/services/catalog.service';
import { AppConstants } from '@/constants/app.constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(
      searchParams.get('limit') ||
        String(AppConstants.Inventory.DEFAULT_PAGE_SIZE),
      10
    );
    const categorySlug = searchParams.get('category') || undefined;
    const collectionSlug = searchParams.get('collection') || undefined;
    const size = searchParams.get('size') || undefined;
    const sort =
      (searchParams.get('sort') as 'newest' | 'price-asc' | 'price-desc') ||
      AppConstants.Services.CATALOG.DEFAULT_SORT;
    const search = searchParams.get('q') || undefined;

    const result = await getProductsPaginated({
      page,
      limit,
      categorySlug,
      collectionSlug,
      size,
      sort,
      search,
    });

    return NextResponse.json(
      {
        ok: true,
        ...result,
      },
      {
        headers: {
          [AppConstants.Api.HEADERS.CACHE_CONTROL]:
            AppConstants.Api.HEADERS.CACHE_CONTROL_PRODUCTS,
        },
      }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : AppConstants.Api.MESSAGES.FETCH_PRODUCTS_FAILED;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
