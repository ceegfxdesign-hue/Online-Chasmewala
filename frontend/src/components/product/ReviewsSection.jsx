import { FiCheckCircle } from 'react-icons/fi';
import { useGetProductReviewsQuery, useGetReviewSummaryQuery } from '@/features/products/productApi';
import { RatingStars } from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

function RatingBar({ star, count, total }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-navy-500">{star}★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
        <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-navy-400">{count}</span>
    </div>
  );
}

/** Read-only reviews with a rating-distribution summary. Writing reviews is added in Phase 7. */
export function ReviewsSection({ slug }) {
  const { data: summary, isLoading: loadingSummary } = useGetReviewSummaryQuery(slug);
  const { data, isLoading } = useGetProductReviewsQuery({ slug });
  const reviews = data?.items || [];

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        {loadingSummary ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="rounded-2xl bg-surface-muted p-6 text-center">
            <p className="text-4xl font-extrabold text-navy-900">{summary?.average ?? 0}</p>
            <div className="mt-2 flex justify-center">
              <RatingStars value={summary?.average || 0} />
            </div>
            <p className="mt-1 text-sm text-navy-400">{summary?.total ?? 0} reviews</p>

            <div className="mt-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar key={star} star={star} count={summary?.distribution?.[star] ?? 0} total={summary?.total ?? 0} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState title="No reviews yet" description="Be the first to review this product after your purchase." />
        ) : (
          <ul className="space-y-5">
            {reviews.map((r) => (
              <li key={r._id} className="border-b border-navy-100 pb-5 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{r.user?.name || 'Customer'}</p>
                      <RatingStars value={r.rating} size={13} />
                    </div>
                  </div>
                  <span className="text-xs text-navy-400">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-3 text-sm font-semibold text-navy-900">{r.title}</p>}
                <p className="mt-1 text-sm text-navy-600">{r.comment}</p>
                {r.isVerifiedPurchase && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
                    <FiCheckCircle className="h-3.5 w-3.5" /> Verified purchase
                  </p>
                )}
                {r.images?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.images.map((img) => (
                      <img key={img} src={img} alt="Review" className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ReviewsSection;
