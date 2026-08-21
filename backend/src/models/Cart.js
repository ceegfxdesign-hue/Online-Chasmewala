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
      type: { type: String }, // composite e.g. 'single-vision:blu-screen'
      baseType: { type: String },
      powerTypeLabel: { type: String },
      packageId: { type: String },
      packageName: { type: String },
      colour: { type: String },
      label: { type: String },
      subtitle: { type: String },
      price: { type: Number, default: 0 },
      mrp: { type: Number },
      badge: { type: String },
      image: { type: String },
      features: [{ type: String }],
      warrantyMonths: { type: Number },
      tags: [{ type: String }],
    },
    // Generated from the resolved lens package and sorted prescription values;
    // clients cannot choose it. It keeps distinct prescriptions on distinct
    // lines while identical configurations can still merge quantities.
    configurationFingerprint: { type: String },
    prescription: {
      // `later` and `upload` remain in the stored schema solely so historical
      // carts can still be read. New API writes only accept `manual`.
      method: { type: String, enum: ['manual', 'later', 'upload'] },
      fileName: { type: String },
      // New prescriptions use this generic field-name -> selected-value map.
      values: { type: Map, of: String },
      // Legacy fields retained for old carts.
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
