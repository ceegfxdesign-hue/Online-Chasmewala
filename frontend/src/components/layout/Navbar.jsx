import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiLogOut, FiGrid } from 'react-icons/fi';
import { Logo } from '@/components/common/Logo';
import { MegaMenu } from './MegaMenu';
import { SearchBar } from './SearchBar';
import { MEGA_MENU } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { selectCartCount } from '@/features/cart/cartSlice';
import { selectWishlistCount } from '@/features/wishlist/wishlistSlice';
import { openCartDrawer, toggleMobileMenu } from '@/features/ui/uiSlice';
import { logout } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/utils/cn';

function IconButton({ icon, label, count, onClick, to }) {
  const Comp = to ? Link : 'button';
  return (
    <Comp
      to={to}
      type={to ? undefined : 'button'}
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-700 transition-colors hover:bg-navy-100"
    >
      {icon}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Comp>
  );
}

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  const [activeMenu, setActiveMenu] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  useOnClickOutside(accountRef, () => setAccountOpen(false));

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-surface/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-100 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <Link to={ROUTES.home} aria-label="Online Chasmewala Premium Eyewear — Home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-2 hidden lg:block" onMouseLeave={() => setActiveMenu(null)}>
            <ul className="flex items-center">
              {MEGA_MENU.map((item) => (
                <li key={item.slug} onMouseEnter={() => setActiveMenu(item.slug)}>
                  <Link
                    to={`/products?category=${item.slug}`}
                    className={cn(
                      'flex h-16 items-center px-3.5 text-sm font-medium transition-colors',
                      activeMenu === item.slug ? 'text-brand-600' : 'text-navy-700 hover:text-brand-600'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {activeMenu && (
              <MegaMenu
                item={MEGA_MENU.find((m) => m.slug === activeMenu)}
                onNavigate={() => setActiveMenu(null)}
              />
            )}
          </nav>

          {/* Search */}
          <SearchBar className="ml-auto hidden max-w-xs flex-1 md:block" />

          {/* Actions */}
          <div className={cn('flex items-center gap-0.5', 'md:ml-0 ml-auto')}>
            <IconButton
              to={ROUTES.search}
              label="Search"
              icon={<FiSearch className="h-5 w-5 md:hidden" />}
            />
            <IconButton
              to={ROUTES.wishlist}
              label="Wishlist"
              count={wishlistCount}
              icon={<FiHeart className="h-5 w-5" />}
            />
            <IconButton
              label="Cart"
              count={cartCount}
              onClick={() => dispatch(openCartDrawer())}
              icon={<FiShoppingBag className="h-5 w-5" />}
            />

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                className="flex h-10 items-center gap-1.5 rounded-full px-2 text-navy-700 transition-colors hover:bg-navy-100"
              >
                <FiUser className="h-5 w-5" />
                <span className="hidden text-sm font-medium xl:inline">
                  {isAuthenticated ? user.name.split(' ')[0] : 'Account'}
                </span>
              </button>

              {accountOpen && (
                <AccountMenu
                  isAuthenticated={isAuthenticated}
                  isAdmin={isAdmin}
                  onClose={() => setAccountOpen(false)}
                  onLogout={() => {
                    dispatch(logout());
                    setAccountOpen(false);
                    navigate(ROUTES.home);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AccountMenu({ isAuthenticated, isAdmin, onClose, onLogout }) {
  const link = 'block rounded-lg px-3 py-2 text-sm text-navy-700 transition-colors hover:bg-navy-100';
  return (
    <div className="absolute right-0 top-full mt-2 w-56 animate-scale-in rounded-2xl border border-navy-100 bg-surface p-2 shadow-elevated">
      {isAuthenticated ? (
        <>
          <Link to={ROUTES.profile} className={link} onClick={onClose}>
            My Profile
          </Link>
          <Link to={ROUTES.orders} className={link} onClick={onClose}>
            My Orders
          </Link>
          <Link to={ROUTES.wishlist} className={link} onClick={onClose}>
            Wishlist
          </Link>
          {isAdmin && (
            <Link to={ROUTES.admin} className={cn(link, 'flex items-center gap-2 text-brand-600')} onClick={onClose}>
              <FiGrid className="h-4 w-4" /> Admin Dashboard
            </Link>
          )}
          <div className="my-1 border-t border-navy-100" />
          <button
            type="button"
            onClick={onLogout}
            className={cn(link, 'flex w-full items-center gap-2 text-error')}
          >
            <FiLogOut className="h-4 w-4" /> Sign out
          </button>
        </>
      ) : (
        <div className="p-2">
          <p className="mb-3 text-sm text-navy-500">Access orders, wishlist and faster checkout.</p>
          <Link
            to={ROUTES.login}
            onClick={onClose}
            className="mb-2 block rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-600"
          >
            Sign in
          </Link>
          <Link
            to={ROUTES.signup}
            onClick={onClose}
            className="block rounded-xl border border-navy-200 px-4 py-2.5 text-center text-sm font-semibold text-navy-700 hover:bg-navy-100"
          >
            Create account
          </Link>
        </div>
      )}
    </div>
  );
}

export default Navbar;
