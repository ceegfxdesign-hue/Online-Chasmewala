import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiTag,
  FiBell,
  FiRefreshCw,
  FiStar,
  FiSettings,
  FiLogOut,
  FiHeart,
} from 'react-icons/fi';
import { logout } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const NAV = [
  { to: ROUTES.profile, label: 'My Profile', icon: FiUser },
  { to: ROUTES.orders, label: 'My Orders', icon: FiPackage },
  { to: ROUTES.wishlist, label: 'Wishlist', icon: FiHeart },
  { to: ROUTES.addresses, label: 'Addresses', icon: FiMapPin },
  { to: ROUTES.cards, label: 'Saved Cards', icon: FiCreditCard },
  { to: ROUTES.coupons, label: 'Coupons', icon: FiTag },
  { to: ROUTES.notifications, label: 'Notifications', icon: FiBell },
  { to: ROUTES.returns, label: 'Returns', icon: FiRefreshCw },
  { to: ROUTES.reviews, label: 'My Reviews', icon: FiStar },
  { to: ROUTES.settings, label: 'Settings', icon: FiSettings },
];

/**
 * Account area shell: profile header + sidebar navigation on desktop,
 * horizontally scrollable tabs on mobile.
 */
export function AccountLayout() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.home);
  };

  return (
    <div className="container-page py-8">
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-h3 text-navy-900">Hi, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-navy-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside>
          <nav
            aria-label="Account"
            className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-navy-600 hover:bg-navy-100 hover:text-navy-900'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={onLogout}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error-light"
            >
              <FiLogOut className="h-4 w-4 shrink-0" /> Sign out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
