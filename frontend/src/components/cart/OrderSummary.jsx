import { FiTag } from 'react-icons/fi';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

/**
 * Price breakdown card shared by the cart and checkout. Pure presentation —
 * values are computed by the caller.
 */
export function OrderSummary({
  subtotal,
  savings = 0,
  discount = 0,
  couponCode,
  shippingFee = 0,
  tax = 0,
  total,
  freeShippingThreshold,
  className,
  children,
}) {
  const remainingForFree =
    freeShippingThreshold && subtotal - discount < freeShippingThreshold
      ? freeShippingThreshold - (subtotal - discount)
      : 0;

  return (
    <div className={cn('rounded-2xl bg-surface p-6 shadow-card', className)}>
      <h2 className="text-h4 text-navy-900">Order Summary</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        {savings > 0 && <Row label="Product savings" value={`- ${formatPrice(savings)}`} valueClass="text-success" />}
        {discount > 0 && (
          <Row
            label={
              <span className="inline-flex items-center gap-1 text-success">
                <FiTag className="h-3.5 w-3.5" /> Coupon {couponCode}
              </span>
            }
            value={`- ${formatPrice(discount)}`}
            valueClass="text-success"
          />
        )}
        <Row
          label="Delivery"
          value={shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
          valueClass={shippingFee === 0 ? 'text-success font-semibold' : ''}
        />
        {tax > 0 && <Row label="Tax" value={formatPrice(tax)} />}
      </dl>

      {remainingForFree > 0 && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
          Add {formatPrice(remainingForFree)} more for FREE delivery
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
        <span className="text-base font-semibold text-navy-900">Total</span>
        <span className="text-xl font-extrabold text-navy-900">{formatPrice(total)}</span>
      </div>

      {children}
    </div>
  );
}

function Row({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-navy-500">{label}</dt>
      <dd className={cn('font-medium text-navy-800', valueClass)}>{value}</dd>
    </div>
  );
}

export default OrderSummary;
