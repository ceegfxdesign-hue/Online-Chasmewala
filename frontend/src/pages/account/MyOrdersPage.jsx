import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { useGetMyOrdersQuery } from '@/features/cart/cartApi';
import { OrderStatusBadge } from '@/components/account/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading } = useGetMyOrdersQuery({ page, limit: 8 });

  const orders = data?.items || [];
  const meta = data?.meta;

  return (
    <>
      <Helmet>
        <title>My Orders · Online Chasmewala</title>
      </Helmet>

      <h2 className="mb-4 text-h4 text-navy-900">My Orders</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FiPackage />}
          title="No orders yet"
          description="When you place an order it will show up here."
          action={<Button as={Link} to={ROUTES.products}>Start shopping</Button>}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  to={ROUTES.orderDetails(order.orderNumber)}
                  className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-card transition-shadow hover:shadow-elevated"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item._id}
                        src={item.image}
                        alt=""
                        className="h-12 w-12 rounded-full border-2 border-surface object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-surface bg-navy-100 text-xs font-semibold text-navy-600">
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy-900">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-navy-400">
                      {formatDate(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-navy-900">{formatPrice(order.pricing.total)}</p>
                    <FiChevronRight className="ml-auto mt-1 text-navy-300" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {meta && (
            <Pagination
              className="mt-6"
              page={meta.page}
              totalPages={meta.totalPages}
              onChange={(p) => setSearchParams({ page: String(p) })}
            />
          )}
        </>
      )}
    </>
  );
}
