import mongoose from 'mongoose';

/**
 * Stock movement ledger for auditability and admin inventory management.
 * Product.stock remains the fast-read source of truth; this records *why* it
 * changed (restock, sale, return, adjustment).
 */
const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    change: { type: Number, required: true }, // +restock / -sale
    reason: {
      type: String,
      enum: ['restock', 'sale', 'return', 'adjustment', 'seed'],
      required: true,
    },
    balanceAfter: { type: Number, required: true },
    reference: { type: String }, // e.g. order number
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
