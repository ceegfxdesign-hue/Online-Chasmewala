import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiPause, FiPlay, FiZap } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import eyeglassesImage from '@/assets/hero/trending-eyeglasses.jpg';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import contactLensesImage from '@/assets/hero/trending-contact-lenses.jpg';
import { useGetHeroBannersQuery } from '@/features/banners/bannerApi';
import { ROUTES } from '@/constants/routes';

const FALLBACK_SLIDES = [
  {
    id: 'eyeglasses',
    label: 'Eyeglasses',
    image: eyeglassesImage,
    imageAlt: 'Gold and transparent prescription eyeglasses on an aqua surface',
    to: `${ROUTES.products}?category=eyeglasses`,
    action: 'Shop eyeglasses',
    eyebrow: 'Popular picks this week',
    title: 'Trending style catalog',
    description: 'Explore the most frequently searched frames and shapes across India.',
    tone: 'light',
  },
  {
    id: 'sunglasses',
    label: 'Sunglasses',
    image: sunglassesImage,
    imageAlt: 'Black sunglasses with teal studio lighting',
    to: `${ROUTES.products}?category=sunglasses`,
    action: 'Shop sunglasses',
    eyebrow: 'Made for bright days',
    title: 'Trending style catalog',
    description: 'Statement shades with the protection and polish your day calls for.',
    tone: 'dark',
  },
  {
    id: 'contact-lenses',
    label: 'Contact lenses',
    image: contactLensesImage,
    imageAlt: 'Soft contact lenses with aqua highlights on a white surface',
    to: `${ROUTES.products}?category=contact-lenses`,
    action: 'Shop contact lenses',
    eyebrow: 'Comfort, every day',
    title: 'Trending style catalog',
    description: 'Clear, comfortable vision for every plan and every perspective.',
    tone: 'light',
  },
];

// React 18 passes the browser-supported fetch priority hint as a lowercase attribute.
const HERO_IMAGE_PRIORITY = { fetchpriority: 'high' };

const getSafeDestination = (value) => {
  const destination = typeof value === 'string' ? value.trim() : '';
  if (!destination) return null;

  if (destination.startsWith('/') && !destination.startsWith('//')) {
    return { type: 'internal', value: destination };
  }

  try {
    const url = new URL(destination);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return { type: 'external', value: url.href };
    }
  } catch {
    return null;
  }

  return null;
};

const toHeroSlide = (banner, index) => ({
  id: banner._id || `hero-banner-${index}`,
  label: banner.title || `Banner ${index + 1}`,
  image: banner.image,
  mobileImage: banner.mobileImage || '',
  imageAlt: banner.title || 'Online Chasmewala featured eyewear',
  destination: getSafeDestination(banner.ctaLink),
  action: banner.ctaLabel?.trim() || 'Explore now',
  eyebrow: 'Featured collection',
  title: banner.title,
  description: banner.subtitle || '',
  tone: banner.theme === 'light' ? 'light' : 'dark',
});

function HeroAction({ slide }) {
  const destination = slide.destination ||
    (slide.to ? { type: 'internal', value: slide.to } : null);
  if (!destination) return null;

  const commonProps = {
    size: 'lg',
    rightIcon: <FiArrowRight />,
    className: 'mt-7',
  };

  if (destination.type === 'internal') {
    return (
      <Button as={Link} to={destination.value} {...commonProps}>
        {slide.action}
      </Button>
    );
  }

  return (
    <Button
      as="a"
      href={destination.value}
      target="_blank"
      rel="noopener noreferrer"
      {...commonProps}
    >
      {slide.action}
    </Button>
  );
}

