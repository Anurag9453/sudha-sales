// ============================================================================
// Customer Reviews & Ratings Component: src/components/product/ProductReviewsSection.tsx
// - When a product has 0 reviews (`reviewCount === 0`), no fake reviews or
//   ratings are shown — only an invitation for a customer to leave the first review.
// - As soon as a customer submits a review & star rating, it is persisted to
//   the product record in Supabase and displayed with the computed average
//   rating, 5-star breakdown bars, and verified customer comments.
// ============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  MessageSquarePlus,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCustomerAuth } from '@/store/customer-auth-context';
import type { Product, ProductReview } from '@/types/domain';

interface ProductReviewsSectionProps {
  product: Product;
}

export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const router = useRouter();
  const { customer, isAuthenticated, isHydrated } = useCustomerAuth();

  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews ?? []);
  const [averageRating, setAverageRating] = useState<number | null>(
    product.average_rating ?? null
  );
  const [reviewCount, setReviewCount] = useState<number>(
    product.review_count ?? 0
  );

  // Review Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] ?? ''
  );
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !customer) {
      router.push(`/login?next=/product/${product.sku}`);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: product.sku,
          customerName: customer.name,
          customerEmail: customer.email,
          rating,
          title,
          comment,
          selectedSize,
        }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        reviews?: ProductReview[];
        average_rating?: number | null;
        review_count?: number;
      };

      if (!data.ok) {
        throw new Error(data.error || 'Could not submit review');
      }

      setReviews(data.reviews ?? []);
      setAverageRating(data.average_rating ?? null);
      setReviewCount(data.review_count ?? 0);
      setTitle('');
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      setSuccessMsg('Thank you! Your review has been published on this product.');
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to submit review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute star distribution (5★ down to 1★) when reviews exist
  const starDistribution = [5, 4, 3, 2, 1].map((starValue) => {
    const count = reviews.filter((r) => Math.round(r.rating) === starValue).length;
    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
    return { starValue, count, pct };
  });

  return (
    <section
      id="customer-reviews"
      className="mt-16 sm:mt-20 pt-12 border-t border-stone-200 space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Shopper Feedback
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1">
            Customer Reviews &amp; Ratings
          </h2>
        </div>

        {isHydrated && isAuthenticated ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-300" />
            <span>{isFormOpen ? 'Close Review Form' : 'Write a Review'}</span>
          </button>
        ) : (
          <Link
            href={`/login?next=/product/${product.sku}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold transition-colors self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5 text-stone-600" />
            <span>Sign In to Write a Review</span>
          </Link>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Write a Review Form */}
      {isFormOpen && isAuthenticated && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-stone-900 shadow-lg space-y-5"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-stone-950">
                Share Your Experience with {product.name}
              </h3>
              <p className="text-xs text-stone-500">
                Posting publicly as <strong>{customer?.name}</strong>
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Interactive 1-5 Star Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Your Overall Rating *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-transform ${
                          active
                            ? 'fill-amber-400 text-amber-500 scale-105'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-bold text-stone-800">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Size Purchased / Worn */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Size Purchased (Optional)
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
              >
                {product.sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    Size: {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pure fabric quality & gorgeous Bandhej colour!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Your Review / Comment *
            </label>
            <textarea
              required
              rows={3}
              maxLength={1200}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other shoppers about the fabric feel, Zari/Bandhej work, colour accuracy, and fit..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing Review...' : 'Post Customer Review'}
            </button>
          </div>
        </form>
      )}

      {/* Conditional Rendering:
          - If reviewCount === 0: Do NOT show any fake reviews or rating numbers.
          - If reviewCount > 0: Show Average Rating Summary + Verified Customer Comments. */}
      {reviewCount > 0 && averageRating !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Overall Average Rating & Star Distribution */}
          <div className="lg:col-span-4">
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-5">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl font-serif font-bold text-stone-950">
                  {averageRating.toFixed(1)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-stone-600">
                    Based on <strong>{reviewCount}</strong>{' '}
                    {reviewCount === 1 ? 'customer review' : 'customer reviews'}
                  </p>
                </div>
              </div>

              {/* 5-Star to 1-Star Breakdown Bars */}
              <div className="space-y-2 pt-3 border-t border-stone-100">
                {starDistribution.map(({ starValue, count, pct }) => (
                  <div
                    key={starValue}
                    className="flex items-center gap-2.5 text-xs"
                  >
                    <span className="w-8 font-semibold text-stone-700 flex items-center gap-0.5">
                      {starValue}
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-stone-500 tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Reviews & Comments List */}
          <div className="lg:col-span-8 space-y-4">
            {reviews.map((rev) => {
              const initial = rev.customer_name.charAt(0).toUpperCase();
              return (
                <article
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-300 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-950">
                            {rev.customer_name}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Verified Reviewer
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.selected_size && (
                            <span className="text-[11px] text-stone-500">
                              • Size: <strong>{rev.selected_size}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <time className="text-[11px] text-stone-400">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {rev.title && (
                    <h4 className="text-sm font-bold text-stone-900 pt-1">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        !isFormOpen && (
          <div className="p-8 sm:p-10 rounded-3xl bg-stone-100/70 border border-stone-200/80 text-center max-w-xl mx-auto space-y-3">
            <p className="text-sm font-semibold text-stone-800">
              No reviews yet for this piece
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              Purchased or tried <strong>{product.name}</strong>? Be the first
              customer to share a review and help other shoppers!
            </p>
          </div>
        )
      )}
    </section>
  );
}
