import { Link } from 'react-router-dom';

/**
 * Desktop mega-menu panel for a top-level nav item. Rendered on hover/focus of
 * its trigger in the Navbar.
 */
export function MegaMenu({ item, onNavigate }) {
  if (!item.columns?.length) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-40 animate-slide-up border-t border-navy-100 bg-surface shadow-elevated">
      <div className="container-page grid grid-cols-2 gap-8 py-8 md:grid-cols-4">
        {item.columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-400">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={onNavigate}
                    className="text-sm text-navy-700 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-2 hidden rounded-2xl bg-gradient-to-br from-brand-500 to-navy-900 p-6 text-white md:col-span-1 md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Featured</p>
            <p className="mt-2 text-lg font-bold">Shop the {item.label} edit</p>
          </div>
          <Link
            to={`/products?category=${item.slug}`}
            onClick={onNavigate}
            className="mt-4 inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-white/90"
          >
            Shop all
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MegaMenu;
