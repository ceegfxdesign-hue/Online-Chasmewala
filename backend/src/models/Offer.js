import mongoose from 'mongoose';

/**
 * Automatic offer / seasonal collection. Powers the offer engine and the
 * home-page "Offers & Seasonal Collections" section.
 */
const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    image: { type: String },
    badge: { type: String }, // e.g. "Up to 50% off"

    // Targeting
    appliesTo: { type: String, enum: ['all', 'category', 'brand', 'products'], default: 'all' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },

    ctaLabel: { type: String, default: 'Shop now' },
    ctaLink: { type: String, default: '/products' },

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
