import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiHeart,
  FiShoppingBag,
  FiZap,
  FiShare2,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiMinus,
  FiPlus,
  FiBarChart2,
  FiCheck,
} from 'react-icons/fi';
import { useGetProductBySlugQuery, useGetRelatedProductsQuery } from '@/features/products/productApi';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ReviewsSection } from '@/components/product/ReviewsSection';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { PincodeChecker } from '@/components/product/PincodeChecker';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { Tabs } from '@/components/ui/Tabs';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { addToCart } from '@/features/cart/cartSlice';
import { toggleWishlist } from '@/features/wishlist/wishlistSlice';
import { toggleCompare, selectCompareCount, COMPARE_MAX } from '@/features/compare/compareSlice';
import { pushRecentlyViewed, selectRecentlyViewed } from '@/features/recentlyViewed/recentlyViewedSlice';
import { openCartDrawer } from '@/features/ui/uiSlice';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, titleCase } from '@/lib/format';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/** Build lens options for powered frames. */
function lensOptionsFor(product) {
  if (!product.powered) return [];
  return [
    { type: 'single-vision', label: 'Single Vision', price: 0 },
    { type: 'zero-power', label: 'Zero Power', price: 0 },
    { type: 'blue-light', label: 'Blue-Light Block', price: 300 },
    { type: 'progressive', label: 'Progressive', price: 1200 },
  ];
}

