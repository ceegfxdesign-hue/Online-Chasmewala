/**
 * Product comparison tray. Holds up to 4 product snapshots, client-side +
 * persisted. Used by the ProductDetails "Compare" action and the Compare page.
 */
import { createSlice } from '@reduxjs/toolkit';
import { loadState, saveState } from '@/lib/storage';

const MAX = 4;
const persisted = loadState('compare', { items: [] });

const compareSlice = createSlice({
  name: 'compare',
  initialState: { items: persisted.items || [] },
  reducers: {
    toggleCompare(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex((p) => p._id === product._id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else if (state.items.length < MAX) {
        state.items.push(product);
      }
    },
    removeFromCompare(state, action) {
      state.items = state.items.filter((p) => p._id !== action.payload);
    },
    clearCompare(state) {
      state.items = [];
    },
  },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;

export const persistCompare = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('compare/')) {
    saveState('compare', { items: store.getState().compare.items });
  }
  return result;
};

export const COMPARE_MAX = MAX;
export const selectCompare = (state) => state.compare.items;
export const selectCompareCount = (state) => state.compare.items.length;

export default compareSlice.reducer;
