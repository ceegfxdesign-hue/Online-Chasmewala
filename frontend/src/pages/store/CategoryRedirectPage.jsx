import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/** Preserves category deep links by delegating to the existing filtered catalog. */
export default function CategoryRedirectPage() {
  const { slug } = useParams();
  const search = slug ? `?category=${encodeURIComponent(slug)}` : '';
  return <Navigate to={`${ROUTES.products}${search}`} replace />;
}
