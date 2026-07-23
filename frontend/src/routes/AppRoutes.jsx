import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { StoreLayout } from '@/layouts/StoreLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AccountLayout } from '@/layouts/AccountLayout';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Loader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';

// Storefront
const HomePage = lazy(() => import('@/pages/store/HomePage'));
const ProductsPage = lazy(() => import('@/pages/store/ProductsPage'));
const CategoryRedirectPage = lazy(() => import('@/pages/store/CategoryRedirectPage'));
const ProductDetailsPage = lazy(() => import('@/pages/store/ProductDetailsPage'));
const SearchResultsPage = lazy(() => import('@/pages/store/SearchResultsPage'));
const ComparePage = lazy(() => import('@/pages/store/ComparePage'));
const CartPage = lazy(() => import('@/pages/store/CartPage'));
const WishlistPage = lazy(() => import('@/pages/store/WishlistPage'));
const CheckoutPage = lazy(() => import('@/pages/store/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/store/OrderSuccessPage'));
const OrderFailedPage = lazy(() => import('@/pages/store/OrderFailedPage'));
const AboutPage = lazy(() => import('@/pages/store/AboutPage'));
const ContactPage = lazy(() => import('@/pages/store/ContactPage'));
const FAQPage = lazy(() => import('@/pages/store/FAQPage'));
const NotFoundPage = lazy(() => import('@/pages/store/NotFoundPage'));

// Legal
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const RefundPolicyPage = lazy(() => import('@/pages/legal/RefundPolicyPage'));

// Account
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const MyOrdersPage = lazy(() => import('@/pages/account/MyOrdersPage'));
const OrderDetailsPage = lazy(() => import('@/pages/account/OrderDetailsPage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));
const CardsPage = lazy(() => import('@/pages/account/CardsPage'));
const CouponsPage = lazy(() => import('@/pages/account/CouponsPage'));
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'));
const ReturnsPage = lazy(() => import('@/pages/account/ReturnsPage'));
const MyReviewsPage = lazy(() => import('@/pages/account/MyReviewsPage'));
const SettingsPage = lazy(() => import('@/pages/account/SettingsPage'));

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const OTPVerificationPage = lazy(() => import('@/pages/auth/OTPVerificationPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Admin (kept as a separate lazy chunk so storefront performance is unaffected)
const adminPage = (name) => lazy(() => import('@/pages/admin/AdminPages').then((module) => ({ default: module[name] })));
const DashboardPage = adminPage('DashboardPage');
const AdminOrdersPage = adminPage('OrdersPage');
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const CategoriesPage = adminPage('CategoriesPage');
const BrandsPage = adminPage('BrandsPage');
const AdminCouponsPage = adminPage('CouponsPage');
const BannersPage = adminPage('BannersPage');
const ReviewsPage = adminPage('ReviewsPage');
const AdminReturnsPage = adminPage('ReturnsPage');
const AdminUsersPage = adminPage('UsersPage');
const InventoryPage = adminPage('InventoryPage');
const ReportsPage = adminPage('ReportsPage');
const AdminSettingsPage = adminPage('SettingsPage');

/**
 * Application route table. Storefront + static pages render inside StoreLayout;
 * auth pages render inside AuthLayout. Product, cart, account and admin routes
 * are added in their respective phases.
 */
export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader fullscreen />}>
        <Routes>
          {/* Storefront shell */}
          <Route element={<StoreLayout />}>
            <Route index path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.products} element={<ProductsPage />} />
            <Route path={ROUTES.category()} element={<CategoryRedirectPage />} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path={ROUTES.search} element={<SearchResultsPage />} />
            <Route path={ROUTES.compare} element={<ComparePage />} />
            <Route path={ROUTES.cart} element={<CartPage />} />
            <Route path={ROUTES.wishlist} element={<WishlistPage />} />
            <Route
              path={ROUTES.checkout}
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/success/:orderNumber"
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route path={ROUTES.orderFailed} element={<OrderFailedPage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.contact} element={<ContactPage />} />
            <Route path={ROUTES.faq} element={<FAQPage />} />
            <Route path={ROUTES.privacy} element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.terms} element={<TermsPage />} />
            <Route path={ROUTES.refund} element={<RefundPolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Account (protected) */}
          <Route element={<StoreLayout />}>
            <Route
              path={ROUTES.account}
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to={ROUTES.profile} replace />} />
              <Route path={ROUTES.profile} element={<ProfilePage />} />
              <Route path={ROUTES.orders} element={<MyOrdersPage />} />
              <Route path="/account/orders/:orderNumber" element={<OrderDetailsPage />} />
              <Route path={ROUTES.addresses} element={<AddressesPage />} />
              <Route path={ROUTES.cards} element={<CardsPage />} />
              <Route path={ROUTES.coupons} element={<CouponsPage />} />
              <Route path={ROUTES.notifications} element={<NotificationsPage />} />
              <Route path={ROUTES.returns} element={<ReturnsPage />} />
              <Route path={ROUTES.reviews} element={<MyReviewsPage />} />
              <Route path={ROUTES.settings} element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Auth shell */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.signup} element={<SignupPage />} />
            <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.otp} element={<OTPVerificationPage />} />
            <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
          </Route>

          {/* Admin (role protected) */}
          <Route
            path={ROUTES.admin}
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default AppRoutes;
