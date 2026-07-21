import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';

/**
 * Guards routes that require authentication. While the session is being restored
 * (bootstrap), a loader is shown to avoid a flash of the login page.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <Loader fullscreen label="Loading your account…" />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default ProtectedRoute;
