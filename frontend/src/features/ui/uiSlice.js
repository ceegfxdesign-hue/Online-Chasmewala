/**
 * Ephemeral UI state: overlay visibility for the cart drawer, mobile menu and
 * search sheet. Kept in Redux so any component can open/close them.
 */
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartDrawerOpen: false,
    mobileMenuOpen: false,
    searchOpen: false,
  },
  reducers: {
    openCartDrawer(state) {
      state.cartDrawerOpen = true;
    },
    closeCartDrawer(state) {
      state.cartDrawerOpen = false;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
    setSearchOpen(state, action) {
      state.searchOpen = action.payload;
    },
  },
});

export const {
  openCartDrawer,
  closeCartDrawer,
  toggleMobileMenu,
  closeMobileMenu,
  setSearchOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
