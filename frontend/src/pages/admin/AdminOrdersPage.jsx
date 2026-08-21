import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FiClock,
  FiCreditCard,
  FiEye,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiSearch,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import { OrderStatusBadge } from '@/components/account/StatusBadge';
import { LensConfigurationSummary } from '@/components/product/LensConfigurationSummary';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
} from '@/components/ui';
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderMutation,
} from '@/features/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';
import { formatDateTime, formatPrice, titleCase } from '@/lib/format';

const ORDER_STATUSES = [
  { value: '', label: 'All order statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_BADGES = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'neutral',
};

const itemCount = (order) =>
  (order?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);

const addressParts = (address = {}) =>
  [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.pincode,
    address.country,
  ].filter(Boolean);

function AddressBlock({ address, compact = false }) {
  const parts = addressParts(address);

  return (
    <address className="not-italic text-navy-600">
      {parts.length > 0 ? (
        parts.map((part, index) => (
          <span key={`${part}-${index}`} className={compact ? 'inline' : 'block'}>
            {part}
            {compact && index < parts.length - 1 ? ', ' : ''}
          </span>
        ))
      ) : (
        <span className="text-navy-400">Address not available</span>
      )}
    </address>
  );
}

function OrderItems({ order }) {
  return (
    <Card elevation="flat">
      <CardBody className="p-0 sm:p-0">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="flex items-center gap-2 font-semibold text-navy-900">
            <FiPackage className="text-brand-600" /> Ordered items
          </h3>
          <span className="text-sm text-navy-500">
            {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'}
          </span>
        </div>
        <div className="divide-y divide-navy-100">
          {(order.items || []).map((item) => (
            <div key={item._id || item.product} className="flex gap-4 px-5 py-4">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-navy-100 bg-surface-subtle object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-navy-300">
                  <FiPackage className="h-6 w-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy-900">{item.name}</p>
                <p className="mt-1 text-xs text-navy-500">
                  {item.sku ? `SKU ${item.sku} · ` : ''}Qty {item.quantity}
                  {item.color ? ` · ${item.color}` : ''}
                </p>
                <LensConfigurationSummary
                  lensOption={item.lensOption}
                  prescription={item.prescription}
                  showPrice
                  className="mt-3"
                />
              </div>
              <p className="shrink-0 font-semibold text-navy-900">
                {formatPrice(
                  (Number(item.price || 0) + Number(item.lensOption?.price || 0)) *
                    Number(item.quantity || 0)
                )}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function PricingSummary({ order }) {
  const pricing = order.pricing || {};
  const payment = order.payment || {};

  return (
    <Card elevation="flat">
      <CardBody>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-navy-900">
            <FiCreditCard className="text-brand-600" /> Payment summary
          </h3>
          <Badge variant={PAYMENT_BADGES[payment.status] || 'neutral'}>
            {titleCase(payment.status || 'pending')}
          </Badge>
        </div>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-navy-500">Payment method</dt>
            <dd className="font-medium uppercase text-navy-800">{payment.method || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-navy-500">Subtotal</dt>
            <dd className="text-navy-800">{formatPrice(pricing.subtotal)}</dd>
          </div>
          {Number(pricing.discount) > 0 && (
            <div className="flex justify-between gap-4 text-success-dark">
              <dt>Discount{pricing.couponCode ? ` (${pricing.couponCode})` : ''}</dt>
              <dd>-{formatPrice(pricing.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-navy-500">Shipping</dt>
            <dd className="text-navy-800">
              {Number(pricing.shippingFee) > 0 ? formatPrice(pricing.shippingFee) : 'Free'}
            </dd>
          </div>
          {Number(pricing.tax) > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-navy-500">Tax</dt>
              <dd className="text-navy-800">{formatPrice(pricing.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-navy-100 pt-3 text-base font-bold text-navy-900">
            <dt>Order total</dt>
            <dd>{formatPrice(pricing.total)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

function OrderDetailsModal({ order, open, onClose, onStatusChange, updating }) {
  if (!order) return null;

  const address = order.shippingAddress || {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      description={`Placed ${formatDateTime(order.createdAt)}`}
      size="xl"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-surface-subtle p-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
            Current order status
          </p>
          <OrderStatusBadge status={order.status} />
        </div>
        <Select
          aria-label="Update order status"
          containerClassName="w-full sm:w-56"
          value={order.status}
          disabled={updating}
          options={ORDER_STATUSES.slice(1)}
          onChange={(event) => onStatusChange(order._id, event.target.value)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Card elevation="flat">
            <CardBody>
              <h3 className="flex items-center gap-2 font-semibold text-navy-900">
                <FiUser className="text-brand-600" /> Checkout customer
              </h3>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Name</dt>
                  <dd className="mt-1 font-medium text-navy-900">
                    {address.fullName || order.user?.name || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Phone</dt>
                  <dd className="mt-1">
                    {address.phone ? (
                      <a className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800" href={`tel:${address.phone}`}>
                        <FiPhone /> {address.phone}
                      </a>
                    ) : 'Not provided'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400">Account email</dt>
                  <dd className="mt-1">
                    {order.user?.email ? (
                      <a className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800" href={`mailto:${order.user.email}`}>
                        <FiMail /> {order.user.email}
                      </a>
                    ) : 'Not available'}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card elevation="flat">
            <CardBody>
              <h3 className="flex items-center gap-2 font-semibold text-navy-900">
                <FiMapPin className="text-brand-600" /> Delivery address from checkout
              </h3>
              <div className="mt-3 text-sm leading-6">
                <p className="font-semibold text-navy-900">
                  {address.fullName || order.user?.name || 'Customer'}
                </p>
                <AddressBlock address={address} />
                {address.phone && <p className="mt-2 text-navy-700">Phone: {address.phone}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-navy-100 pt-4 text-sm">
                <span className="inline-flex items-center gap-2 text-navy-600">
                  <FiTruck className="text-brand-600" /> {titleCase(order.deliveryMethod || 'standard')} delivery
                </span>
                {order.estimatedDeliveryAt && (
                  <span className="inline-flex items-center gap-2 text-navy-600">
                    <FiClock className="text-brand-600" /> Estimated {formatDateTime(order.estimatedDeliveryAt)}
                  </span>
                )}
              </div>
            </CardBody>
          </Card>

          <OrderItems order={order} />
        </div>

        <div className="space-y-5">
          <PricingSummary order={order} />
          <Card elevation="flat">
            <CardBody>
              <h3 className="mb-4 font-semibold text-navy-900">Order activity</h3>
              {(order.timeline || []).length > 0 ? (
                <ol className="space-y-4">
                  {[...order.timeline].reverse().map((event, index) => (
                    <li key={`${event.status}-${event.at}-${index}`} className="flex gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                      <div>
                        <p className="text-sm font-semibold text-navy-800">{titleCase(event.status)}</p>
                        <p className="text-xs text-navy-400">{formatDateTime(event.at)}</p>
                        {event.note && <p className="mt-1 text-sm text-navy-600">{event.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-navy-400">No activity recorded.</p>
              )}
              {order.cancelReason && (
                <div className="mt-4 rounded-xl bg-error-light p-3 text-sm text-error-dark">
                  Cancellation reason: {order.cancelReason}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery({
    page,
    limit: 20,
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });
  const [updateOrder, { isLoading: updating }] = useUpdateAdminOrderMutation();
  const orders = data?.items || [];
  const meta = data?.meta;

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  const updateStatus = async (id, nextStatus) => {
    try {
      const updated = await updateOrder({ id, status: nextStatus }).unwrap();
      setSelectedOrder((current) => (current?._id === id ? { ...current, ...updated } : current));
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update the order status');
    }
  };

  return (
    <>
      <Helmet><title>Orders · Admin · Online Chasmewala</title></Helmet>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Order management</p>
          <h1 className="mt-1 text-h3 text-navy-900">Orders</h1>
          <p className="mt-1 text-sm text-navy-500">
            Review placed orders, checkout contact details and delivery addresses.
          </p>
        </div>
        {meta && (
          <div className="rounded-xl border border-navy-100 bg-surface px-4 py-2 text-sm text-navy-600">
            <span className="font-bold text-navy-900">{meta.total}</span> total order{meta.total === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <Card elevation="flat" className="mb-5">
        <CardBody className="p-4 sm:p-4">
          <div className="grid items-end gap-3 lg:grid-cols-[minmax(260px,1fr)_240px_auto]">
            <form onSubmit={submitSearch} className="flex gap-2">
              <Input
                aria-label="Search by order number"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                leftIcon={<FiSearch />}
                placeholder="Search order number"
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            <Select
              aria-label="Filter orders by status"
              value={status}
              options={ORDER_STATUSES}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            />
            {(status || search) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatus('');
                  setSearch('');
                  setSearchDraft('');
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<FiPackage />}
          title="Orders could not be loaded"
          description="Check the backend connection and try again."
          action={<Button onClick={refetch}>Try again</Button>}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FiPackage />}
          title="No orders found"
          description={status || search ? 'Try clearing the current filters.' : 'Placed orders will appear here.'}
        />
      ) : (
        <>
          <div className="grid gap-3 xl:hidden">
            {orders.map((order) => {
              const checkout = order.shippingAddress || {};
              return (
                <Card key={order._id} elevation="flat">
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                        <p className="mt-1 text-xs text-navy-400">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="mt-4 grid gap-4 border-y border-navy-100 py-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Checkout customer</p>
                        <p className="mt-1 font-medium text-navy-900">
                          {checkout.fullName || order.user?.name || 'Customer'}
                        </p>
                        {checkout.phone && <p className="mt-1 text-sm text-navy-600">{checkout.phone}</p>}
                        {order.user?.email && <p className="mt-1 break-all text-xs text-navy-400">{order.user.email}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Delivery address</p>
                        <div className="mt-1 text-sm leading-5"><AddressBlock address={checkout} compact /></div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-navy-900">{formatPrice(order.pricing?.total)}</p>
                        <p className="mt-0.5 text-xs text-navy-400">
                          {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'} ·{' '}
                          <span className="uppercase">{order.payment?.method || '—'}</span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<FiEye />}
                        onClick={() => setSelectedOrder(order)}
                      >
                        View full details
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="relative hidden overflow-x-auto rounded-2xl border border-navy-100 bg-surface shadow-card xl:block">
            {isFetching && <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-brand-500" />}
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-navy-100 bg-surface-subtle text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  {['Order', 'Checkout customer', 'Delivery address', 'Payment', 'Placed', 'Status', ''].map((column) => (
                    <th key={column || 'actions'} className="px-4 py-3 font-semibold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {orders.map((order) => {
                  const checkout = order.shippingAddress || {};
                  return (
                    <tr key={order._id} className="align-top transition-colors hover:bg-surface-subtle/70">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                        <span className="mt-1 block text-xs text-navy-400">
                          {itemCount(order)} item{itemCount(order) === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-navy-900">
                          {checkout.fullName || order.user?.name || 'Customer'}
                        </p>
                        {checkout.phone && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-navy-500">
                            <FiPhone /> {checkout.phone}
                          </p>
                        )}
                        {order.user?.email && (
                          <p className="mt-1 max-w-[220px] truncate text-xs text-navy-400">{order.user.email}</p>
                        )}
                      </td>
                      <td className="max-w-[280px] px-4 py-4 text-xs leading-5">
                        <AddressBlock address={checkout} compact />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-navy-900">{formatPrice(order.pricing?.total)}</p>
                        <p className="mt-1 text-xs uppercase text-navy-400">{order.payment?.method || '—'}</p>
                        <Badge className="mt-2" size="sm" variant={PAYMENT_BADGES[order.payment?.status] || 'neutral'}>
                          {titleCase(order.payment?.status || 'pending')}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-navy-600">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<FiEye />}
                          onClick={() => setSelectedOrder(order)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && (
            <Pagination
              className="mt-6"
              page={meta.page}
              totalPages={meta.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={updateStatus}
        updating={updating}
      />
    </>
  );
}
