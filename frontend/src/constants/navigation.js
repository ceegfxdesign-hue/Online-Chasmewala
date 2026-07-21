/**
 * Navigation + mega-menu configuration. Category slugs match the seeded
 * categories. Used by the Navbar mega menu and the mobile menu.
 */
export const MEGA_MENU = [
  {
    label: 'Eyeglasses',
    slug: 'eyeglasses',
    columns: [
      {
        title: 'Shop by Gender',
        links: [
          { label: 'Men', to: '/products?category=eyeglasses&gender=men' },
          { label: 'Women', to: '/products?category=eyeglasses&gender=women' },
          { label: 'Unisex', to: '/products?category=eyeglasses&gender=unisex' },
        ],
      },
      {
        title: 'Shop by Shape',
        links: [
          { label: 'Rectangle', to: '/products?category=eyeglasses&frameShape=rectangle' },
          { label: 'Round', to: '/products?category=eyeglasses&frameShape=round' },
          { label: 'Cat-Eye', to: '/products?category=eyeglasses&frameShape=cat-eye' },
          { label: 'Wayfarer', to: '/products?category=eyeglasses&frameShape=wayfarer' },
        ],
      },
      {
        title: 'Shop by Type',
        links: [
          { label: 'Full Rim', to: '/products?category=eyeglasses&frameType=full-rim' },
          { label: 'Half Rim', to: '/products?category=eyeglasses&frameType=half-rim' },
          { label: 'Rimless', to: '/products?category=eyeglasses&frameType=rimless' },
        ],
      },
    ],
  },
  {
    label: 'Sunglasses',
    slug: 'sunglasses',
    columns: [
      {
        title: 'Shop by Gender',
        links: [
          { label: 'Men', to: '/products?category=sunglasses&gender=men' },
          { label: 'Women', to: '/products?category=sunglasses&gender=women' },
        ],
      },
      {
        title: 'Popular Styles',
        links: [
          { label: 'Aviator', to: '/products?category=sunglasses&frameShape=aviator' },
          { label: 'Wayfarer', to: '/products?category=sunglasses&frameShape=wayfarer' },
          { label: 'Round', to: '/products?category=sunglasses&frameShape=round' },
        ],
      },
      {
        title: 'Features',
        links: [
          { label: 'Polarized', to: '/products?category=sunglasses&polarized=true' },
          { label: 'UV Protection', to: '/products?category=sunglasses&uvProtection=true' },
        ],
      },
    ],
  },
  {
    label: 'Computer Glasses',
    slug: 'computer-glasses',
    columns: [
      {
        title: 'Blue-Light',
        links: [
          { label: 'All Computer Glasses', to: '/products?category=computer-glasses' },
          { label: 'Zero Power', to: '/products?category=computer-glasses&lensType=zero-power' },
        ],
      },
    ],
  },
  { label: 'Kids', slug: 'kids-glasses', columns: [] },
  { label: 'Contact Lenses', slug: 'contact-lenses', columns: [] },
];

export const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'Eyeglasses', to: '/products?category=eyeglasses' },
      { label: 'Sunglasses', to: '/products?category=sunglasses' },
      { label: 'Computer Glasses', to: '/products?category=computer-glasses' },
      { label: 'Contact Lenses', to: '/products?category=contact-lenses' },
      { label: 'Kids Glasses', to: '/products?category=kids-glasses' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Order', to: '/account/orders' },
      { label: 'Returns & Exchanges', to: '/account/returns' },
      { label: 'Shipping Policy', to: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Refund Policy', to: '/refund-policy' },
    ],
  },
];
