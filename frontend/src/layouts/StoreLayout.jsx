import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Loader } from '@/components/ui/Loader';

const CartDrawer = lazy(() => import('@/components/layout/CartDrawer'));
const MobileMenu = lazy(() => import('@/components/layout/MobileMenu'));

/**
 * Primary storefront shell: announcement bar, sticky navbar, page content, and
 * footer, plus the global cart drawer. A skip link keeps keyboard navigation
 * fast and accessible.
 */
export function StoreLayout() {
  const cartDrawerOpen = useSelector((state) => state.ui.cartDrawerOpen);
  const mobileMenuOpen = useSelector((state) => state.ui.mobileMenuOpen);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <AnnouncementBar />
      <Navbar />

      <main id="main-content" className="flex-1">
        <Suspense fallback={<Loader fullscreen />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <Suspense fallback={null}>
        {mobileMenuOpen && <MobileMenu />}
        {cartDrawerOpen && <CartDrawer />}
      </Suspense>
    </div>
  );
}

export default StoreLayout;