function Spec({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-navy-100 py-2.5 text-sm">
      <span className="text-navy-400">{label}</span>
      <span className="font-medium text-navy-800">{value}</span>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug);
  const { data: related } = useGetRelatedProductsQuery(slug, { skip: !slug });
  const recentlyViewed = useSelector(selectRecentlyViewed);
  const compareCount = useSelector(selectCompareCount);
  const wishlisted = useSelector((s) => product && s.wishlist.items.some((i) => i.productId === product._id));
  const inCompare = useSelector((s) => product && s.compare.items.some((i) => i._id === product._id));

  const [variantIdx, setVariantIdx] = useState(0);
  const [lens, setLens] = useState(null);
  const [qty, setQty] = useState(1);

  const lensOptions = useMemo(() => (product ? lensOptionsFor(product) : []), [product]);

  // Record recently-viewed once the product loads.
  useEffect(() => {
    if (product) {
      dispatch(
        pushRecentlyViewed({
          _id: product._id,
          slug: product.slug,
          name: product.name,
          images: product.images,
          price: product.price,
          mrp: product.mrp,
          discountPercent: product.discountPercent,
          rating: product.rating,
          numReviews: product.numReviews,
          brand: product.brand,
          stock: product.stock,
        })
      );
      setVariantIdx(0);
      setLens(null);
      setQty(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  if (isLoading) return <Loader fullscreen label="Loading product…" />;
  if (isError || !product)
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is unavailable."
          action={<Button as={Link} to={ROUTES.products}>Browse products</Button>}
        />
      </div>
    );

  const variant = product.variants?.[variantIdx];
  const galleryImages = variant?.images?.length ? variant.images : product.images;
  const unitPrice = product.price + (lens?.price || 0);
  const outOfStock = product.stock === 0;

  const buildCartItem = () => ({
    productId: product._id,
    slug: product.slug,
    name: product.name,
    image: galleryImages?.[0],
    price: product.price,
    color: variant?.color,
    variantId: variant?._id,
    lensOption: lens || undefined,
    quantity: qty,
  });

  const onAddToCart = () => {
    dispatch(addToCart(buildCartItem()));
    dispatch(openCartDrawer());
  };

  const onBuyNow = () => {
    dispatch(addToCart(buildCartItem()));
    navigate(ROUTES.checkout);
  };

  const onWishlist = () => {
    dispatch(
      toggleWishlist({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0],
        price: product.price,
      })
    );
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const onCompare = () => {
    if (!inCompare && compareCount >= COMPARE_MAX) {
      toast.error(`You can compare up to ${COMPARE_MAX} products`);
      return;
    }
    dispatch(toggleCompare({
      _id: product._id, slug: product.slug, name: product.name, images: product.images,
      price: product.price, mrp: product.mrp, rating: product.rating, brand: product.brand,
      frameShape: product.frameShape, frameMaterial: product.frameMaterial, frameType: product.frameType,
      lensType: product.lensType, warrantyMonths: product.warrantyMonths,
    }));
    toast.info(inCompare ? 'Removed from compare' : 'Added to compare');
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* user dismissed share sheet */
    }
  };

  const specsTab = (
    <div className="max-w-xl">
      <Spec label="Brand" value={product.brand?.name} />
      <Spec label="Frame shape" value={product.frameShape && titleCase(product.frameShape)} />
      <Spec label="Frame type" value={product.frameType && titleCase(product.frameType)} />
      <Spec label="Frame material" value={product.frameMaterial && titleCase(product.frameMaterial)} />
      <Spec label="Frame size" value={product.frameSize && titleCase(product.frameSize)} />
      <Spec label="Lens type" value={product.lensType && titleCase(product.lensType)} />
      <Spec label="Frame width" value={product.frameWidth && `${product.frameWidth} mm`} />
      <Spec label="Lens width" value={product.lensWidth && `${product.lensWidth} mm`} />
      <Spec label="Bridge" value={product.bridgeSize && `${product.bridgeSize} mm`} />
      <Spec label="Temple" value={product.templeSize && `${product.templeSize} mm`} />
      <Spec label="Warranty" value={product.warrantyMonths ? `${product.warrantyMonths} months` : 'N/A'} />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{product.name} · Online Chasmewala</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
        <link rel="canonical" href={absoluteUrl(ROUTES.product(product.slug))} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 155)} />
        <meta property="og:url" content={absoluteUrl(ROUTES.product(product.slug))} />
        <meta property="og:image" content={product.images?.[0]} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images,
            description: product.description,
            brand: { '@type': 'Brand', name: product.brand?.name },
            sku: product.sku,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'INR',
              availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            },
            aggregateRating: product.numReviews
              ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.numReviews }
              : undefined,
          })}
        </script>
      </Helmet>

      <div className="container-page py-6">
        <Breadcrumb
          className="mb-5"
          items={[
            { label: 'Home', to: ROUTES.home },
            { label: titleCase(product.category?.slug || 'Products'), to: `${ROUTES.products}?category=${product.category?.slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={galleryImages} alt={product.name} />

          <div>
            {product.brand?.name && (
              <Link to={`${ROUTES.products}?brand=${product.brand.slug}`} className="text-sm font-medium uppercase tracking-wide text-brand-600">
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-1 text-h2 text-navy-900">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3">
              <RatingStars value={product.rating} showValue />
              <span className="text-sm text-navy-400">{product.numReviews} reviews</span>
              <span className="text-navy-200">·</span>
              <span className="text-sm text-navy-400">{product.soldCount}+ sold</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-extrabold text-navy-900">{formatPrice(unitPrice)}</span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-lg text-navy-400 line-through">{formatPrice(product.mrp)}</span>
                  <Badge variant="error">{product.discountPercent}% OFF</Badge>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-navy-400">Inclusive of all taxes</p>

            <p className="mt-5 text-sm leading-relaxed text-navy-600">{product.description}</p>

            {/* Colors / variants */}
            {product.variants?.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-navy-900">
                  Color: <span className="font-normal text-navy-500">{variant?.color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={v._id || v.color}
                      type="button"
                      onClick={() => setVariantIdx(i)}
                      aria-label={v.color}
                      aria-pressed={i === variantIdx}
                      title={v.color}
                      className={cn(
                        'h-9 w-9 rounded-full border-2 transition-transform',
                        i === variantIdx ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-navy-200'
                      )}
                      style={{ backgroundColor: v.colorHex || '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lens options */}
            {lensOptions.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-navy-900">Lens type</p>
                <div className="flex flex-wrap gap-2">
                  {lensOptions.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setLens(lens?.type === opt.type ? null : opt)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm transition-colors',
                        lens?.type === opt.type
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-navy-200 text-navy-600 hover:border-navy-300'
                      )}
                    >
                      {opt.label}
                      {opt.price > 0 && <span className="ml-1 text-xs text-navy-400">+{formatPrice(opt.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex items-center gap-4">
              <div className="inline-flex items-center rounded-xl border border-navy-200">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-navy-600 hover:bg-navy-100">
                  <FiMinus />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className="flex h-11 w-11 items-center justify-center text-navy-600 hover:bg-navy-100">
                  <FiPlus />
                </button>
              </div>
              {!outOfStock && product.stock <= (product.lowStockThreshold || 5) && (
                <span className="text-sm font-medium text-warning-dark">Only {product.stock} left!</span>
              )}
              {outOfStock && <Badge variant="neutral">Out of stock</Badge>}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" onClick={onAddToCart} disabled={outOfStock} leftIcon={<FiShoppingBag />} className="flex-1">
                Add to Cart
              </Button>
              <Button size="lg" variant="secondary" onClick={onBuyNow} disabled={outOfStock} leftIcon={<FiZap />} className="flex-1">
                Buy Now
              </Button>
            </div>

            <div className="mt-3 flex gap-3">
              <Button variant="outline" onClick={onWishlist} leftIcon={<FiHeart className={cn(wishlisted && 'fill-current text-error')} />}>
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </Button>
              <Button variant="ghost" onClick={onCompare} leftIcon={inCompare ? <FiCheck /> : <FiBarChart2 />}>
                {inCompare ? 'In compare' : 'Compare'}
              </Button>
              <Button variant="ghost" onClick={onShare} leftIcon={<FiShare2 />} aria-label="Share">
                Share
              </Button>
            </div>

            {/* Delivery + trust */}
            <div className="mt-6">
              <PincodeChecker returnDays={product.returnDays} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-navy-500">
              <div className="rounded-xl bg-surface-muted p-3">
                <FiTruck className="mx-auto mb-1 h-5 w-5 text-brand-500" /> Free shipping
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <FiRefreshCw className="mx-auto mb-1 h-5 w-5 text-brand-500" /> {product.returnDays}-day returns
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <FiShield className="mx-auto mb-1 h-5 w-5 text-brand-500" /> {product.warrantyMonths}mo warranty
              </div>
            </div>
          </div>
        </div>

        {/* Details tabs */}
        <div className="mt-14">
          <Tabs
            items={[
              {
                key: 'description',
                label: 'Description',
                content: (
                  <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-navy-600">
                    <p>{product.description}</p>
                    {product.highlights?.length > 0 && (
                      <ul className="space-y-2">
                        {product.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2">
                            <FiCheck className="h-4 w-4 text-success" /> {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              },
              { key: 'specs', label: 'Specifications', content: specsTab },
              { key: 'reviews', label: `Reviews (${product.numReviews})`, content: <ReviewsSection slug={product.slug} /> },
            ]}
          />
        </div>
      </div>

      {related?.length > 0 && <ProductCarousel title="You may also like" eyebrow="Similar products" products={related} />}
      {recentlyViewed.filter((p) => p._id !== product._id).length > 0 && (
        <ProductCarousel title="Recently viewed" products={recentlyViewed.filter((p) => p._id !== product._id)} />
      )}

      {/* Sticky add-to-cart (mobile) */}
      <div className="sticky bottom-0 z-30 border-t border-navy-100 bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-lg font-bold text-navy-900">{formatPrice(unitPrice)}</p>
            {product.discountPercent > 0 && (
              <p className="text-xs text-navy-400 line-through">{formatPrice(product.mrp)}</p>
            )}
          </div>
          <Button onClick={onAddToCart} disabled={outOfStock} leftIcon={<FiShoppingBag />} className="flex-1">
            Add to Cart
          </Button>
        </div>
      </div>
    </>
  );
}
