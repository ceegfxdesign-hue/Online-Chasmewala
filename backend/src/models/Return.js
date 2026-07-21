import mongoose from 'mongoose';
import { RETURN_STATUS, RETURN_TYPE } from '../constants/index.js';

const returnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(RETURN_TYPE), default: RETURN_TYPE.RETURN },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: { type: Number, min: 1 },
        reason: { type: String, required: true },
      },
    ],
    // For exchanges: the desired replacement.
    exchangeFor: {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      color: String,
    },
    status: {
      type: String,
      enum: Object.values(RETURN_STATUS),
      default: RETURN_STATUS.REQUESTED,
      index: true,
    },
    refund: {
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
      processedAt: { type: Date },
      method: { type: String, default: 'original' },
    },
    comment: { type: String },
    timeline: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

returnSchema.pre('validate', function setReturnNumber(next) {
  if (!this.returnNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.returnNumber = `RET-${Date.now().toString(36).toUpperCase().slice(-5)}-${rand}`;
  }
  if (!this.timeline?.length) this.timeline = [{ status: this.status, note: 'Request created' }];
  next();
});

export const Return = mongoose.model('Return', returnSchema);
export default Return;
