import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['order', 'promo', 'account', 'return', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    icon: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
