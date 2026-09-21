/** Image-only homepage banner carousel with optional full-banner destinations. */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import eyeglassesImage from '@/assets/hero/trending-eyeglasses.jpg';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import contactLensesImage from '@/assets/hero/trending-contact-lenses.jpg';
import { useGetHeroBannersQuery } from '@/features/banners/bannerApi';
import { ROUTES } from '@/constants/routes';

const FALLBACK_SLIDES = [
  { id: 'eyeglasses', label: 'Eyeglasses', image: eyeglassesImage, imageAlt: 'Gold and transparent prescription eyeglasses on an aqua surface', to: `${ROUTES.products}?category=eyeglasses` },
  { id: 'sunglasses', label: 'Sunglasses', image: sunglassesImage, imageAlt: 'Black sunglasses with teal studio lighting', to: `${ROUTES.products}?category=sunglasses` },
  { id: 'contact-lenses', label: 'Contact lenses', image: contactLensesImage, imageAlt: 'Soft contact lenses with aqua highlights on a white surface', to: `${ROUTES.products}?category=contact-lenses` },
];

const HERO_IMAGE_PRIORITY = { fetchpriority: 'high' };

const getSafeDestination = (value) => {
  const destination = typeof value === 'string' ? value.trim() : '';
  if (!destination) return null;
  if (destination.startsWith('/') && !destination.startsWith('//')) return { type: 'internal', value: destination };
  try {
    const url = new URL(destination);
    if (url.protocol === 'https:' || url.protocol === 'http:') return { type: 'external', value: url.href };
  } catch { /* Invalid links are treated as non-clickable banners. */ }
  return null;
};

const toHeroSlide = (banner, index) => ({
  id: banner._id || `hero-banner-${index}`,
  label: banner.title?.trim() || `Banner ${index + 1}`,
  image: banner.image,
  mobileImage: banner.mobileImage || '',
  imageAlt: banner.title?.trim() || 'Online Chasmewala featured eyewear',
  destination: getSafeDestination(banner.ctaLink),
});

function BannerImage({ slide }) {
  const image = (
    <picture className="block h-full w-full">
      {slide.mobileImage && <source media="(max-width: 639px)" srcSet={slide.mobileImage} />}
      <img src={slide.image} width="1980" height="800" alt={slide.imageAlt} {...HERO_IMAGE_PRIORITY} className="catalog-hero-image block h-full w-full object-cover object-[68%_center]" />
    </picture>
  );
  if (!slide.destination) return image;
  const className = 'block h-full w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-500';
  const ariaLabel = `Open banner destination: ${slide.label}`;
  return slide.destination.type === 'internal'
    ? <Link to={slide.destination.value} aria-label={ariaLabel} className={className}>{image}</Link>
    : <a href={slide.destination.value} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>{image}</a>;
}

/** Auto-advancing image-only catalog banners. */
export function TrendingCatalogHero() {
  const { data: banners } = useGetHeroBannersQuery();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => {
    const activeBanners = Array.isArray(banners) ? banners.filter((banner) => banner?.image) : [];
    return activeBanners.length ? activeBanners.map(toHeroSlide) : FALLBACK_SLIDES;
  }, [banners]);
  const safeActiveIndex = activeIndex < slides.length ? activeIndex : 0;
  const activeSlide = slides[safeActiveIndex];

  useEffect(() => setActiveIndex((index) => (index < slides.length ? index : 0)), [slides.length]);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || slides.length < 2) return undefined;
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % slides.length), 5000);
    return () => window.clearTimeout(timer);
  }, [safeActiveIndex, slides.length]);

  return (
    <section aria-label="Featured banners" className="catalog-hero relative min-h-[25rem] overflow-hidden bg-surface sm:min-h-[29rem] lg:min-h-[32rem]">
      <BannerImage key={activeSlide.id} slide={activeSlide} />
    </section>
  );
}

export default TrendingCatalogHero;
