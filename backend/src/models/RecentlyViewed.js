import mongoose from 'mongoose';

/** Tracks the products a user has recently viewed (capped list). */
const recentlyViewedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);
export default RecentlyViewed;
