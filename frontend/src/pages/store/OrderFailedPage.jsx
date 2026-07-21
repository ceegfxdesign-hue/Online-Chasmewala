import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export default function OrderFailedPage() {
  const location = useLocation();
  const reason = location.state?.reason;

  return (
    <>
      <Helmet>
        <title>Payment Failed · Online Chasmewala</title>
      </Helmet>

      <div className="container-page py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-light text-error">
            <FiXCircle className="h-11 w-11" />
          </div>
          <h1 className="text-h1 text-navy-900">Payment unsuccessful</h1>
          <p className="mt-3 text-navy-500">
            {reason || 'We couldn’t process your payment. Don’t worry — your cart is saved and you haven’t been charged.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to={ROUTES.checkout} leftIcon={<FiRefreshCw />}>
              Try again
            </Button>
            <Button as={Link} to={ROUTES.cart} variant="outline">
              Back to cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
