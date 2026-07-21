/**
 * Wishlist slice. Client-side with localStorage persistence for guests; Phase 7
 * syncs it to the authenticated user's server-side wishlist.
 */
import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '@/lib/storage';

const persisted = loadState('wishlist', { items: [] });

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: persisted.items || [] },
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload; // { productId, slug, name, image, price }
      const idx = state.items.findIndex((i) => i.productId === product.productId);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.unshift(product);
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
    replaceWishlist(state, action) {
      state.items = action.payload || [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist, replaceWishlist } =
  wishlistSlice.actions;

export const persistWishlist = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('wishlist/')) {
    saveState('wishlist', { items: store.getState().wishlist.items });
  }
  return result;
};

export const selectWishlist = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;
