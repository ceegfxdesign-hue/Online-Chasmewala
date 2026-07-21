import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiRefreshCw } from 'react-icons/fi';
import { useGetMyReturnsQuery } from '@/features/account/accountApi';
import { ReturnStatusBadge } from '@/components/account/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate, titleCase } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function ReturnsPage() {
  const { data, isLoading } = useGetMyReturnsQuery({});
  const items = data?.items || [];

  return (
    <>
      <Helmet>
        <title>Returns & Exchanges · Online Chasmewala</title>
      </Helmet>

      <h2 className="mb-4 text-h4 text-navy-900">Returns & Exchanges</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FiRefreshCw />}
          title="No return requests"
          description="You can request a return or exchange from a delivered order's details page."
          action={<Button as={Link} to={ROUTES.orders}>View my orders</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r._id} elevation="soft">
              <CardBody className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-navy-900">{r.returnNumber}</p>
                    <ReturnStatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-navy-400">{formatDate(r.createdAt)}</p>
                </div>

                <p className="mt-2 text-sm text-navy-600">
                  {titleCase(r.type)} · Order{' '}
                  <Link to={ROUTES.orderDetails(r.order?.orderNumber)} className="font-medium text-brand-600 hover:underline">
                    {r.order?.orderNumber}
                  </Link>
                </p>

                <ul className="mt-2 space-y-1 text-sm text-navy-500">
                  {r.items.map((it, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i}>
                      {it.name} × {it.quantity} — <span className="italic">{it.reason}</span>
                    </li>
                  ))}
                </ul>

                {r.type === 'return' && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2 text-sm">
                    <span className="text-navy-500">Refund ({titleCase(r.refund?.status || 'pending')})</span>
                    <span className="font-semibold text-navy-900">{formatPrice(r.refund?.amount || 0)}</span>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
