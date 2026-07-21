/**
 * Filter option definitions for the catalog. Values match backend enums so the
 * query params map straight through to the API.
 */
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most popular' },
  { value: 'discount', label: 'Biggest discount' },
];

export const GENDER_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
];

export const FRAME_SHAPE_OPTIONS = [
  'rectangle',
  'square',
  'round',
  'oval',
  'cat-eye',
  'aviator',
  'wayfarer',
  'geometric',
  'clubmaster',
].map((v) => ({ value: v, label: v.replace('-', ' ') }));

export const FRAME_TYPE_OPTIONS = [
  { value: 'full-rim', label: 'Full Rim' },
  { value: 'half-rim', label: 'Half Rim' },
  { value: 'rimless', label: 'Rimless' },
];

export const FRAME_MATERIAL_OPTIONS = [
  'acetate',
  'metal',
  'tr90',
  'titanium',
  'plastic',
  'mixed',
].map((v) => ({ value: v, label: v.toUpperCase() === v ? v : v[0].toUpperCase() + v.slice(1) }));

export const LENS_TYPE_OPTIONS = [
  { value: 'single-vision', label: 'Single Vision' },
  { value: 'bifocal', label: 'Bifocal' },
  { value: 'progressive', label: 'Progressive' },
  { value: 'zero-power', label: 'Zero Power' },
  { value: 'blue-light', label: 'Blue Light' },
  { value: 'polarized', label: 'Polarized' },
  { value: 'photochromic', label: 'Photochromic' },
  { value: 'sunglasses', label: 'Sunglasses' },
];

export const FACE_SHAPE_OPTIONS = ['round', 'oval', 'square', 'heart', 'oblong', 'diamond'].map(
  (v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })
);

export const FRAME_SIZE_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
  { value: 'extra-wide', label: 'Extra Wide' },
];

export const FEATURE_TOGGLES = [
  { key: 'blueLightFilter', label: 'Blue-light filter' },
  { key: 'polarized', label: 'Polarized' },
  { key: 'uvProtection', label: 'UV protection' },
  { key: 'inStock', label: 'In stock only' },
  { key: 'onOffer', label: 'On offer' },
];

export const PRICE_BOUNDS = { min: 0, max: 10000, step: 100 };
