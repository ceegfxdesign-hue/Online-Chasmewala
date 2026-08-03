import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiHeadphones,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ShopByFaceShape } from '@/components/home/ShopByFaceShape';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { FeaturedBrands } from '@/components/home/FeaturedBrands';
import { HappyCustomers } from '@/components/home/HappyCustomers';
import { TrendingCatalogHero } from '@/components/home/TrendingCatalogHero';
import { useGetCollectionsQuery } from '@/features/products/productApi';
import { selectRecentlyViewed } from '@/features/recentlyViewed/recentlyViewedSlice';
import { absoluteUrl } from '@/lib/seo';
import { loadState, saveState } from '@/lib/storage';
import { ROUTES } from '@/constants/routes';

const VALUE_PROPS = [
  { icon: FiTruck, title: 'Free shipping', text: 'On all orders above ₹999' },
  { icon: FiRefreshCw, title: '14-day returns', text: 'Easy, no-questions returns' },
  { icon: FiShield, title: '1-year warranty', text: 'On all eyewear frames' },
  { icon: FiHeadphones, title: 'Expert support', text: 'Help choosing the right fit' },
];

const HOME_COLLECTIONS_CACHE_KEY = 'homeProductCollections';

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
      <ShopByCategory />

      <ProductCarousel
        eyebrow="Most loved"
        title="Best sellers"
        subtitle="Our customers’ favourite frames this season."
        action={{ label: 'View all', to: `${ROUTES.products}?sort=popular` }}
        products={displayCollections?.bestSellers || []}
        loading={showCollectionSkeletons}
      />

      <ShopByFaceShape />

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
        action={{ label: 'View all', to: `${ROUTES.products}` }}
        products={displayCollections?.newArrivals || []}
        loading={showCollectionSkeletons}
      />

      <section className="border-y border-navy-100 bg-surface">
        <div className="container-page grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {VALUE_PROPS.map((value) => (
            <div key={value.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <value.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-navy-900">{value.title}</p>
                <p className="text-sm text-navy-400">{value.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {recentlyViewed.length > 0 && <ProductCarousel title="Recently viewed" products={recentlyViewed} />}

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

      <HappyCustomers />
    </>
  );
}
