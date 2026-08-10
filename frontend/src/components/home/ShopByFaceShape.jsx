import { Link } from 'react-router-dom';
import eyeglassesImage from '@/assets/hero/trending-eyeglasses.jpg';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ROUTES } from '@/constants/routes';

const STYLES = [
  { label: 'Wayfarer', image: sunglassesImage, to: `${ROUTES.products}?frameShape=wayfarer`, position: 'object-[42%_center]' },
  { label: 'Round', image: eyeglassesImage, to: `${ROUTES.products}?frameShape=round`, position: 'object-[60%_center]' },
  { label: 'Rectangle', image: eyeglassesImage, to: `${ROUTES.products}?frameShape=rectangle`, position: 'object-[72%_center]' },
  { label: 'Cat-eye', image: sunglassesImage, to: `${ROUTES.products}?frameShape=cat-eye`, position: 'object-[72%_center]' },
];

/** Editorial frame-shape collection links for the home page. */
export function ShopByFaceShape() {
  return (
    <section className="container-page py-14 sm:py-20">
      <SectionHeading
        eyebrow="Explore our collections"
        title="Shop by style"
        action={{ label: 'View all collections', to: ROUTES.products }}
        className="mb-7"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STYLES.map((style) => (
          <Link
            key={style.label}
            to={style.to}
            className="group overflow-hidden rounded-2xl border border-navy-100 bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
          >
            <div className="aspect-[1.35] overflow-hidden bg-surface-subtle">
              <img
                src={style.image}
                alt={`${style.label} frame styles`}
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${style.position}`}
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-bold uppercase tracking-wide text-navy-900">{style.label}</p>
              <p className="mt-1 text-xs text-navy-400">Frames</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ShopByFaceShape;
