import mongoose from 'mongoose';

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
    currency: { type: String, default: 'INR' },
    freeShippingThreshold: { type: Number, default: 999 },
    standardShippingFee: { type: Number, default: 49 },
    expressShippingFee: { type: Number, default: 129 },
    taxPercent: { type: Number, default: 0 }, // GST handled inclusive by default
    announcement: { type: String, default: 'Free shipping on orders above ₹999 · Easy 14-day returns' },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
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
