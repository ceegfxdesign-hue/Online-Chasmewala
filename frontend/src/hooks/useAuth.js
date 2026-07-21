import { useSelector } from 'react-redux';
import { selectAuth, selectIsAdmin, selectIsAuthenticated } from '@/features/auth/authSlice';

/** Convenience hook exposing the current auth state. */
export function useAuth() {
  const { user, status, error, bootstrapped } = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  return {
    user,
    status,
    error,
    bootstrapped,
    isAuthenticated,
    isAdmin,
    isLoading: status === 'loading',
  };
}

export default useAuth;
