/** Package media is stored separately so settings responses remain small. */
import mongoose from 'mongoose';
export const LensMedia = mongoose.model(
  'LensMedia',
  new mongoose.Schema(
    {
      content: { type: Buffer, required: true, select: false },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
    },
    { timestamps: true }
  )
);
