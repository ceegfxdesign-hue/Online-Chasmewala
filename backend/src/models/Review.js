import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVerifiedPurchase: { type: Boolean, default: false },
    // Moderation
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
  },
  { timestamps: true }
);

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.virtual('likeCount').get(function likeCount() {
  return this.likes?.length || 0;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
