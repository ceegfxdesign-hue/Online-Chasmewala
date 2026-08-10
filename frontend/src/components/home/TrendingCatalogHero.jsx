import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import eyeglassesImage from '@/assets/hero/trending-eyeglasses.jpg';
import sunglassesImage from '@/assets/hero/trending-sunglasses.jpg';
import contactLensesImage from '@/assets/hero/trending-contact-lenses.jpg';
import { ROUTES } from '@/constants/routes';

const SLIDES = [
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

/** Auto-advancing visual catalog hero with category controls. */
export function TrendingCatalogHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeSlide = SLIDES[activeIndex];

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % SLIDES.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const dark = activeSlide.tone === 'dark';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Trending style catalog"
      className="catalog-hero relative isolate min-h-[25rem] overflow-hidden bg-navy-900 sm:min-h-[29rem] lg:min-h-[32rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <img
        key={activeSlide.id}
        src={activeSlide.image}
        width="1980"
        height="800"
        alt={activeSlide.imageAlt}
        className="catalog-hero-image absolute inset-0 -z-20 h-full w-full animate-catalog-pan object-cover object-[68%_center]"
      />
      <div
        className={
          dark
            ? 'catalog-hero-overlay absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/85 via-navy-900/45 to-navy-900/5'
            : 'catalog-hero-overlay absolute inset-0 -z-10 bg-gradient-to-r from-hero/95 via-hero/60 to-transparent'
        }
      />

      <div className="container-page flex min-h-[25rem] flex-col justify-between py-10 sm:min-h-[29rem] lg:min-h-[32rem] lg:py-14">
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
          <p className={dark ? 'catalog-hero-description mt-4 max-w-lg text-base text-white/80 sm:text-lg' : 'catalog-hero-description mt-4 max-w-lg text-base text-navy-700 sm:text-lg'}>
            {activeSlide.description}
          </p>
          <Button as={Link} to={activeSlide.to} size="lg" rightIcon={<FiArrowRight />} className="mt-7">
            {activeSlide.action}
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Choose a trending catalog category"
          className={
            dark
              ? 'catalog-hero-tabs flex w-fit max-w-full overflow-x-auto rounded-2xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md'
              : 'catalog-hero-tabs flex w-fit max-w-full overflow-x-auto rounded-2xl border border-navy-900/10 bg-white/75 p-1.5 shadow-soft backdrop-blur-md'
          }
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                id={`catalog-tab-${slide.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="catalog-slide"
                onClick={() => setActiveIndex(index)}
                className={
                  isActive
                    ? 'shrink-0 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft'
                    : dark
                      ? 'shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white'
                      : 'shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-100'
                }
              >
                {slide.label}
              </button>
            );
          })}
        </div>
      </div>
      <span id="catalog-slide" role="tabpanel" aria-labelledby={`catalog-tab-${activeSlide.id}`} className="sr-only">
        {activeSlide.label}: {activeSlide.description}
      </span>
    </section>
  );
}

export default TrendingCatalogHero;
