import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiShoppingBag, FiPlus, FiMinus, FiTrash2, FiArrowRight, FiTruck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { CouponField } from '@/components/cart/CouponField';
import {
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  selectCoupon,
  cartLineKey,
} from '@/features/cart/cartSlice';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { formatPrice, discountPercent } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

const FREE_SHIPPING = 999;
const STANDARD_SHIPPING = 49;

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const coupon = useSelector(selectCoupon);
  const isAuth = useSelector(selectIsAuthenticated);

  const savings = useMemo(
    () => items.reduce((s, i) => s + Math.max(0, (i.mrp || i.price) - i.price) * i.quantity, 0),
    [items]
  );
  const discount = coupon?.discount || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingFee = afterDiscount >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING;
  const total = afterDiscount + shippingFee;

  const goToCheckout = () => {
    if (!isAuth) {
      navigate(ROUTES.login, { state: { from: ROUTES.checkout } });
      return;
    }
    navigate(ROUTES.checkout);
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart · Online Chasmewala</title>
        </Helmet>
        <div className="container-page py-12">
          <EmptyState
            icon={<FiShoppingBag />}
            title="Your cart is empty"
            description="Looks like you haven’t added anything yet. Explore our collection to get started."
            action={<Button as={Link} to={ROUTES.products}>Start shopping</Button>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Your Cart (${items.length}) · Online Chasmewala`}</title>
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumb className="mb-4" items={[{ label: 'Home', to: ROUTES.home }, { label: 'Cart' }]} />
        <h1 className="mb-6 text-h2 text-navy-900">Your Cart</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div>
            <ul className="space-y-4">
              {items.map((item) => {
                const key = cartLineKey(item);
                const lineDiscount = discountPercent(item.mrp, item.price);
                const unit = item.price + (item.lensOption?.price || 0);
                return (
                  <li key={key} className="flex gap-4 rounded-2xl bg-surface p-4 shadow-card">
                    <Link to={ROUTES.product(item.slug)} className="shrink-0">
                      <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl bg-surface-subtle object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={ROUTES.product(item.slug)} className="line-clamp-2 font-medium text-navy-900 hover:text-brand-600">
                            {item.name}
                          </Link>
                          {item.color && <p className="mt-0.5 text-sm text-navy-400">Color: {item.color}</p>}
                          {item.lensOption && (
                            <p className="text-sm text-navy-400">
                              Lens: {item.lensOption.label}
                              {item.lensOption.price > 0 && ` (+${formatPrice(item.lensOption.price)})`}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(key))}
                          aria-label="Remove item"
                          className="rounded-lg p-1.5 text-navy-400 hover:bg-error-light hover:text-error"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-navy-200">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity - 1 }))}
                            className="flex h-8 w-8 items-center justify-center text-navy-600 hover:bg-navy-100"
                          >
                            <FiMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity + 1 }))}
                            className="flex h-8 w-8 items-center justify-center text-navy-600 hover:bg-navy-100"
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-navy-900">{formatPrice(unit * item.quantity)}</p>
                          {lineDiscount > 0 && (
                            <p className="text-xs text-navy-400">
                              <span className="line-through">{formatPrice(item.mrp * item.quantity)}</span>{' '}
                              <span className="text-success">{lineDiscount}% off</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              <FiTruck className="h-4 w-4" />
              {shippingFee === 0 ? 'You’ve unlocked FREE delivery!' : `Add ${formatPrice(FREE_SHIPPING - afterDiscount)} more for FREE delivery`}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <CouponField
              subtotal={subtotal}
              applied={coupon}
              onApply={(c) => dispatch(applyCoupon(c))}
              onRemove={() => dispatch(removeCoupon())}
            />
            <OrderSummary
              subtotal={subtotal}
              savings={savings}
              discount={discount}
              couponCode={coupon?.code}
              shippingFee={shippingFee}
              total={total}
              freeShippingThreshold={FREE_SHIPPING}
            >
              <Button fullWidth size="lg" className="mt-5" rightIcon={<FiArrowRight />} onClick={goToCheckout}>
                Proceed to Checkout
              </Button>
              <Link to={ROUTES.products} className="mt-3 block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
                Continue shopping
              </Link>
            </OrderSummary>
          </div>
        </div>
      </div>
    </>
  );
}
