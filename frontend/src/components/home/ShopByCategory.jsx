import { Link } from 'react-router-dom';
import { FiTag } from 'react-icons/fi';
import { ROUTES } from '@/constants/routes';
import { useGetHomeCategoryImagesQuery } from '@/features/settings/settingsApi';

const CATEGORIES = [
  { label: 'Men', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=men`, imageKey: 'men' },
  { label: 'Women', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=women`, imageKey: 'women' },
  { label: 'Kids', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=kids`, imageKey: 'kids' },
  { label: 'On sale', detail: 'Great offers', to: `${ROUTES.products}?onOffer=true`, icon: FiTag },
];

function CategoryCard({ item, categoryImages }) {
  const Icon = item.icon;
  const image = categoryImages?.eyeglasses?.[item.imageKey];

  return (
    <Link
      to={item.to}
      className="group flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-3xl border border-navy-100 bg-surface px-4 py-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card sm:min-h-56"
    >
      <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-subtle shadow-soft sm:h-32 sm:w-32 lg:h-36 lg:w-36">
        {image ? (
          <img
            src={image}
            width="192"
            height="192"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-warning-light text-warning-dark">
            <Icon className="h-9 w-9" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-navy-900">{item.label}</span>
      <span className="mt-1 text-xs text-navy-400">{item.detail}</span>
    </Link>
  );
}

/** Primary four-way shopping shortcuts for the home page. */
export function ShopByCategory() {
  const { data: categoryImages } = useGetHomeCategoryImagesQuery();

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="flex flex-col gap-4 border-b border-navy-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
            Curated eyewear styles
          </span>
          <h2 className="mt-3 text-h2 uppercase text-navy-900">Shop by category</h2>
          <p className="mt-2 max-w-2xl text-navy-500">Find the perfect fit, lens type and everyday style.</p>
        </div>
        <Link to={ROUTES.products} className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">
          View all categories <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CATEGORIES.map((item) => <CategoryCard key={item.label} item={item} categoryImages={categoryImages} />)}
      </div>
    </section>
  );
}

export default ShopByCategory;
