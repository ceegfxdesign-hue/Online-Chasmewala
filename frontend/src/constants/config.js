const API_VERSION_PREFIX = '/api/v1';

function normalizeApiUrl(value) {
  const url = (value || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
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
