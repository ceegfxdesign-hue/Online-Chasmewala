import mongoose from 'mongoose';

/** Home / marketing banner managed from the admin panel. */
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    mobileImage: { type: String },
    ctaLabel: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
    placement: {
      type: String,
      enum: ['hero', 'secondary', 'strip', 'category'],
      default: 'hero',
      index: true,
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
