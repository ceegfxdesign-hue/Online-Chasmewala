/**
 * Cart slice. Holds line items client-side with localStorage persistence so a
 * guest cart survives reloads. Phase 6 layers server synchronization on top of
 * these same reducers for authenticated users.
 */
import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '@/lib/storage';

const persisted = loadState('cart', { items: [], coupon: null });

/** Stable identity for a line item (product + variant + lens choice). */
const lineKey = (item) =>
  `${item.productId}::${item.variantId || 'default'}::${item.lensOption?.type || 'none'}`;

const initialState = {
  items: persisted.items || [],
  coupon: persisted.coupon || null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const key = lineKey(item);
      const existing = state.items.find((i) => lineKey(i) === key);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }
    },
    updateQuantity(state, action) {
      const { key, quantity } = action.payload;
      const item = state.items.find((i) => lineKey(i) === key);
      if (item) item.quantity = Math.max(1, quantity);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => lineKey(i) !== action.payload);
    },
    applyCoupon(state, action) {
      state.coupon = action.payload; // { code, discount }
    },
    removeCoupon(state) {
      state.coupon = null;
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },
    replaceCart(state, action) {
      state.items = action.payload.items || [];
      state.coupon = action.payload.coupon || null;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
  replaceCart,
} = cartSlice.actions;

// Persist cart on every change.
export const persistCart = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('cart/')) {
    const { items, coupon } = store.getState().cart;
    saveState('cart', { items, coupon });
  }
  return result;
};

export const cartLineKey = lineKey;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.price + (i.lensOption?.price || 0)) * i.quantity, 0);
export const selectCoupon = (state) => state.cart.coupon;

export default cartSlice.reducer;
