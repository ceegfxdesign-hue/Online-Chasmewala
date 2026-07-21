import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiStar, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useGetMyReviewsQuery, useRemoveMyReviewMutation } from '@/features/account/accountApi';
import { RatingStars } from '@/components/ui/RatingStars';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function MyReviewsPage() {
  const toast = useToast();
  const { data, isLoading } = useGetMyReviewsQuery({});
  const [removeReview] = useRemoveMyReviewMutation();
  const items = data?.items || [];

  const onRemove = async (id) => {
    try {
      await removeReview(id).unwrap();
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err?.message || 'Could not delete review');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Reviews · Online Chasmewala</title>
      </Helmet>

      <h2 className="mb-4 text-h4 text-navy-900">My Reviews</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FiStar />}
          title="No reviews yet"
          description="Share your experience — review products you've purchased from your order details."
          action={<Button as={Link} to={ROUTES.orders}>View my orders</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r._id} elevation="soft">
              <CardBody className="p-4">
                <div className="flex gap-4">
                  {r.product?.images?.[0] && (
                    <Link to={ROUTES.product(r.product.slug)} className="shrink-0">
                      <img src={r.product.images[0]} alt="" className="h-16 w-16 rounded-xl bg-surface-subtle object-cover" />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={r.product ? ROUTES.product(r.product.slug) : '#'}
                          className="line-clamp-1 font-medium text-navy-900 hover:text-brand-600"
                        >
                          {r.product?.name || 'Product no longer available'}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <RatingStars value={r.rating} size={14} />
                          <span className="text-xs text-navy-400">{formatDate(r.createdAt)}</span>
                          {r.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                              <FiCheckCircle className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete review"
                        onClick={() => onRemove(r._id)}
                        className="rounded-full p-2 text-navy-400 hover:bg-error-light hover:text-error"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {r.title && <p className="mt-2 text-sm font-semibold text-navy-900">{r.title}</p>}
                    <p className="mt-1 text-sm text-navy-600">{r.comment}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
