import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { selectWishlist, removeFromWishlist } from '@/features/wishlist/wishlistSlice';
import { addToCart } from '@/features/cart/cartSlice';
import { openCartDrawer } from '@/features/ui/uiSlice';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatPrice } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlist);

  const moveToCart = (item) => {
    dispatch(
      addToCart({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
      })
    );
    dispatch(removeFromWishlist(item.productId));
    dispatch(openCartDrawer());
  };

  return (
    <>
      <Helmet>
        <title>Your Wishlist · Online Chasmewala</title>
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumb className="mb-4" items={[{ label: 'Home', to: ROUTES.home }, { label: 'Wishlist' }]} />
        <h1 className="mb-6 text-h2 text-navy-900">Your Wishlist</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={<FiHeart />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here for later."
            action={<Button as={Link} to={ROUTES.products}>Explore products</Button>}
          />
        ) : (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {items.map((item) => (
              <motion.div key={item.productId} variants={staggerItem} className="overflow-hidden rounded-2xl bg-surface shadow-card">
                <Link to={ROUTES.product(item.slug)} className="block aspect-square overflow-hidden bg-surface-subtle">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </Link>
                <div className="p-4">
                  <Link to={ROUTES.product(item.slug)} className="line-clamp-2 text-sm font-medium text-navy-900 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <p className="mt-1 font-bold text-navy-900">{formatPrice(item.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1" leftIcon={<FiShoppingBag className="h-4 w-4" />} onClick={() => moveToCart(item)}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Remove"
                      onClick={() => dispatch(removeFromWishlist(item.productId))}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
