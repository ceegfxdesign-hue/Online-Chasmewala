import { NavLink, Outlet, Link } from 'react-router-dom';
import { FiBarChart2, FiBox, FiGrid, FiImage, FiPackage, FiPercent, FiRefreshCw, FiSettings, FiStar, FiTruck, FiUsers } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { Logo } from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const navigation = [
  [ROUTES.admin, 'Dashboard', FiBarChart2, true], [ROUTES.adminOrders, 'Orders', FiPackage], [ROUTES.adminProducts, 'Products', FiBox],
  [ROUTES.adminCategories, 'Categories', FiGrid], [ROUTES.adminBrands, 'Brands', FiGrid], [ROUTES.adminInventory, 'Inventory', FiTruck],
  [ROUTES.adminCoupons, 'Coupons', FiPercent], [ROUTES.adminBanners, 'Banners', FiImage], [ROUTES.adminReviews, 'Reviews', FiStar],
  [ROUTES.adminReturns, 'Returns', FiRefreshCw], [ROUTES.adminUsers, 'Users', FiUsers], [ROUTES.adminReports, 'Reports', FiBarChart2],
  [ROUTES.adminSettings, 'Settings', FiSettings],
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-navy-50">
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <header className="sticky top-0 z-20 border-b border-navy-100 bg-surface px-4 py-3 lg:hidden"><Link to={ROUTES.admin}><Logo /></Link></header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-navy-100 bg-surface p-5 lg:flex">
        <Link to={ROUTES.admin} className="mb-8"><Logo /></Link>
        <nav aria-label="Admin" className="space-y-1">
          {navigation.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand-500 text-white' : 'text-navy-600 hover:bg-navy-100')}><Icon className="h-4 w-4" />{label}</NavLink>)}
        </nav>
        <Link to={ROUTES.home} className="mt-auto px-3 text-sm font-medium text-brand-600 hover:text-brand-700">View storefront →</Link>
      </aside>
      <main className="min-w-0 lg:pl-64"><div className="container-page py-6 lg:py-8"><nav aria-label="Admin sections" className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">{navigation.map(([to, label]) => <NavLink key={to} to={to} end={to === ROUTES.admin} className={({ isActive }) => cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold', isActive ? 'bg-brand-500 text-white' : 'bg-surface text-navy-600')}>{label}</NavLink>)}</nav><Outlet /></div></main>
    </div>
  );
}

export default AdminLayout;
