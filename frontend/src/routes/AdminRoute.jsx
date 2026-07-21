import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';

/** Guards admin-only routes; non-admins are sent home, guests to login. */
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <Loader fullscreen label="Checking permissions…" />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) return <Navigate to={ROUTES.home} replace />;
  return children;
}

export default AdminRoute;
