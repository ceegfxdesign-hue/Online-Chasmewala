import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiBell, FiCheck, FiTrash2, FiPackage, FiTag, FiUser, FiRefreshCw } from 'react-icons/fi';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRemoveNotificationMutation,
} from '@/features/account/accountApi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/utils/cn';

const ICONS = { order: FiPackage, promo: FiTag, account: FiUser, return: FiRefreshCw, system: FiBell };

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery({ limit: 30 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [remove] = useRemoveNotificationMutation();

  const items = data?.items || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  return (
    <>
      <Helmet>
        <title>Notifications · Online Chasmewala</title>
      </Helmet>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4 text-navy-900">
          Notifications{unreadCount > 0 && <span className="ml-2 text-sm font-medium text-brand-600">({unreadCount} unread)</span>}
        </h2>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" loading={markingAll} onClick={() => markAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<FiBell />} title="No notifications" description="Order updates and offers will appear here." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] || FiBell;
            const body = (
              <div className="flex flex-1 items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    n.isRead ? 'bg-navy-100 text-navy-400' : 'bg-brand-50 text-brand-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm', n.isRead ? 'font-medium text-navy-700' : 'font-semibold text-navy-900')}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-navy-500">{n.message}</p>
                  <p className="mt-1 text-xs text-navy-300">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            );
            return (
              <li
                key={n._id}
                className={cn(
                  'flex items-start gap-2 rounded-2xl border p-4 transition-colors',
                  n.isRead ? 'border-navy-100 bg-surface' : 'border-brand-200 bg-brand-50/40'
                )}
              >
                {n.link ? (
                  <Link to={n.link} className="flex flex-1" onClick={() => !n.isRead && markRead(n._id)}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
                <div className="flex shrink-0 gap-1">
                  {!n.isRead && (
                    <button
                      type="button"
                      aria-label="Mark as read"
                      onClick={() => markRead(n._id)}
                      className="rounded-full p-2 text-navy-400 hover:bg-navy-100 hover:text-success"
                    >
                      <FiCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Delete notification"
                    onClick={() => remove(n._id)}
                    className="rounded-full p-2 text-navy-400 hover:bg-error-light hover:text-error"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
