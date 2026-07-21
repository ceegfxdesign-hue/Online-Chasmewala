/**
 * Auth slice. The access token lives in memory (module-scoped in api.js) rather
 * than localStorage to reduce XSS exposure; the httpOnly refresh cookie restores
 * the session on reload via `bootstrapAuth`.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setAccessToken, normalizeError } from '@/services/api';

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    // A valid refresh cookie yields a fresh access token + user.
    const { data } = await api.post('/auth/refresh');
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch {
    return rejectWithValue(null);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(normalizeError(err));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
  return null;
});

export const refreshProfile = createAsyncThunk('auth/refreshProfile', async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
});

const initialState = {
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'unauthenticated';
        state.bootstrapped = true;
      })
      .addCase(refreshProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      });

    // Shared handling for login + register.
    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.user = action.payload;
          state.status = 'authenticated';
          state.error = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'unauthenticated';
          state.error = action.payload?.message || 'Authentication failed';
        });
    });
  },
});

export const { clearAuth, clearError, setUser } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export default authSlice.reducer;
