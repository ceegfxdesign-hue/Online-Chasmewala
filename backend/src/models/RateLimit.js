import mongoose from 'mongoose';

const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    totalHits: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false }
);

export const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);
export default RateLimit;