/** Auto-advancing visual catalog hero with category controls. */
export function TrendingCatalogHero() {
  const { data: banners } = useGetHeroBannersQuery();
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const touchStartX = useRef(null);
  const slides = useMemo(() => {
    const activeBanners = Array.isArray(banners) ? banners.filter((banner) => banner?.image) : [];
    return activeBanners.length ? activeBanners.map(toHeroSlide) : FALLBACK_SLIDES;
  }, [banners]);
  const safeActiveIndex = activeIndex < slides.length ? activeIndex : 0;
  const activeSlide = slides[safeActiveIndex];

  useEffect(() => {
    setActiveIndex((index) => (index < slides.length ? index : 0));
  }, [slides.length]);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (userPaused || reducedMotion || slides.length < 2) return undefined;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [safeActiveIndex, slides.length, userPaused]);

  const dark = activeSlide.tone === 'dark';
  const controlButtonClass = dark
    ? 'flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-navy-900/45 text-white shadow-soft backdrop-blur-sm transition-all hover:scale-105 hover:bg-navy-900/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
    : 'flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/10 bg-white/80 text-navy-900 shadow-soft backdrop-blur-sm transition-all hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';
  const goToPrevious = () => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  };
  const goToNext = () => {
    setActiveIndex((index) => (index + 1) % slides.length);
  };
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event) => {
    const endX = event.changedTouches[0]?.clientX;
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null || endX === undefined || Math.abs(startX - endX) < 50) return;
    if (startX > endX) goToNext();
    else goToPrevious();
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Trending style catalog"
      className="catalog-hero relative isolate min-h-[25rem] overflow-hidden bg-navy-900 sm:min-h-[29rem] lg:min-h-[32rem]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      <picture key={activeSlide.id}>
        {activeSlide.mobileImage && (
          <source media="(max-width: 639px)" srcSet={activeSlide.mobileImage} />
        )}
        <img
          src={activeSlide.image}
          width="1980"
          height="800"
          alt={activeSlide.imageAlt}
          {...HERO_IMAGE_PRIORITY}
          className="catalog-hero-image absolute inset-0 -z-20 h-full w-full animate-catalog-pan object-cover object-[68%_center]"
        />
      </picture>
      <div
        className={
          dark
            ? 'catalog-hero-overlay absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/85 via-navy-900/45 to-navy-900/5'
            : 'catalog-hero-overlay absolute inset-0 -z-10 bg-gradient-to-r from-hero/95 via-hero/60 to-transparent'
        }
      />

      <div className="container-page flex min-h-[25rem] flex-col py-10 sm:min-h-[29rem] lg:min-h-[32rem] lg:py-14">
        <div className="max-w-xl animate-catalog-enter">
          <span
            className={
              dark
                ? 'catalog-hero-eyebrow inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm'
                : 'catalog-hero-eyebrow inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-navy-700 backdrop-blur-sm'
            }
          >
            <FiZap className="text-brand-500" />
            {activeSlide.eyebrow}
          </span>
          <h1 className={dark ? 'catalog-hero-title mt-5 text-h1 text-white sm:text-display' : 'catalog-hero-title mt-5 text-h1 sm:text-display'}>
            {activeSlide.title}
          </h1>
          {activeSlide.description && (
            <p
              className={
                dark
                  ? 'catalog-hero-description mt-4 max-w-lg text-base text-white/80 sm:text-lg'
                  : 'catalog-hero-description mt-4 max-w-lg text-base text-navy-700 sm:text-lg'
              }
            >
              {activeSlide.description}
            </p>
          )}
          <HeroAction slide={activeSlide} />
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Show previous banner"
            className={`${controlButtonClass} absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-5 lg:left-8`}
          >
            <FiChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Show next banner"
            className={`${controlButtonClass} absolute right-3 top-1/2 z-20 -translate-y-1/2 sm:right-5 lg:right-8`}
          >
            <FiChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <div
            role="tablist"
            aria-label="Choose a featured banner"
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
          >
            {slides.map((slide, index) => {
              const isActive = index === safeActiveIndex;
              return (
                <button
                  key={slide.id}
                  id={`catalog-tab-${slide.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="catalog-slide"
                  aria-label={`Show banner ${index + 1}: ${slide.label}`}
                  onClick={() => setActiveIndex(index)}
                  className={`rounded-full shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? dark
                        ? 'h-3 w-3 bg-white'
                        : 'h-3 w-3 bg-navy-900'
                      : dark
                        ? 'h-2.5 w-2.5 bg-white/45 hover:bg-white/80'
                        : 'h-2.5 w-2.5 bg-navy-900/35 hover:bg-navy-900/70'
                  }`}
                >
                  <span className="sr-only">{slide.label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused((value) => !value)}
            aria-label={userPaused ? 'Resume automatic banner rotation' : 'Pause automatic banner rotation'}
            aria-pressed={userPaused}
            className="sr-only focus:not-sr-only focus:absolute focus:bottom-12 focus:left-1/2 focus:z-30 focus:-translate-x-1/2 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            {userPaused ? <FiPlay className="mr-2 inline" aria-hidden="true" /> : <FiPause className="mr-2 inline" aria-hidden="true" />}
            {userPaused ? 'Resume banners' : 'Pause banners'}
          </button>
        </>
      )}
      <span
        id="catalog-slide"
        role="tabpanel"
        aria-labelledby={slides.length > 1 ? `catalog-tab-${activeSlide.id}` : undefined}
        aria-live={userPaused ? 'polite' : 'off'}
        className="sr-only"
      >
        {activeSlide.label}: {activeSlide.description}
      </span>
    </section>
  );
}

export default TrendingCatalogHero;
