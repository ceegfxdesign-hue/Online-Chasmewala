import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/services/baseApi';
import authReducer from '@/features/auth/authSlice';
import cartReducer, { persistCart } from '@/features/cart/cartSlice';
import wishlistReducer, { persistWishlist } from '@/features/wishlist/wishlistSlice';
import recentlyViewedReducer, {
  persistRecentlyViewed,
} from '@/features/recentlyViewed/recentlyViewedSlice';
import compareReducer, { persistCompare } from '@/features/compare/compareSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
    compare: compareReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } })
      .concat(baseApi.middleware)
      .concat(persistCart)
      .concat(persistWishlist)
      .concat(persistRecentlyViewed)
      .concat(persistCompare),
});

export default store;
