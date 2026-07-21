# Performance and SEO Audit

## Local production baseline

The storefront was built with `npm run build`, served with `npm run preview`,
and audited at `http://127.0.0.1:4173` using Lighthouse's mobile defaults.
The final machine-readable report is at `frontend/reports/lighthouse-optimized.json`.

| Category | Score |
| --- | ---: |
| Performance | 72 |
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 100 |

## Completed improvements

- Added canonical, Open Graph, Twitter-card, and product JSON-LD metadata.
- Added robots directives for private/customer/admin routes.
- Kept the admin chart library, motion-based overlays, and mobile/cart drawers
  out of storefront startup.
- Made Google Font CSS non-blocking with a no-JavaScript fallback.
- Corrected the audited contrast and accessible-name issues.

## Final mobile optimization pass

- Homepage data now reserves its final carousel and brand-strip space while it
  loads, preventing late content from shifting the page.
- The desktop-only hero image is not requested below the desktop breakpoint.
- Category and seeded product images use responsive `srcSet` candidates, so
  small product cards do not download their original 900px development images.
- Product gallery thumbnails use 160px versions, while the main gallery image
  selects an appropriate 480px, 720px, or 900px source.
- This optimization only transforms the seeded `picsum.photos` development
  URLs. Uploaded or CDN-hosted production image URLs remain unchanged.

## Release measurement

The code work for the performance/SEO phase is complete. Lighthouse scores are
machine- and network-dependent, so perform one final mobile audit against the
current production build (and later the deployed HTTPS origin) before release.
If a live origin still misses its target, the remaining infrastructure task is
to serve production imagery through an image CDN or self-hosted optimized
assets with long-lived caching.
