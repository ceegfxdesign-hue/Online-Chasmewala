import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/ui/RatingStars';
import { addToCart } from '@/features/cart/cartSlice';
import { toggleWishlist } from '@/features/wishlist/wishlistSlice';
import { openCartDrawer } from '@/features/ui/uiSlice';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { formatPrice, discountPercent } from '@/lib/format';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '@/lib/images';
import { cn } from '@/utils/cn';

/**
 * Product card used across listings, carousels and search. The whole card links
 * to the product; wishlist and quick-add are separate controls.
 */
function ProductCardBase({ product, className }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const wishlisted = useSelector((s) => s.wishlist.items.some((i) => i.productId === product._id));

  const discount = product.discountPercent ?? discountPercent(product.mrp, product.price);
  const brandName = product.brand?.name;
  const image = product.images?.[0];

  const onWishlist = (e) => {
    e.preventDefault();
    dispatch(
      toggleWishlist({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image,
        price: product.price,
      })
    );
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const onQuickAdd = (e) => {
    e.preventDefault();
    dispatch(
      addToCart({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image,
        price: product.price,
        color: product.variants?.[0]?.color,
        variantId: product.variants?.[0]?._id,
        quantity: 1,
      })
    );
    dispatch(openCartDrawer());
  };

  return (
    <article className={cn('group h-full', className)}>
      <Link
        to={ROUTES.product(product.slug)}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-subtle">
          {image && (
            <img
              src={getOptimizedImageUrl(image, 480)}
              srcSet={getResponsiveImageSrcSet(image, [240, 360, 480])}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 31vw, (max-width: 1280px) 23vw, 19vw"
              width="480"
              height="480"
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && <Badge variant="error">{discount}% OFF</Badge>}
            {product.isBestSeller && <Badge variant="navy">Bestseller</Badge>}
            {product.isNewArrival && !product.isBestSeller && <Badge variant="accent">New</Badge>}
          </div>

          <button
            type="button"
            onClick={onWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-soft backdrop-blur transition-colors',
              wishlisted ? 'text-error' : 'text-navy-500 hover:text-error'
            )}
          >
            <FiHeart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
          </button>

          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/60">
              <Badge variant="neutral">Out of stock</Badge>
            </div>
          )}

          {/* Quick add on hover (desktop) */}
          {product.stock !== 0 && (
            <button
              type="button"
              onClick={onQuickAdd}
              className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-2 rounded-xl bg-navy-900 py-2.5 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
            >
              <FiShoppingBag className="h-4 w-4" /> Quick add
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {brandName && <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{brandName}</p>}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-navy-900">{product.name}</h3>

          <div className="mt-1.5">
            <RatingStars value={product.rating} count={product.numReviews} size={14} />
          </div>

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="text-base font-bold text-navy-900">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="text-sm text-navy-400 line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
export default ProductCard;
