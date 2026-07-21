import { Badge } from '@/components/ui/Badge';
import { titleCase } from '@/lib/format';

const ORDER_VARIANTS = {
  pending: 'warning',
  confirmed: 'brand',
  packed: 'brand',
  shipped: 'accent',
  out_for_delivery: 'accent',
  delivered: 'success',
  cancelled: 'error',
};

const RETURN_VARIANTS = {
  requested: 'warning',
  approved: 'brand',
  rejected: 'error',
  picked_up: 'accent',
  refunded: 'success',
  completed: 'success',
};

export function OrderStatusBadge({ status }) {
  return <Badge variant={ORDER_VARIANTS[status] || 'neutral'}>{titleCase(status)}</Badge>;
}

export function ReturnStatusBadge({ status }) {
  return <Badge variant={RETURN_VARIANTS[status] || 'neutral'}>{titleCase(status)}</Badge>;
}

export default OrderStatusBadge;
