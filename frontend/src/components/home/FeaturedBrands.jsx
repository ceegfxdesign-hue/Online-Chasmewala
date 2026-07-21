import { Link } from 'react-router-dom';
import { useGetBrandsQuery } from '@/features/products/productApi';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';

/** Featured brands strip. */
export function FeaturedBrands() {
  const { data: brands = [], isLoading } = useGetBrandsQuery({ featured: true });

  if (isLoading) {
    return (
      <section className="container-page py-12">
        <SectionHeading eyebrow="Trusted labels" title="Featured brands" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!brands.length) return null;

  return (
    <section className="container-page py-12">
      <SectionHeading eyebrow="Trusted labels" title="Featured brands" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            to={`${ROUTES.products}?brand=${brand.slug}`}
            className="flex h-24 items-center justify-center rounded-2xl border border-navy-100 bg-surface px-4 text-center font-display text-lg font-bold text-navy-800 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:text-brand-600 hover:shadow-card"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeaturedBrands;
