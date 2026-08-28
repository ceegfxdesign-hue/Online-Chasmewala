import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { FiMapPin, FiCreditCard, FiTruck, FiZap, FiLock } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Radio } from '@/components/ui/Radio';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { zodResolver } from '@/lib/validators';
import {
  useMergeCartMutation,
  usePlaceOrderMutation,
} from '@/features/cart/cartApi';
import { selectCartItems, selectCartSubtotal, selectCoupon, clearCart } from '@/features/cart/cartSlice';
import { selectIsAuthenticated, selectUser } from '@/features/auth/authSlice';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const FREE_SHIPPING = 999;
const SHIPPING = { standard: 49, express: 129 };

const addressSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone'),
  line1: z.string().min(3, 'Enter your address'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(2, 'Enter your state'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit / Debit Card', icon: FiCreditCard },
  { value: 'upi', label: 'UPI', icon: FiZap },
  { value: 'netbanking', label: 'Net Banking', icon: FiLock },
  { value: 'cod', label: 'Cash on Delivery', icon: FiTruck },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const coupon = useSelector(selectCoupon);
  const hadCartItems = useRef(items.length > 0);

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [mergeCart] = useMergeCartMutation();
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultAddress
      ? {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          line1: defaultAddress.line1,
          line2: defaultAddress.line2 || '',
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
        }
      : { fullName: user?.name || '' },
  });

  if (!isAuth) return <Navigate to={ROUTES.login} replace state={{ from: ROUTES.checkout }} />;
  if (items.length === 0 && !hadCartItems.current) return <Navigate to={ROUTES.cart} replace />;

  const discount = coupon?.discount || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingFee =
    deliveryMethod === 'express' ? SHIPPING.express : afterDiscount >= FREE_SHIPPING ? 0 : SHIPPING.standard;
  const total = afterDiscount + shippingFee;

  const onSubmit = async (address) => {
    try {
      // Sync the client cart to the server (source of truth for pricing/stock).
      await mergeCart(
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          color: i.color,
          quantity: i.quantity,
          lensOption: i.lensOption,
        }))
      ).unwrap();

      const order = await placeOrder({
        shippingAddress: { ...address, country: 'India' },
        deliveryMethod,
        couponCode: coupon?.code,
        paymentMethod,
        paymentToken: paymentMethod === 'cod' ? undefined : 'tok_ok',
      }).unwrap();

      toast.success('Order placed successfully!');
      navigate(ROUTES.orderSuccess(order.orderNumber), { state: { order } });
      dispatch(clearCart());
    } catch (err) {
      if (err?.status === 402) {
        navigate(ROUTES.orderFailed, { state: { reason: err.message } });
      } else {
        toast.error(err?.message || 'Could not place your order');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout · Online Chasmewala</title>
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumb
          className="mb-4"
          items={[{ label: 'Home', to: ROUTES.home }, { label: 'Cart', to: ROUTES.cart }, { label: 'Checkout' }]}
        />
        <h1 className="mb-6 text-h2 text-navy-900">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Address */}
            <section className="rounded-2xl bg-surface p-6 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 text-h4 text-navy-900">
                <FiMapPin className="text-brand-500" /> Shipping Address
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" error={errors.fullName?.message} {...field('fullName')} />
                <Input label="Phone" type="tel" error={errors.phone?.message} {...field('phone')} />
                <Input containerClassName="sm:col-span-2" label="Address line 1" error={errors.line1?.message} {...field('line1')} />
                <Input containerClassName="sm:col-span-2" label="Address line 2 (optional)" {...field('line2')} />
                <Input label="City" error={errors.city?.message} {...field('city')} />
                <Input label="State" error={errors.state?.message} {...field('state')} />
                <Input label="Pincode" error={errors.pincode?.message} {...field('pincode')} />
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-2xl bg-surface p-6 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 text-h4 text-navy-900">
                <FiTruck className="text-brand-500" /> Delivery Method
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'standard', label: 'Standard', desc: '4–7 business days', fee: afterDiscount >= FREE_SHIPPING ? 'FREE' : formatPrice(SHIPPING.standard) },
                  { value: 'express', label: 'Express', desc: '2–3 business days', fee: formatPrice(SHIPPING.express) },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-colors',
                      deliveryMethod === opt.value ? 'border-brand-500 bg-brand-50' : 'border-navy-200'
                    )}
                  >
                    <Radio
                      name="delivery"
                      checked={deliveryMethod === opt.value}
                      onChange={() => setDeliveryMethod(opt.value)}
                      label={opt.label}
                      description={opt.desc}
                    />
                    <span className="text-sm font-semibold text-navy-900">{opt.fee}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl bg-surface p-6 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 text-h4 text-navy-900">
                <FiCreditCard className="text-brand-500" /> Payment Method
              </h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
                      paymentMethod === m.value ? 'border-brand-500 bg-brand-50' : 'border-navy-200'
                    )}
                  >
                    <Radio name="payment" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                    <m.icon className="h-5 w-5 text-navy-500" />
                    <span className="text-sm font-medium text-navy-800">{m.label}</span>
                  </label>
                ))}
              </div>
              {paymentMethod !== 'cod' && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-navy-400">
                  <FiLock className="h-3.5 w-3.5" /> This is a demo checkout — no real payment is processed.
                </p>
              )}
            </section>
          </div>

          {/* Summary */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              couponCode={coupon?.code}
              shippingFee={shippingFee}
              total={total}
              freeShippingThreshold={FREE_SHIPPING}
              className="sticky top-24"
            >
              <Button type="submit" fullWidth size="lg" className="mt-5" loading={placing} leftIcon={<FiLock />}>
                Place Order · {formatPrice(total)}
              </Button>
              <p className="mt-3 text-center text-xs text-navy-400">
                By placing your order you agree to our Terms & Conditions.
              </p>
            </OrderSummary>
          </div>
        </form>
      </div>
    </>
  );
}
