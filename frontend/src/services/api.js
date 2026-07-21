/**
 * Axios instance with:
 *  - base URL from env (includes /api/v1)
 *  - credentials (so the refresh cookie is sent)
 *  - a request interceptor attaching the access token
 *  - a response interceptor that transparently refreshes an expired access token
 *    once and replays the original request.
 */
import axios from 'axios';
import { config } from '@/constants/config';

let accessToken = null;
let onAuthCleared = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

/** Register a callback invoked when refresh fails (used to log the user out). */
export function setAuthClearedHandler(fn) {
  onAuthCleared = fn;
}

export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Attempt a single transparent refresh on 401 (but not for auth endpoints).
    const isAuthCall = original?.url?.includes('/auth/');
    if (status === 401 && !original?._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        const newToken = data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        refreshPromise = null;
        setAccessToken(null);
        onAuthCleared?.();
      }
    }
    return Promise.reject(normalizeError(error));
  }
);

/** Convert an axios error into a consistent `{ message, errors, status }`. */
export function normalizeError(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  return {
    status,
    message: data?.message || error.message || 'Something went wrong',
    errors: data?.errors || [],
  };
}

export default api;
