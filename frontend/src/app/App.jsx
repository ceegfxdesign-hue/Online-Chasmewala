import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store/store';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { bootstrapAuth, clearAuth } from '@/features/auth/authSlice';
import { setAuthClearedHandler } from '@/services/api';

/**
 * Restores the session on load (via the refresh cookie) and wires the axios
 * "auth cleared" handler to the store so a failed refresh logs the user out.
 */
function AppBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setAuthClearedHandler(() => dispatch(clearAuth()));
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <AppBootstrap>
            <AppRoutes />
          </AppBootstrap>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}
