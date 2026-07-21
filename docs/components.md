# Component Library

The frontend ships a documented, reusable component library. Components live under
`frontend/src/components/` and follow the design system (`frontend/src/styles/design-system/`).

## Organization

| Folder                 | Contents                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `components/ui`        | Design-system primitives: Button, Input, Select, Checkbox, Radio, Card, Badge, Modal, Drawer, Toast, Tooltip, Tabs, Accordion, Pagination, Breadcrumb, RatingStars, Skeleton, Loader, PriceSlider, EmptyState, Chip. |
| `components/product`   | ProductCard, ProductCarousel, ProductGallery, FilterSidebar, ReviewsSection, PincodeChecker. |
| `pages/admin`          | Admin dashboard and management screens composed from the shared UI kit. |
| `components/common`    | Cross-cutting composites (SectionHeading, Newsletter, TrustBadges…). |

## Conventions

- Every primitive accepts `className` and forwards refs where useful.
- Variants are driven by explicit props (e.g. `<Button variant="primary" size="md" />`), resolved via
  a small class-variance helper — no arbitrary Tailwind soup at call sites.
- All interactive components have visible focus states, ARIA attributes, and keyboard support.
- Motion uses shared Framer Motion presets from `styles/design-system/motion`.

The shared UI kit is complete. Feature pages compose those primitives rather than creating a parallel
admin-specific component library.
