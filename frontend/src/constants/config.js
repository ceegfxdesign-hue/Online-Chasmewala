/**
 * Runtime app configuration derived from build-time environment variables.
 */
export const config = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME || 'Online Chasmewala',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
});

export default config;
