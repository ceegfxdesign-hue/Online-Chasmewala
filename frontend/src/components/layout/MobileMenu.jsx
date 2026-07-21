import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronRight } from 'react-icons/fi';
import { Drawer } from '@/components/ui/Drawer';
import { closeMobileMenu } from '@/features/ui/uiSlice';
import { MEGA_MENU } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/** Slide-in navigation for small screens. */
export function MobileMenu() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.mobileMenuOpen);
  const { isAuthenticated, user } = useAuth();
  const close = () => dispatch(closeMobileMenu());

  return (
    <Drawer open={open} onClose={close} side="left" title="Menu" width="max-w-xs">
      <nav className="p-2">
        <ul className="space-y-1">
          {MEGA_MENU.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/products?category=${item.slug}`}
                onClick={close}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-navy-800 hover:bg-navy-100"
              >
                {item.label}
                <FiChevronRight className="h-4 w-4 text-navy-300" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-navy-100" />

        <ul className="space-y-1">
          {[
            { label: 'Wishlist', to: ROUTES.wishlist },
            { label: 'Track Orders', to: ROUTES.orders },
            { label: 'About Us', to: ROUTES.about },
            { label: 'Contact', to: ROUTES.contact },
            { label: 'FAQ', to: ROUTES.faq },
          ].map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={close}
                className="block rounded-xl px-3 py-2.5 text-sm text-navy-600 hover:bg-navy-100"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-navy-100 p-4">
        {isAuthenticated ? (
          <Link
            to={ROUTES.account}
            onClick={close}
            className="block rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Hi, {user.name.split(' ')[0]} — My Account
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={ROUTES.login}
              onClick={close}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.signup}
              onClick={close}
              className="rounded-xl border border-navy-200 px-4 py-2.5 text-center text-sm font-semibold text-navy-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default MobileMenu;
