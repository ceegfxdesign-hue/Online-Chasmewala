import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiTag, FiX, FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useValidateCouponMutation, useGetActiveCouponsQuery } from '@/features/cart/cartApi';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/format';

/**
 * Coupon entry + available-offers list. On success it calls `onApply({ code,
 * discount })`; `applied` shows the active coupon with a remove control.
 */
export function CouponField({ subtotal, applied, onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [showOffers, setShowOffers] = useState(false);
  const isAuth = useSelector(selectIsAuthenticated);
  const toast = useToast();
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();
  const { data: offers = [] } = useGetActiveCouponsQuery(undefined, { skip: !showOffers });

  const apply = async (couponCode) => {
    if (!isAuth) {
      toast.info('Please sign in to apply a coupon');
      return;
    }
    try {
      const res = await validateCoupon({ code: couponCode, subtotal }).unwrap();
      onApply({ code: res.code, discount: res.discount });
      toast.success(`Coupon ${res.code} applied — you saved ${formatPrice(res.discount)}`);
      setCode('');
    } catch (err) {
      toast.error(err?.message || 'Invalid coupon');
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success-light/50 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-success-dark">
          <FiTag className="h-4 w-4" /> {applied.code} applied
        </span>
        <button type="button" onClick={onRemove} aria-label="Remove coupon" className="text-navy-400 hover:text-error">
          <FiX className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) apply(code.trim().toUpperCase());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <FiTag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            className="h-11 w-full rounded-xl border border-navy-200 pl-10 pr-3 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <Button type="submit" variant="outline" loading={isLoading} disabled={!code.trim()}>
          Apply
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setShowOffers((s) => !s)}
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        View available offers <FiChevronRight className={showOffers ? 'rotate-90 transition-transform' : 'transition-transform'} />
      </button>

      {showOffers && (
        <ul className="mt-2 space-y-2">
          {offers.map((o) => (
            <li key={o.code} className="flex items-center justify-between rounded-xl border border-dashed border-navy-200 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-navy-900">{o.code}</p>
                <p className="text-xs text-navy-400">{o.description}</p>
              </div>
              <button type="button" onClick={() => apply(o.code)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Apply
              </button>
            </li>
          ))}
          {offers.length === 0 && <li className="text-sm text-navy-400">No offers available right now.</li>}
        </ul>
      )}
    </div>
  );
}

export default CouponField;
