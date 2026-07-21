import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingBag, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { closeCartDrawer } from '@/features/ui/uiSlice';
import {
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
  cartLineKey,
} from '@/features/cart/cartSlice';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/lib/format';

/** Slide-in cart summary with quantity controls and a checkout CTA. */
export function CartDrawer() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.cartDrawerOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const close = () => dispatch(closeCartDrawer());

  return (
    <Drawer
      open={open}
      onClose={close}
      title={`Your Cart (${items.length})`}
      footer={
        items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-500">Subtotal</span>
              <span className="text-lg font-bold text-navy-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button as={Link} to={ROUTES.cart} variant="outline" onClick={close}>
                View Cart
              </Button>
              <Button as={Link} to={ROUTES.checkout} onClick={close}>
                Checkout
              </Button>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<FiShoppingBag />}
          title="Your cart is empty"
          description="Browse our collection and add your favourite frames."
          action={
            <Button as={Link} to={ROUTES.products} onClick={close}>
              Start shopping
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-navy-100">
          {items.map((item) => {
            const key = cartLineKey(item);
            return (
              <li key={key} className="flex gap-3 p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-xl bg-surface-subtle object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={ROUTES.product(item.slug)}
                    onClick={close}
                    className="line-clamp-1 text-sm font-medium text-navy-900 hover:text-brand-600"
                  >
                    {item.name}
                  </Link>
                  {item.color && <p className="text-xs text-navy-400">{item.color}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-navy-200">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity - 1 }))}
                        className="flex h-7 w-7 items-center justify-center text-navy-600 hover:bg-navy-100"
                      >
                        <FiMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity + 1 }))}
                        className="flex h-7 w-7 items-center justify-center text-navy-600 hover:bg-navy-100"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-navy-900">
                      {formatPrice((item.price + (item.lensOption?.price || 0)) * item.quantity)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => dispatch(removeFromCart(key))}
                  className="self-start rounded-lg p-1.5 text-navy-400 hover:bg-error-light hover:text-error"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}

export default CartDrawer;
