/** SEO helpers shared by public route metadata. */
export function absoluteUrl(path = '/') {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  const origin = configuredOrigin || window.location.origin;
  return new URL(path, `${origin}/`).toString();
}

export default absoluteUrl;
