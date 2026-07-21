import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Logo } from '@/components/common/Logo';
import { slideUp } from '@/lib/motion';

/**
 * Split-screen layout for authentication pages: a branded panel on the left and
 * the form (rendered via <Outlet />) on the right. Collapses to a single column
 * on mobile.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      {/* Brand panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
        <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />

        <Link to="/" aria-label="Online Chasmewala home">
          <Logo variant="light" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-h1 text-white">
            See clearly. <span className="text-brand-400">Shop confidently.</span>
          </h1>
          <p className="mt-4 text-white/70">
            Thousands of frames, prescription lenses and sunglasses — with easy returns and a
            14-day fit guarantee.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/40">
          © {new Date().getFullYear()} Online Chasmewala
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex w-full flex-col items-center justify-center bg-surface-muted px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Link to="/" aria-label="Online Chasmewala home">
            <Logo />
          </Link>
        </div>
        <motion.div {...slideUp} className="w-full max-w-md">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

export default AuthLayout;
