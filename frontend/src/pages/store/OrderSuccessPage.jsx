import { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useGetOrderQuery } from '@/features/cart/cartApi';
import { formatPrice, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const passed = location.state?.order;
  // Prefer the order passed via navigation; otherwise fetch it.
  const { data: fetched } = useGetOrderQuery(orderNumber, { skip: Boolean(passed) });
  const order = passed || fetched;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Order Confirmed · Online Chasmewala</title>
      </Helmet>

      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-light text-success"
          >
            <FiCheckCircle className="h-11 w-11" />
          </motion.div>

          <h1 className="text-h1 text-navy-900">Thank you for your order!</h1>
          <p className="mt-3 text-navy-500">
            Your order <span className="font-semibold text-navy-900">{orderNumber}</span> has been placed
            successfully. A confirmation has been sent to your email.
          </p>

          {order && (
            <div className="mt-8 rounded-2xl bg-surface p-6 text-left shadow-card">
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <div>
                  <p className="text-sm text-navy-400">Order number</p>
                  <p className="font-semibold text-navy-900">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-navy-400">Total paid</p>
                  <p className="font-bold text-navy-900">{formatPrice(order.pricing.total)}</p>
                </div>
              </div>

              {order.estimatedDeliveryAt && (
                <div className="flex items-center gap-2 py-4 text-sm text-navy-600">
                  <FiPackage className="h-4 w-4 text-brand-500" />
                  Estimated delivery by {formatDate(order.estimatedDeliveryAt)}
                </div>
              )}

              <ul className="space-y-3 border-t border-navy-100 pt-4">
                {order.items.map((item) => (
                  <li key={item._id} className="flex items-center gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{item.name}</p>
                      <p className="text-xs text-navy-400">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-navy-900">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to={ROUTES.orderDetails(orderNumber)} rightIcon={<FiArrowRight />}>
              Track your order
            </Button>
            <Button as={Link} to={ROUTES.products} variant="outline">
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
