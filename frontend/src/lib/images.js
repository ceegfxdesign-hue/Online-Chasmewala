const picsumSeedPattern = /^https:\/\/picsum\.photos\/seed\/([^/]+)\/\d+\/\d+(?:\?.*)?$/;

function getPicsumSeed(url) {
  return typeof url === 'string' ? url.match(picsumSeedPattern)?.[1] : undefined;
}

/**
 * Requests an appropriately sized version of the seeded development images.
 * Non-Picsum URLs are intentionally returned unchanged so production image
 * providers can be swapped in without coupling the UI to their URL format.
 */
export function getOptimizedImageUrl(url, width, height = width) {
  const seed = getPicsumSeed(url);
  return seed ? `https://picsum.photos/seed/${seed}/${width}/${height}` : url;
}

/** Build a responsive srcSet for the seeded square product imagery. */
export function getResponsiveImageSrcSet(url, widths, aspectRatio = 1) {
  if (!getPicsumSeed(url)) return undefined;

  return widths
    .map((width) => `${getOptimizedImageUrl(url, width, Math.round(width / aspectRatio))} ${width}w`)
    .join(', ');
}
