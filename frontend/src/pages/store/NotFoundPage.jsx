import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found · Online Chasmewala</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-[6rem] font-extrabold leading-none text-brand-500">404</p>
        <h1 className="mt-2 text-h2 text-navy-900">We couldn’t find that page</h1>
        <p className="mt-3 max-w-md text-navy-500">
          The page you’re looking for doesn’t exist or may have moved. Let’s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to={ROUTES.home} leftIcon={<FiArrowLeft />}>
            Back to home
          </Button>
          <Button as={Link} to={ROUTES.products} variant="outline" leftIcon={<FiSearch />}>
            Browse products
          </Button>
        </div>
      </div>
    </>
  );
}
