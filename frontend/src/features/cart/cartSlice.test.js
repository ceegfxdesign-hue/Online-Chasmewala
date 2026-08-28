import { describe, it, expect } from 'vitest';
import reducer, {
  addToCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  clearCart,
  selectCartCount,
  selectCartSubtotal,
  cartLineKey,
} from './cartSlice';

const base = { items: [], coupon: null };
const itemA = { productId: 'a', slug: 'a', name: 'A', price: 1000, quantity: 1 };
const itemB = { productId: 'b', slug: 'b', name: 'B', price: 500, quantity: 2, lensOption: { type: 'blue-light', price: 300 } };

describe('cartSlice', () => {
  it('adds a new item', () => {
    const state = reducer(base, addToCart(itemA));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it('increments quantity when the same line is added again', () => {
    let state = reducer(base, addToCart(itemA));
    state = reducer(state, addToCart({ ...itemA, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('treats different lens options as separate lines', () => {
    let state = reducer(base, addToCart(itemA));
    state = reducer(state, addToCart(itemB));
    expect(state.items).toHaveLength(2);
  });

  it('updates and removes items by line key', () => {
    let state = reducer(base, addToCart(itemA));
    const key = cartLineKey(state.items[0]);
    state = reducer(state, updateQuantity({ key, quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
    state = reducer(state, removeFromCart(key));
    expect(state.items).toHaveLength(0);
  });

  it('computes count and subtotal (incl. lens price)', () => {
    let state = reducer(base, addToCart(itemA));
    state = reducer(state, addToCart(itemB));
    const root = { cart: state };
    expect(selectCartCount(root)).toBe(3); // 1 + 2
    // A: 1000*1 + B: (500+300)*2 = 1000 + 1600
    expect(selectCartSubtotal(root)).toBe(2600);
  });

  it('applies a coupon and clears the cart', () => {
    let state = reducer(base, addToCart(itemA));
    state = reducer(state, applyCoupon({ code: 'WELCOME10', discount: 100 }));
    expect(state.coupon.code).toBe('WELCOME10');
    state = reducer(state, clearCart());
    expect(state.items).toHaveLength(0);
    expect(state.coupon).toBeNull();
  });
});
