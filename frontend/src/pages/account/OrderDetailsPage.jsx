import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiMapPin, FiCreditCard, FiXCircle, FiRefreshCw, FiStar } from 'react-icons/fi';
import { useGetOrderQuery, useCancelOrderMutation } from '@/features/cart/cartApi';
import { useCreateReturnMutation, useCreateReviewMutation } from '@/features/account/accountApi';
import { OrderStatusBadge } from '@/components/account/StatusBadge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { RatingStars } from '@/components/ui/RatingStars';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, formatDateTime, titleCase } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

function Timeline({ order }) {
  if (order.status === 'cancelled') {
    const cancelled = order.timeline.find((t) => t.status === 'cancelled');
    return (
      <div className="flex items-center gap-3 rounded-xl bg-error-light/60 p-4 text-sm text-error-dark">
        <FiXCircle className="h-5 w-5 shrink-0" />
        Order cancelled {cancelled && `on ${formatDateTime(cancelled.at)}`}
        {order.cancelReason && ` — ${order.cancelReason}`}
      </div>
    );
  }

  const reachedIdx = FLOW.indexOf(order.status);
  const timelineMap = Object.fromEntries(order.timeline.map((t) => [t.status, t]));

  return (
    <ol className="relative space-y-6">
      {FLOW.map((step, i) => {
        const done = i <= reachedIdx;
        const event = timelineMap[step];
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs',
                  done ? 'border-brand-500 bg-brand-500 text-white' : 'border-navy-200 bg-surface text-navy-300'
                )}
              >
                {done ? <FiCheck /> : i + 1}
              </span>
              {i < FLOW.length - 1 && (
                <span className={cn('mt-1 h-full w-0.5 flex-1', i < reachedIdx ? 'bg-brand-500' : 'bg-navy-100')} />
              )}
            </div>
            <div className="pb-1">
              <p className={cn('text-sm font-semibold', done ? 'text-navy-900' : 'text-navy-400')}>
                {titleCase(step)}
              </p>
              {event && <p className="text-xs text-navy-400">{formatDateTime(event.at)}{event.note ? ` · ${event.note}` : ''}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const toast = useToast();
  const { data: order, isLoading, isError } = useGetOrderQuery(orderNumber);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [createReturn, { isLoading: returning }] = useCreateReturnMutation();
  const [createReview, { isLoading: reviewing }] = useCreateReviewMutation();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reason, setReason] = useState('');
  const [returnType, setReturnType] = useState('return');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (isLoading) return <Loader label="Loading order…" />;
  if (isError || !order) return <EmptyState title="Order not found" />;

  const canCancel = ['pending', 'confirmed', 'packed'].includes(order.status);
  const canReturn = order.status === 'delivered';

  const onCancel = async () => {
    try {
      await cancelOrder({ orderNumber, reason: reason || 'Cancelled by customer' }).unwrap();
      toast.success('Order cancelled');
      setCancelOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Could not cancel order');
    }
  };

  const onReturn = async () => {
    if (!reason.trim()) {
      toast.error('Please tell us the reason');
      return;
    }
    try {
      await createReturn({ orderNumber, reason, type: returnType }).unwrap();
      toast.success('Return request submitted');
      setReturnOpen(false);
      setReason('');
    } catch (err) {
      toast.error(err?.message || 'Could not create return request');
    }
  };

  const onReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a few words');
      return;
    }
    try {
      // The order item snapshot doesn't carry the slug; resolve via product id lookup route on the PDP would need slug.
      await createReview({ slug: reviewItem.slug, rating, comment }).unwrap();
      toast.success('Thanks for your review!');
      setReviewItem(null);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err?.message || 'Could not submit review');
    }
  };

  return (
    <>
      <Helmet>
        <title>Order {orderNumber} · Online Chasmewala</title>
      </Helmet>

      <Breadcrumb
        className="mb-4"
        items={[{ label: 'My Orders', to: ROUTES.orders }, { label: orderNumber }]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-h4 text-navy-900">{orderNumber}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)} leftIcon={<FiXCircle />}>
              Cancel order
            </Button>
          )}
          {canReturn && (
            <Button variant="outline" size="sm" onClick={() => setReturnOpen(true)} leftIcon={<FiRefreshCw />}>
              Return / Exchange
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-navy-900">Items ({order.items.length})</h3>
            </CardHeader>
            <CardBody className="divide-y divide-navy-100 p-0">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-surface-subtle object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-navy-900">{item.name}</p>
                    <p className="text-sm text-navy-400">
                      Qty {item.quantity}
                      {item.color && ` · ${item.color}`}
                      {item.lensOption?.label && ` · ${item.lensOption.label}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-navy-900">{formatPrice(item.price * item.quantity)}</p>
                    {canReturn && item.slug && (
                      <button
                        type="button"
                        onClick={() => setReviewItem(item)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <FiStar className="h-3 w-3" /> Write review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-navy-900">Order tracking</h3>
            </CardHeader>
            <CardBody>
              <Timeline order={order} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 font-semibold text-navy-900">
                <FiMapPin className="text-brand-500" /> Delivery address
              </h3>
            </CardHeader>
            <CardBody className="text-sm text-navy-600">
              <p className="font-medium text-navy-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 font-semibold text-navy-900">
                <FiCreditCard className="text-brand-500" /> Payment & summary
              </h3>
            </CardHeader>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-navy-500">Method</dt>
                  <dd className="font-medium uppercase text-navy-800">{order.payment.method}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-navy-500">Payment status</dt>
                  <dd className="font-medium text-navy-800">{titleCase(order.payment.status)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-navy-500">Subtotal</dt>
                  <dd>{formatPrice(order.pricing.subtotal)}</dd>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Discount {order.pricing.couponCode && `(${order.pricing.couponCode})`}</dt>
                    <dd>- {formatPrice(order.pricing.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-navy-500">Delivery</dt>
                  <dd>{order.pricing.shippingFee === 0 ? 'FREE' : formatPrice(order.pricing.shippingFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-navy-100 pt-2 text-base font-bold text-navy-900">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.pricing.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Cancel modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this order?" size="sm">
        <p className="text-sm text-navy-600">
          Your payment will be refunded to the original method. This can’t be undone.
        </p>
        <Textarea containerClassName="mt-4" label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <div className="mt-5 flex gap-2">
          <Button variant="danger" onClick={onCancel} loading={cancelling} className="flex-1">
            Yes, cancel order
          </Button>
          <Button variant="ghost" onClick={() => setCancelOpen(false)} className="flex-1">
            Keep order
          </Button>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal open={returnOpen} onClose={() => setReturnOpen(false)} title="Return or exchange" size="sm">
        <div className="mb-4 grid grid-cols-2 gap-2">
          {['return', 'exchange'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setReturnType(t)}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize',
                returnType === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-navy-200 text-navy-600'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Textarea label="Why are you returning this?" required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <Button onClick={onReturn} loading={returning} fullWidth className="mt-5">
          Submit request
        </Button>
      </Modal>

      {/* Review modal (opened from delivered items in future iterations; kept accessible) */}
      <Modal open={Boolean(reviewItem)} onClose={() => setReviewItem(null)} title={`Review ${reviewItem?.name || ''}`} size="sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-navy-700">Your rating:</span>
          <RatingStars value={rating} onChange={setRating} size={22} />
        </div>
        <Textarea label="Your review" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
        <Button onClick={onReview} loading={reviewing} fullWidth className="mt-5" leftIcon={<FiStar />}>
          Submit review
        </Button>
      </Modal>

      {canReturn && (
        <p className="mt-6 text-sm text-navy-400">
          Loved your purchase? <Link to={ROUTES.reviews} className="font-medium text-brand-600 hover:underline">Write a review</Link> from the product page or My Reviews.
        </p>
      )}
    </>
  );
}
