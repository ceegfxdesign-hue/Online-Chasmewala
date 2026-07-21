import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot
    slug: { type: String }, // snapshot for review/product links
    image: { type: String },
    sku: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // unit price snapshot
    lensOption: {
      type: { type: String },
      label: { type: String },
      price: { type: Number, default: 0 },
    },
  },
  { _id: true }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    note: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },

    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },

    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      couponCode: { type: String },
      shippingFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    payment: {
      method: { type: String, enum: Object.values(PAYMENT_METHOD), required: true },
      status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
      transactionId: { type: String },
      paidAt: { type: Date },
      provider: { type: String, default: 'mock' },
    },

    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
    timeline: [timelineSchema],

    deliveryMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre('validate', function setOrderNumber(next) {
  if (!this.orderNumber) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const stamp = Date.now().toString(36).toUpperCase().slice(-5);
    this.orderNumber = `OC-${stamp}-${rand}`;
  }
  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [{ status: this.status, note: 'Order placed' }];
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
