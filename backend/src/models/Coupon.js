import mongoose from 'mongoose';
import { COUPON_TYPE } from '../constants/index.js';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String },
    type: { type: String, enum: Object.values(COUPON_TYPE), required: true },
    value: { type: Number, required: true, min: 0 }, // percent or flat amount
    maxDiscount: { type: Number }, // cap for percentage coupons
    minOrderValue: { type: Number, default: 0 },

    usageLimit: { type: Number, default: 0 }, // 0 = unlimited (total)
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, count: Number }],

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

/** Compute the discount this coupon yields for a given subtotal. */
couponSchema.methods.computeDiscount = function computeDiscount(subtotal) {
  if (this.type === COUPON_TYPE.PERCENT) {
    const raw = (subtotal * this.value) / 100;
    return Math.round(this.maxDiscount ? Math.min(raw, this.maxDiscount) : raw);
  }
  return Math.min(this.value, subtotal);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
