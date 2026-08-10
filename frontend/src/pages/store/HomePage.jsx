import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ShopByFaceShape } from '@/components/home/ShopByFaceShape';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { FeaturedBrands } from '@/components/home/FeaturedBrands';
import { HappyCustomers } from '@/components/home/HappyCustomers';
import { TrendingCatalogHero } from '@/components/home/TrendingCatalogHero';
import { SunglassesPromo } from '@/components/home/SunglassesPromo';
import { useGetCollectionsQuery } from '@/features/products/productApi';
import { selectRecentlyViewed } from '@/features/recentlyViewed/recentlyViewedSlice';
import { absoluteUrl } from '@/lib/seo';
import { loadState, saveState } from '@/lib/storage';
import { ROUTES } from '@/constants/routes';

const VALUE_PROPS = [
  { icon: FiShield, title: '100% Original Brands', text: 'Guaranteed authenticity' },
  { icon: FiRefreshCw, title: '14-Day Return Policy', text: 'Hassle-free returns' },
  { icon: FiShield, title: '1-Year Warranty On Frames', text: 'Quality you can trust' },
  { icon: FiTruck, title: 'Free Shipping', text: 'Above ₹999' },
];

const HOME_COLLECTIONS_CACHE_KEY = 'homeProductCollections';

/** The premium storefront home page, composed from reusable commerce sections. */
export default function HomePage() {
  const { data: collections, isLoading: collectionsLoading } = useGetCollectionsQuery();
  const recentlyViewed = useSelector(selectRecentlyViewed);
  const [cachedCollections, setCachedCollections] = useState(() => loadState(HOME_COLLECTIONS_CACHE_KEY, null));
  const displayCollections = collections || cachedCollections;
  const showCollectionSkeletons = collectionsLoading && !displayCollections;

  useEffect(() => {
    if (!collections) return;
    setCachedCollections(collections);
    saveState(HOME_COLLECTIONS_CACHE_KEY, collections);
  }, [collections]);

  return (
    <>
      <Helmet>
        <title>Online Chasmewala — Premium Eyewear, Eyeglasses & Sunglasses</title>
        <meta name="description" content="Shop premium eyeglasses, sunglasses and contact lenses at Online Chasmewala. Free shipping above ₹999, 14-day returns and a 1-year warranty." />
        <link rel="canonical" href={absoluteUrl(ROUTES.home)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Online Chasmewala — Premium Eyewear, Eyeglasses & Sunglasses" />
        <meta property="og:description" content="Shop premium eyewear with free shipping, easy returns and a 1-year warranty." />
        <meta property="og:url" content={absoluteUrl(ROUTES.home)} />
        <meta property="og:image" content="https://picsum.photos/seed/oc-hero/1200/630" />
      </Helmet>

      <TrendingCatalogHero />
      <ShopByCategory />

      <section className="border-y border-navy-100 bg-surface">
        <div className="container-page grid grid-cols-1 divide-y divide-navy-100 py-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {VALUE_PROPS.map((value) => (
            <div key={value.title} className="flex items-center gap-3 px-3 py-5 sm:px-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-brand-600">
                <value.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">{value.title}</p>
                <p className="mt-0.5 text-xs text-navy-400">{value.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ShopByFaceShape />

      <ProductCarousel
        eyebrow="Most loved"
        title="Best sellers"
        subtitle="Our customers’ favourite frames this season."
        action={{ label: 'View all bestsellers', to: `${ROUTES.products}?sort=popular` }}
        products={displayCollections?.bestSellers || []}
        loading={showCollectionSkeletons}
      />

      <SunglassesPromo />

      <div className="bg-surface">
        <ProductCarousel
          eyebrow="Hot right now"
          title="Trending now"
          action={{ label: 'View all', to: `${ROUTES.products}?sort=newest` }}
          products={displayCollections?.trending || []}
          loading={showCollectionSkeletons}
        />
      </div>

      <FeaturedBrands />

      <ProductCarousel
        eyebrow="Just landed"
        title="New arrivals"
        action={{ label: 'View all', to: ROUTES.products }}
        products={displayCollections?.newArrivals || []}
        loading={showCollectionSkeletons}
      />

      {recentlyViewed.length > 0 && <ProductCarousel title="Recently viewed" products={recentlyViewed} />}

      <HappyCustomers />
    </>
  );
}
