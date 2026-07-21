import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiHeadphones,
  FiEye,
  FiMonitor,
  FiSun,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ShopByFaceShape } from '@/components/home/ShopByFaceShape';
import { FeaturedBrands } from '@/components/home/FeaturedBrands';
import { TrendingCatalogHero } from '@/components/home/TrendingCatalogHero';
import { useGetCollectionsQuery } from '@/features/products/productApi';
import { selectRecentlyViewed } from '@/features/recentlyViewed/recentlyViewedSlice';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';

const CATEGORIES = [
  { name: 'Eyeglasses', slug: 'eyeglasses', icon: FiEye, blurb: 'Everyday clarity', seed: 'cat-eye' },
  { name: 'Sunglasses', slug: 'sunglasses', icon: FiSun, blurb: 'UV protection', seed: 'cat-sun' },
  { name: 'Computer Glasses', slug: 'computer-glasses', icon: FiMonitor, blurb: 'Blue-light filter', seed: 'cat-comp' },
  { name: 'Contact Lenses', slug: 'contact-lenses', icon: FiEye, blurb: 'Daily & monthly', seed: 'cat-lens' },
];

const VALUE_PROPS = [
  { icon: FiTruck, title: 'Free shipping', text: 'On all orders above ₹999' },
  { icon: FiRefreshCw, title: '14-day returns', text: 'Easy, no-questions returns' },
  { icon: FiShield, title: '1-year warranty', text: 'On all eyewear frames' },
  { icon: FiHeadphones, title: 'Expert support', text: 'Help choosing the right fit' },
];

export default function HomePage() {
  const { data: collections, isLoading: collectionsLoading } = useGetCollectionsQuery();
  const recentlyViewed = useSelector(selectRecentlyViewed);

  return (
    <>
      <Helmet>
        <title>Online Chasmewala — Premium Eyewear, Eyeglasses & Sunglasses</title>
        <meta
          name="description"
          content="Shop premium eyeglasses, sunglasses, computer glasses and contact lenses at Online Chasmewala. Free shipping above ₹999, 14-day returns and a 1-year warranty."
        />
        <link rel="canonical" href={absoluteUrl(ROUTES.home)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Online Chasmewala — Premium Eyewear, Eyeglasses & Sunglasses" />
        <meta property="og:description" content="Shop premium eyewear with free shipping, easy returns and a 1-year warranty." />
        <meta property="og:url" content={absoluteUrl(ROUTES.home)} />
        <meta property="og:image" content="https://picsum.photos/seed/oc-hero/1200/630" />
      </Helmet>

      <TrendingCatalogHero />
      {/*
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-slide-up flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              New Season Collection
            </span>
            <h1 className="text-h1 text-white sm:text-display">
              See the world, <span className="text-brand-400">beautifully.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Premium frames, prescription lenses and sunglasses — designed for everyday clarity and
              effortless style.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to={ROUTES.products} size="lg" rightIcon={<FiArrowRight />}>
                Shop all frames
              </Button>
              <Button
                as={Link}
                to={`${ROUTES.products}?category=sunglasses`}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Explore sunglasses
              </Button>
            </div>
          </div>

          {null}
        </div>
      </section>
      */}

      {/* Categories */}
      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find your perfect pair"
          subtitle="From prescription eyeglasses to polarized sunglasses — explore our curated categories."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.slug}>
              <Link
                to={`${ROUTES.products}?category=${cat.slug}`}
                className="group block overflow-hidden rounded-2xl bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle">
                  <img
                    src={`https://picsum.photos/seed/${cat.seed}/480/360`}
                    srcSet={`https://picsum.photos/seed/${cat.seed}/360/270 360w, https://picsum.photos/seed/${cat.seed}/480/360 480w`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    width="480"
                    height="360"
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-navy-900">{cat.name}</h3>
                    <p className="text-sm text-navy-400">{cat.blurb}</p>
                  </div>
                  <cat.icon className="h-5 w-5 text-brand-500 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <ProductCarousel
        eyebrow="Most loved"
        title="Best sellers"
        subtitle="Our customers’ favourite frames this season."
        action={{ label: 'View all', to: `${ROUTES.products}?sort=popular` }}
        products={collections?.bestSellers || []}
        loading={collectionsLoading}
      />

      <ShopByFaceShape />

      {/* Trending */}
      <div className="bg-surface">
        <ProductCarousel
          eyebrow="Hot right now"
          title="Trending now"
          action={{ label: 'View all', to: `${ROUTES.products}?sort=newest` }}
          products={collections?.trending || []}
          loading={collectionsLoading}
        />
      </div>

      <FeaturedBrands />

      {/* New arrivals */}
      <ProductCarousel
        eyebrow="Just landed"
        title="New arrivals"
        action={{ label: 'View all', to: `${ROUTES.products}` }}
        products={collections?.newArrivals || []}
        loading={collectionsLoading}
      />

      {/* Value props */}
      <section className="border-y border-navy-100 bg-surface">
        <div className="container-page grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <v.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{v.title}</p>
                <p className="text-sm text-navy-400">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <ProductCarousel title="Recently viewed" products={recentlyViewed} />
      )}

      {/* CTA band */}
      <section className="container-page py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-navy-900 px-8 py-14 text-center text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-h2 text-white">Not sure what suits you?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">
            Browse by face shape and frame shape to discover styles designed to flatter your features.
          </p>
          <Button
            as={Link}
            to={ROUTES.products}
            size="lg"
            className="relative mt-7 bg-white text-navy-900 hover:bg-white/90"
            rightIcon={<FiArrowRight />}
          >
            Explore the collection
          </Button>
        </div>
      </section>
    </>
  );
}
