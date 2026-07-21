import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ProductCard } from './ProductCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

/**
 * Horizontal, scroll-snapping row of product cards with prev/next controls.
 * Falls back gracefully on touch devices (native scroll).
 */
export function ProductCarousel({ title, eyebrow, subtitle, action, products = [], loading = false }) {
  const scrollerRef = useRef(null);
  if (!loading && !products.length) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="container-page py-12">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} action={action} className="mb-0 flex-1" />
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-colors hover:bg-navy-100"
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-colors hover:bg-navy-100"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <div key={p._id} className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}

export default ProductCarousel;
