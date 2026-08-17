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
        validator: (benefits) => benefits.length === 4,
        message: 'Exactly four trust benefits are required',
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
