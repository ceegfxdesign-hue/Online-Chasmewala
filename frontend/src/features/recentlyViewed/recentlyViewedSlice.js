/**
 * Recently viewed products — client-side, capped, persisted. Stores a compact
 * card snapshot so the "Recently Viewed" rail can render without extra fetches.
 */
import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '@/lib/storage';

const MAX = 12;
const persisted = loadState('recentlyViewed', { items: [] });

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: { items: persisted.items || [] },
  reducers: {
    pushRecentlyViewed(state, action) {
      const product = action.payload;
      state.items = [product, ...state.items.filter((p) => p._id !== product._id)].slice(0, MAX);
    },
    clearRecentlyViewed(state) {
      state.items = [];
    },
  },
});

export const { pushRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;

export const persistRecentlyViewed = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('recentlyViewed/')) {
    saveState('recentlyViewed', { items: store.getState().recentlyViewed.items });
  }
  return result;
};

export const selectRecentlyViewed = (state) => state.recentlyViewed.items;

export default recentlyViewedSlice.reducer;
