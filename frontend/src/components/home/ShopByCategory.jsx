import { Link } from 'react-router-dom';
import { FiDroplet, FiEye, FiShoppingBag, FiSun, FiTag } from 'react-icons/fi';
import { ROUTES } from '@/constants/routes';
import { useGetHomeCategoryImagesQuery } from '@/features/settings/settingsApi';

const GROUPS = [
  {
    title: 'Eyeglasses',
    badge: 'With power',
    items: [
      { label: 'Men', to: `${ROUTES.products}?category=eyeglasses&gender=men`, image: 'oc-eyeglasses-men', imageGroup: 'eyeglasses', imageKey: 'men' },
      { label: 'Women', to: `${ROUTES.products}?category=eyeglasses&gender=women`, image: 'oc-eyeglasses-women', imageGroup: 'eyeglasses', imageKey: 'women' },
      { label: 'Kids', to: `${ROUTES.products}?category=eyeglasses&gender=kids`, image: 'oc-eyeglasses-kids', imageGroup: 'eyeglasses', imageKey: 'kids' },
      { label: 'On sale', to: `${ROUTES.products}?category=eyeglasses&onOffer=true`, icon: FiTag, tint: 'bg-brand-50 text-brand-600' },
    ],
  },
  {
    title: 'Sunglasses',
    badge: 'UV protected',
    items: [
      { label: 'Men', to: `${ROUTES.products}?category=sunglasses&gender=men`, image: 'oc-sunglasses-men', imageGroup: 'sunglasses', imageKey: 'men' },
      { label: 'Women', to: `${ROUTES.products}?category=sunglasses&gender=women`, image: 'oc-sunglasses-women', imageGroup: 'sunglasses', imageKey: 'women' },
      { label: 'Kids', to: `${ROUTES.products}?category=sunglasses&gender=kids`, image: 'oc-sunglasses-kids', imageGroup: 'sunglasses', imageKey: 'kids' },
      { label: 'On sale', to: `${ROUTES.products}?category=sunglasses&onOffer=true`, icon: FiSun, tint: 'bg-warning-light text-warning-dark' },
    ],
  },
  {
    title: 'Contact Lenses',
    badge: 'Daily comfort',
    items: [
      { label: 'Clear', to: `${ROUTES.products}?category=contact-lenses`, icon: FiEye, tint: 'bg-brand-50 text-brand-600' },
      { label: 'Color', to: `${ROUTES.products}?category=contact-lenses&sort=newest`, icon: FiDroplet, tint: 'bg-accent-400/15 text-brand-700' },
      { label: 'Solutions', to: `${ROUTES.products}?category=accessories`, icon: FiShoppingBag, tint: 'bg-navy-100 text-navy-700' },
      { label: 'Trial packs', to: `${ROUTES.products}?category=contact-lenses&onOffer=true`, icon: FiTag, tint: 'bg-warning-light text-warning-dark' },
    ],
  },
];

function CategoryCard({ item, categoryImages }) {
  const Icon = item.icon;
  const configuredImage = categoryImages?.[item.imageGroup]?.[item.imageKey];

  return (
    <Link
      to={item.to}
      className="group relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-3xl border border-navy-100 bg-surface px-4 py-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card sm:min-h-56"
    >
      <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-subtle shadow-soft sm:h-32 sm:w-32 lg:h-36 lg:w-36">
        {item.image ? (
          <img
            src={configuredImage || `https://picsum.photos/seed/${item.image}/192/192`}
            width="192"
            height="192"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className={`flex h-full w-full items-center justify-center ${item.tint}`}>
            <Icon className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-navy-900">{item.label}</span>
    </Link>
  );
}

/** Grouped category shortcuts for the home page. */
export function ShopByCategory() {
  const { data: categoryImages } = useGetHomeCategoryImagesQuery();

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="border-b border-navy-200 pb-6">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          Curated eyewear styles
        </span>
        <h2 className="mt-3 text-h2 uppercase text-navy-900">Shop by category</h2>
        <p className="mt-2 max-w-2xl text-navy-500">Browse popular segments to find your fit, lens type and everyday style.</p>
      </div>

      <div className="divide-y divide-navy-100">
        {GROUPS.map((group) => (
          <div key={group.title} className="py-8 first:pt-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <h3 className="text-h3 text-navy-900">{group.title}</h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                {group.badge}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {group.items.map((item) => <CategoryCard key={item.label} item={item} categoryImages={categoryImages} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShopByCategory;
