import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/index.js';
import { env } from '../config/env.js';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' }, // Home / Work / Other
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

// Saved card — stores only non-sensitive display data + a gateway token.
const savedCardSchema = new mongoose.Schema(
  {
    brand: { type: String }, // visa / mastercard / rupay
    last4: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    holderName: { type: String },
    token: { type: String, required: true }, // opaque gateway token, never a PAN
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },

    addresses: [addressSchema],
    savedCards: [savedCardSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // OTP (mock provider stores the hash + expiry; real providers deliver it)
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },

    // Refresh-token rotation: store hashes of currently-valid refresh tokens.
    refreshTokens: { type: [String], select: false, default: [] },

    lastLoginAt: { type: Date },

    preferences: {
      newsletter: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.otpHash;
        delete ret.otpExpiresAt;
        delete ret.refreshTokens;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
