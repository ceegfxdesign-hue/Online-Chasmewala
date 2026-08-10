import { Link } from 'react-router-dom';
import { FiDroplet, FiEye, FiPackage, FiShoppingBag, FiSun, FiTag } from 'react-icons/fi';
import eyeglassesImage from '@/assets/hero/trending-eyeglasses.jpg';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import { ROUTES } from '@/constants/routes';
import { useGetHomeCategoryImagesQuery } from '@/features/settings/settingsApi';

const CATEGORY_SECTIONS = [
  {
    title: 'Eyeglasses',
    label: 'With power',
    imageGroup: 'eyeglasses',
    cards: [
      { label: 'Men', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=men`, imageKey: 'men', fallbackImage: eyeglassesImage },
      { label: 'Women', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=women`, imageKey: 'women', fallbackImage: eyeglassesImage },
      { label: 'Kids', detail: 'Explore styles', to: `${ROUTES.products}?category=eyeglasses&gender=kids`, imageKey: 'kids', fallbackImage: eyeglassesImage },
      { label: 'On sale', detail: 'Great offers', to: `${ROUTES.products}?category=eyeglasses&onOffer=true`, icon: FiTag, iconTone: 'brand' },
    ],
  },
  {
    title: 'Sunglasses',
    label: 'UV protected',
    imageGroup: 'sunglasses',
    cards: [
      { label: 'Men', detail: 'Explore styles', to: `${ROUTES.products}?category=sunglasses&gender=men`, imageKey: 'men', fallbackImage: sunglassesImage },
      { label: 'Women', detail: 'Explore styles', to: `${ROUTES.products}?category=sunglasses&gender=women`, imageKey: 'women', fallbackImage: sunglassesImage },
      { label: 'Kids', detail: 'Explore styles', to: `${ROUTES.products}?category=sunglasses&gender=kids`, imageKey: 'kids', fallbackImage: sunglassesImage },
      { label: 'On sale', detail: 'Great offers', to: `${ROUTES.products}?category=sunglasses&onOffer=true`, icon: FiSun, iconTone: 'gold' },
    ],
  },
  {
    title: 'Contact lenses & accessories',
    label: 'Daily comfort',
    cards: [
      { label: 'Clear', detail: 'Daily comfort', to: `${ROUTES.products}?category=contact-lenses&search=clear`, icon: FiEye, iconTone: 'brand' },
      { label: 'Color', detail: 'Express yourself', to: `${ROUTES.products}?category=contact-lenses&search=color`, icon: FiDroplet, iconTone: 'brand' },
      { label: 'Solutions', detail: 'Lens care', to: `${ROUTES.products}?category=accessories&search=lens`, icon: FiShoppingBag, iconTone: 'navy' },
      { label: 'Trial packs', detail: 'Try before you commit', to: `${ROUTES.products}?category=contact-lenses&search=pack`, icon: FiPackage, iconTone: 'gold' },
    ],
  },
];

const ICON_TONES = {
  brand: 'bg-brand-50 text-brand-600',
  gold: 'bg-warning-light text-warning-dark',
  navy: 'bg-navy-50 text-navy-700',
};

function CategoryCard({ item, imageGroup, categoryImages }) {
  const Icon = item.icon;
  const image = imageGroup ? categoryImages?.[imageGroup]?.[item.imageKey] || item.fallbackImage : null;

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
        ) : Icon ? (
          <span className={`flex h-full w-full items-center justify-center ${ICON_TONES[item.iconTone] || ICON_TONES.brand}`}>
            <Icon className="h-9 w-9" aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-navy-900">{item.label}</span>
      <span className="mt-1 text-xs text-navy-400">{item.detail}</span>
    </Link>
  );
}

function CategorySection({ section, categoryImages, isLast }) {
  return (
    <section className={isLast ? 'pt-10 sm:pt-12' : 'border-b border-navy-100 py-10 sm:py-12'}>
      <div className="flex items-center gap-3">
        <h3 className="text-h3 text-navy-900">{section.title}</h3>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-700">
          {section.label}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {section.cards.map((item) => (
          <CategoryCard key={item.label} item={item} imageGroup={section.imageGroup} categoryImages={categoryImages} />
        ))}
      </div>
    </section>
  );
}

/** Grouped shopping shortcuts for eyewear, sunglasses and contact lenses. */
export function ShopByCategory() {
  const { data: categoryImages } = useGetHomeCategoryImagesQuery();

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="border-b border-navy-200 pb-6">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          Curated eyewear styles
        </span>
        <h2 className="mt-3 text-h2 uppercase text-navy-900">Shop by category</h2>
        <p className="mt-2 max-w-2xl text-navy-500">Pick from our popular segments to find the right fit, lens type and everyday style.</p>
      </div>

      {CATEGORY_SECTIONS.map((section, index) => (
        <CategorySection
          key={section.title}
          section={section}
          categoryImages={categoryImages}
          isLast={index === CATEGORY_SECTIONS.length - 1}
        />
      ))}
    </section>
  );
}

export default ShopByCategory;
