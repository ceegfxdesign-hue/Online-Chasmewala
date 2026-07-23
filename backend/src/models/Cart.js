import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    // Snapshot of unit price at time of adding (kept in sync on read).
    price: { type: Number, required: true },
    // Optional lens/prescription selection captured during add-to-cart.
    lensOption: {
      type: { type: String }, // e.g. 'single-vision', 'zero-power'
      label: { type: String },
      price: { type: Number, default: 0 },
    },
    prescription: {
      method: { type: String, enum: ['manual', 'later', 'upload'] },
      fileName: { type: String },
      leftEye: { sph: String, cyl: String, axis: String },
      rightEye: { sph: String, cyl: String, axis: String },
      pd: String,
    },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema],
    coupon: {
      code: { type: String },
      discount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
