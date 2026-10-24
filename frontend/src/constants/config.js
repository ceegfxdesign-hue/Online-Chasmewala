const API_VERSION_PREFIX = '/api/v1';
// Production API is hosted alongside the frontend on Hostinger at /api/v1.
// A VITE_API_URL environment variable can still override it if needed.
const DEFAULT_API_URL = import.meta.env.PROD
  ? '/api/v1'
  : 'http://localhost:5000/api/v1';

function normalizeApiUrl(value) {
  const url = (value || DEFAULT_API_URL).replace(/\/+$/, '');
  return url.endsWith(API_VERSION_PREFIX) ? url : `${url}${API_VERSION_PREFIX}`;
}

/**
 * Runtime app configuration derived from build-time environment variables.
 */
export const config = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME || 'Online Chasmewala',
  apiUrl: normalizeApiUrl(import.meta.env.VITE_API_URL),
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
});

export default config;
