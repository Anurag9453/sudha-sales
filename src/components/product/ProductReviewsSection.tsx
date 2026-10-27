// ============================================================================
// Customer Reviews & Ratings Component: src/components/product/ProductReviewsSection.tsx
// - When a product has 0 reviews (`reviewCount === 0`), no fake reviews or
//   ratings are shown — only an invitation for a customer to leave the first review.
// - As soon as a customer submits a review & star rating, it is persisted to
//   the product record in Supabase and displayed with the computed average
//   rating, 5-star breakdown bars, and verified customer comments.
// Bound to AppConstants.Product.REVIEWS and AppConstants.Product.ROUTES.
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
import { AppConstants } from '@/constants/app.constants';
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
  const [rating, setRating] = useState<number>(
    AppConstants.Product.REVIEWS.DEFAULT_RATING
  );
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
      router.push(AppConstants.Product.ROUTES.LOGIN_FOR_REVIEW(product.sku));
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(AppConstants.Product.API.REVIEWS, {
        method: AppConstants.Product.API.METHOD_POST,
        headers: AppConstants.Product.API.HEADERS_JSON,
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
        throw new Error(
          data.error || AppConstants.Product.REVIEWS.COPY.ERROR_SUBMIT_FAILED
        );
      }

      setReviews(data.reviews ?? []);
      setAverageRating(data.average_rating ?? null);
      setReviewCount(data.review_count ?? 0);
      setTitle('');
      setComment('');
      setRating(AppConstants.Product.REVIEWS.DEFAULT_RATING);
      setIsFormOpen(false);
      setSuccessMsg(AppConstants.Product.REVIEWS.COPY.SUCCESS_DEFAULT);
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : AppConstants.Product.REVIEWS.COPY.ERROR_UNKNOWN
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute star distribution (5★ down to 1★) when reviews exist
  const starDistribution = AppConstants.Product.REVIEWS.BREAKDOWN_STARS.map(
    (starValue) => {
      const count = reviews.filter(
        (r) => Math.round(r.rating) === starValue
      ).length;
      const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
      return { starValue, count, pct };
    }
  );

  return (
    <section
      id={AppConstants.Product.REVIEWS.SECTION_ID}
      className={AppConstants.Product.REVIEWS.CLASSES.SECTION}
    >
      {/* Section Header */}
      <div className={AppConstants.Product.REVIEWS.CLASSES.HEADER}>
        <div>
          <span className={AppConstants.Product.REVIEWS.CLASSES.TAG}>
            <Sparkles className={AppConstants.Product.REVIEWS.CLASSES.TAG_ICON} />
            {AppConstants.Product.REVIEWS.COPY.HEADER_TAG}
          </span>
          <h2 className={AppConstants.Product.REVIEWS.CLASSES.TITLE}>
            {AppConstants.Product.REVIEWS.COPY.TITLE}
          </h2>
        </div>

        {isHydrated && isAuthenticated ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={AppConstants.Product.REVIEWS.CLASSES.FORM_TOGGLE}
          >
            <MessageSquarePlus
              className={
                AppConstants.Product.REVIEWS.CLASSES.FORM_TOGGLE_ICON
              }
            />
            <span>
              {isFormOpen
                ? AppConstants.Product.REVIEWS.COPY.CLOSE_FORM
                : AppConstants.Product.REVIEWS.COPY.WRITE_REVIEW}
            </span>
          </button>
        ) : (
          <Link
            href={AppConstants.Product.ROUTES.LOGIN_FOR_REVIEW(product.sku)}
            className={AppConstants.Product.REVIEWS.CLASSES.SIGN_IN_LINK}
          >
            <Lock className={AppConstants.Product.REVIEWS.CLASSES.LOCK_ICON} />
            <span>{AppConstants.Product.REVIEWS.COPY.SIGN_IN_PROMPT}</span>
          </Link>
        )}
      </div>

      {successMsg && (
        <div className={AppConstants.Product.REVIEWS.CLASSES.SUCCESS_BANNER}>
          <CheckCircle2
            className={AppConstants.Product.REVIEWS.CLASSES.SUCCESS_ICON}
          />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Write a Review Form */}
      {isFormOpen && isAuthenticated && (
        <form
          onSubmit={handleSubmitReview}
          className={AppConstants.Product.REVIEWS.CLASSES.FORM}
        >
          <div className={AppConstants.Product.REVIEWS.CLASSES.FORM_HEADER}>
            <div>
              <h3 className={AppConstants.Product.REVIEWS.CLASSES.FORM_TITLE}>
                {AppConstants.Product.REVIEWS.COPY.FORM_TITLE(product.name)}
              </h3>
              <p className={AppConstants.Product.REVIEWS.CLASSES.FORM_SUBTITLE}>
                {AppConstants.Product.REVIEWS.COPY.POSTING_AS}
                <strong>{customer?.name}</strong>
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className={AppConstants.Product.REVIEWS.CLASSES.ERROR_BANNER}>
              <AlertCircle
                className={AppConstants.Product.REVIEWS.CLASSES.ERROR_ICON}
              />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className={AppConstants.Product.REVIEWS.CLASSES.FORM_GRID}>
            {/* Interactive 1-5 Star Selector */}
            <div>
              <label className={AppConstants.Product.REVIEWS.CLASSES.LABEL}>
                {AppConstants.Product.REVIEWS.COPY.LABEL_RATING}
              </label>
              <div className={AppConstants.Product.REVIEWS.CLASSES.STARS_ROW}>
                {AppConstants.Product.REVIEWS.STARS.map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={AppConstants.Product.REVIEWS.COPY.RATE_STAR_ARIA(
                        star
                      )}
                      className={AppConstants.Product.REVIEWS.CLASSES.STAR_BTN}
                    >
                      <Star
                        className={AppConstants.Product.REVIEWS.CLASSES.STAR_ICON(
                          active
                        )}
                      />
                    </button>
                  );
                })}
                <span
                  className={
                    AppConstants.Product.REVIEWS.CLASSES.RATING_DISPLAY
                  }
                >
                  {AppConstants.Product.REVIEWS.COPY.STAR_COUNT_TEXT(rating)}
                </span>
              </div>
            </div>

            {/* Size Purchased / Worn */}
            <div>
              <label className={AppConstants.Product.REVIEWS.CLASSES.LABEL}>
                {AppConstants.Product.REVIEWS.COPY.LABEL_SIZE_PURCHASED}
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className={AppConstants.Product.REVIEWS.CLASSES.SELECT}
              >
                {product.sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    {AppConstants.Product.REVIEWS.COPY.SIZE_OPTION(sz)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={AppConstants.Product.REVIEWS.CLASSES.LABEL_INPUT}>
              {AppConstants.Product.REVIEWS.COPY.LABEL_HEADLINE}
            </label>
            <input
              type="text"
              maxLength={AppConstants.Product.REVIEWS.MAX_TITLE_LENGTH}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                AppConstants.Product.REVIEWS.COPY.PLACEHOLDER_HEADLINE
              }
              className={AppConstants.Product.REVIEWS.CLASSES.INPUT}
            />
          </div>

          <div>
            <label className={AppConstants.Product.REVIEWS.CLASSES.LABEL_INPUT}>
              {AppConstants.Product.REVIEWS.COPY.LABEL_COMMENT}
            </label>
            <textarea
              required
              rows={3}
              maxLength={AppConstants.Product.REVIEWS.MAX_COMMENT_LENGTH}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                AppConstants.Product.REVIEWS.COPY.PLACEHOLDER_COMMENT
              }
              className={AppConstants.Product.REVIEWS.CLASSES.TEXTAREA}
            />
          </div>

          <div className={AppConstants.Product.REVIEWS.CLASSES.FORM_ACTIONS}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className={AppConstants.Product.REVIEWS.CLASSES.CANCEL_BTN}
            >
              {AppConstants.Product.REVIEWS.COPY.CANCEL}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={AppConstants.Product.REVIEWS.CLASSES.SUBMIT_BTN}
            >
              {isSubmitting
                ? AppConstants.Product.REVIEWS.COPY.SUBMITTING
                : AppConstants.Product.REVIEWS.COPY.SUBMIT}
            </button>
          </div>
        </form>
      )}

      {/* Review Count Logic */}
      {reviewCount > 0 && averageRating !== null ? (
        <div className={AppConstants.Product.REVIEWS.CLASSES.SUMMARY_GRID}>
          {/* Left Column: Overall Average Rating & Star Distribution */}
          <div className={AppConstants.Product.REVIEWS.CLASSES.LEFT_COL}>
            <div className={AppConstants.Product.REVIEWS.CLASSES.SUMMARY_CARD}>
              <div className={AppConstants.Product.REVIEWS.CLASSES.AVERAGE_ROW}>
                <div
                  className={
                    AppConstants.Product.REVIEWS.CLASSES.AVERAGE_NUMBER
                  }
                >
                  {averageRating.toFixed(1)}
                </div>
                <div className="space-y-1">
                  <div className={AppConstants.Product.REVIEWS.CLASSES.STARS_GROUP}>
                    {AppConstants.Product.REVIEWS.STARS.map((star) => (
                      <Star
                        key={star}
                        className={AppConstants.Product.REVIEWS.CLASSES.AVG_STAR(
                          star <= Math.round(averageRating)
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={
                      AppConstants.Product.REVIEWS.CLASSES.REVIEW_COUNT_TEXT
                    }
                  >
                    {AppConstants.Product.REVIEWS.COPY.BASED_ON}
                    <strong>{reviewCount}</strong>{' '}
                    {reviewCount === 1
                      ? AppConstants.Product.REVIEWS.COPY.REVIEW_SINGULAR
                      : AppConstants.Product.REVIEWS.COPY.REVIEW_PLURAL}
                  </p>
                </div>
              </div>

              {/* 5-Star to 1-Star Breakdown Bars */}
              <div
                className={
                  AppConstants.Product.REVIEWS.CLASSES.BREAKDOWN_WRAPPER
                }
              >
                {starDistribution.map(({ starValue, count, pct }) => (
                  <div
                    key={starValue}
                    className={
                      AppConstants.Product.REVIEWS.CLASSES.BREAKDOWN_ROW
                    }
                  >
                    <span
                      className={
                        AppConstants.Product.REVIEWS.CLASSES
                          .BREAKDOWN_STAR_LABEL
                      }
                    >
                      {starValue}
                      <Star
                        className={
                          AppConstants.Product.REVIEWS.CLASSES
                            .BREAKDOWN_STAR_ICON
                        }
                      />
                    </span>
                    <div
                      className={
                        AppConstants.Product.REVIEWS.CLASSES.BREAKDOWN_TRACK
                      }
                    >
                      <div
                        className={
                          AppConstants.Product.REVIEWS.CLASSES.BREAKDOWN_FILL
                        }
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={
                        AppConstants.Product.REVIEWS.CLASSES.BREAKDOWN_COUNT
                      }
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer Reviews & Comments List */}
          <div className={AppConstants.Product.REVIEWS.CLASSES.REVIEWS_LIST}>
            {reviews.map((rev) => {
              const initial = rev.customer_name.charAt(0).toUpperCase();
              return (
                <article
                  key={rev.id}
                  className={AppConstants.Product.REVIEWS.CLASSES.REVIEW_CARD}
                >
                  <div
                    className={AppConstants.Product.REVIEWS.CLASSES.REVIEW_TOP}
                  >
                    <div
                      className={
                        AppConstants.Product.REVIEWS.CLASSES.AUTHOR_INFO
                      }
                    >
                      <div
                        className={AppConstants.Product.REVIEWS.CLASSES.AVATAR}
                      >
                        {initial}
                      </div>
                      <div>
                        <div
                          className={
                            AppConstants.Product.REVIEWS.CLASSES.AUTHOR_NAME_ROW
                          }
                        >
                          <span
                            className={
                              AppConstants.Product.REVIEWS.CLASSES.AUTHOR_NAME
                            }
                          >
                            {rev.customer_name}
                          </span>
                          <span
                            className={
                              AppConstants.Product.REVIEWS.CLASSES.VERIFIED_BADGE
                            }
                          >
                            <CheckCircle2
                              className={
                                AppConstants.Product.REVIEWS.CLASSES.VERIFIED_ICON
                              }
                            />
                            {
                              AppConstants.Product.REVIEWS.COPY
                                .VERIFIED_REVIEWER
                            }
                          </span>
                        </div>
                        <div
                          className={
                            AppConstants.Product.REVIEWS.CLASSES
                              .REVIEW_STARS_ROW
                          }
                        >
                          <div className="flex items-center gap-0.5">
                            {AppConstants.Product.REVIEWS.STARS.map((star) => (
                              <Star
                                key={star}
                                className={AppConstants.Product.REVIEWS.CLASSES.REVIEW_STAR(
                                  star <= rev.rating
                                )}
                              />
                            ))}
                          </div>
                          {rev.selected_size && (
                            <span
                              className={
                                AppConstants.Product.REVIEWS.CLASSES.REVIEW_SIZE
                              }
                            >
                              {AppConstants.Product.REVIEWS.COPY.SIZE_TAG}
                              <strong>{rev.selected_size}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <time
                      className={AppConstants.Product.REVIEWS.CLASSES.DATE_TIME}
                    >
                      {new Date(rev.created_at).toLocaleDateString(
                        AppConstants.Account.LOCALE,
                        AppConstants.Account.DATE_FORMATS.ORDER_PLACED
                      )}
                    </time>
                  </div>

                  {rev.title && (
                    <h4
                      className={
                        AppConstants.Product.REVIEWS.CLASSES.REVIEW_TITLE
                      }
                    >
                      {rev.title}
                    </h4>
                  )}

                  <p
                    className={
                      AppConstants.Product.REVIEWS.CLASSES.REVIEW_BODY
                    }
                  >
                    {rev.comment}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        !isFormOpen && (
          <div className={AppConstants.Product.REVIEWS.CLASSES.EMPTY_CARD}>
            <p className={AppConstants.Product.REVIEWS.CLASSES.EMPTY_TITLE}>
              {AppConstants.Product.REVIEWS.COPY.EMPTY_TITLE}
            </p>
            <p className={AppConstants.Product.REVIEWS.CLASSES.EMPTY_SUBTITLE}>
              {AppConstants.Product.REVIEWS.COPY.EMPTY_BODY(product.name)}
            </p>
          </div>
        )
      )}
    </section>
  );
}
