const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    showTimer: { type: Boolean, default: true },
  },
  { timestamps: true }
);

discountSchema.index({ code: 1 });
discountSchema.index({ expiresAt: 1, isActive: 1 });

module.exports = mongoose.model('Discount', discountSchema);
