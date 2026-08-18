import mongoose from 'mongoose';

export const DEFAULT_TRUST_BENEFITS = [
  { title: '100% Original Brands', subtitle: 'Guaranteed authenticity' },
  { title: '14-Day Return Policy', subtitle: 'Hassle-free returns' },
  { title: '1-Year Warranty On Frames', subtitle: 'Quality you can trust' },
  { title: 'Free Shipping', subtitle: 'Above ₹999' },
];

export const DEFAULT_ANNOUNCEMENT_ITEMS = [
  { text: 'Free shipping on orders above ₹999', icon: 'truck' },
  { text: 'Easy 14-day returns', icon: 'refresh' },
  { text: '1-year warranty on frames', icon: 'shield' },
];

export const DEFAULT_NAVIGATION_MENUS = [
  {
    key: 'eyeglasses',
    label: 'Eyeglasses',
    slug: 'eyeglasses',
    columns: [
      { title: 'Shop by Gender', links: [{ label: 'Men', to: '/products?category=eyeglasses&gender=men' }, { label: 'Women', to: '/products?category=eyeglasses&gender=women' }, { label: 'Unisex', to: '/products?category=eyeglasses&gender=unisex' }] },
      { title: 'Shop by Shape', links: [{ label: 'Rectangle', to: '/products?category=eyeglasses&frameShape=rectangle' }, { label: 'Round', to: '/products?category=eyeglasses&frameShape=round' }, { label: 'Cat-Eye', to: '/products?category=eyeglasses&frameShape=cat-eye' }, { label: 'Wayfarer', to: '/products?category=eyeglasses&frameShape=wayfarer' }] },
      { title: 'Shop by Type', links: [{ label: 'Full Rim', to: '/products?category=eyeglasses&frameType=full-rim' }, { label: 'Half Rim', to: '/products?category=eyeglasses&frameType=half-rim' }, { label: 'Rimless', to: '/products?category=eyeglasses&frameType=rimless' }] },
    ],
  },
  {
    key: 'sunglasses',
    label: 'Sunglasses',
    slug: 'sunglasses',
    columns: [
      { title: 'Shop by Gender', links: [{ label: 'Men', to: '/products?category=sunglasses&gender=men' }, { label: 'Women', to: '/products?category=sunglasses&gender=women' }] },
      { title: 'Popular Styles', links: [{ label: 'Aviator', to: '/products?category=sunglasses&frameShape=aviator' }, { label: 'Wayfarer', to: '/products?category=sunglasses&frameShape=wayfarer' }, { label: 'Round', to: '/products?category=sunglasses&frameShape=round' }] },
      { title: 'Features', links: [{ label: 'Polarized', to: '/products?category=sunglasses&polarized=true' }, { label: 'UV Protection', to: '/products?category=sunglasses&uvProtection=true' }] },
    ],
  },
  {
    key: 'contact-lenses',
    label: 'Contact Lenses',
    slug: 'contact-lenses',
    columns: [
      { title: 'Clear Contacts', links: [{ label: 'Distance Power', to: '/products?category=contact-lenses&contactLensType=clear&powerType=with-power' }, { label: 'Toric / Cylindrical', to: '/products?category=contact-lenses&contactLensType=clear&lensType=toric' }, { label: 'Multifocal', to: '/products?category=contact-lenses&contactLensType=clear&lensType=multifocal' }] },
      { title: 'Colour Contacts', links: [{ label: 'Zero Power', to: '/products?category=contact-lenses&contactLensType=color&powerType=zero-power' }, { label: 'With Power', to: '/products?category=contact-lenses&contactLensType=color&powerType=with-power' }] },
      { title: 'Solutions & Accessories', links: [{ label: 'Solutions', to: '/products?category=contact-lenses&contactLensType=solution' }, { label: 'Accessories', to: '/products?category=contact-lenses&contactLensType=accessory' }] },
    ],
  },
];

const trustBenefitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    subtitle: { type: String, required: true, trim: true, maxlength: 160 },
  },
  { _id: false }
);

const announcementItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 140 },
    icon: {
      type: String,
      enum: ['truck', 'refresh', 'shield', 'star', 'zap', 'gift'],
      default: 'shield',
    },
  },
  { _id: false }
);

const navigationLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    to: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const navigationColumnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    links: {
      type: [navigationLinkSchema],
      required: true,
      validate: {
        validator: (links) => links.length >= 1 && links.length <= 12,
        message: 'Between 1 and 12 navigation links are required per column',
      },
    },
  },
  { _id: false }
);

const navigationMenuSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, enum: ['eyeglasses', 'sunglasses', 'contact-lenses'] },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, trim: true, maxlength: 80 },
    columns: {
      type: [navigationColumnSchema],
      required: true,
      validate: {
        validator: (columns) => columns.length >= 1 && columns.length <= 4,
        message: 'Between 1 and 4 navigation columns are required per menu',
      },
    },
  },
  { _id: false }
);

/**
 * Singleton store settings, editable from the admin panel. Access via
 * `Settings.getSingleton()`.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    storeName: { type: String, default: 'Online Chasmewala' },
    supportEmail: { type: String, default: 'support@onlinechasmewala.com' },
    supportPhone: { type: String, default: '+91 90000 00000' },
    storeAddress: { type: String, default: 'MG Road, Bengaluru, Karnataka 560001' },
    businessHoursTitle: { type: String, default: 'Open every day' },
    businessHoursText: { type: String, default: 'Customer support is available from 9:00 AM to 8:00 PM.' },
    whatsappNumber: { type: String, default: '+91 90000 00000' },
    currency: { type: String, default: 'INR' },
    freeShippingThreshold: { type: Number, default: 999 },
    standardShippingFee: { type: Number, default: 49 },
    expressShippingFee: { type: Number, default: 129 },
    taxPercent: { type: Number, default: 0 }, // GST handled inclusive by default
    announcement: { type: String, default: 'Free shipping on orders above ₹999 · Easy 14-day returns' },
    // Small promotional messages shown above the storefront navigation. Admins
    // can add, remove and reorder these without requiring a frontend deploy.
    announcementItems: {
      type: [announcementItemSchema],
      default: () => DEFAULT_ANNOUNCEMENT_ITEMS.map((item) => ({ ...item })),
      validate: {
        validator: (items) => items.length >= 1 && items.length <= 12,
        message: 'Between 1 and 12 announcement items are required',
      },
    },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
    },
    // Home-page category cards. The admin can replace these six images without
    // rebuilding the storefront.
    homeCategoryImages: {
      eyeglasses: {
        men: { type: String, default: '' },
        women: { type: String, default: '' },
        kids: { type: String, default: '' },
      },
      sunglasses: {
        men: { type: String, default: '' },
        women: { type: String, default: '' },
        kids: { type: String, default: '' },
      },
    },
    trustBenefits: {
      type: [trustBenefitSchema],
      default: () => DEFAULT_TRUST_BENEFITS.map((benefit) => ({ ...benefit })),
      validate: {
        validator: (benefits) => benefits.length >= 1 && benefits.length <= 12,
        message: 'Between 1 and 12 trust benefits are required',
      },
    },
    navigationMenus: {
      type: [navigationMenuSchema],
      default: () => DEFAULT_NAVIGATION_MENUS.map((menu) => ({ ...menu })),
      validate: {
        validator: (menus) => menus.length === 3,
        message: 'Exactly three navigation menus are required',
      },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

export const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
