const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ['register', 'login'], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ mobile: 1, purpose: 1 });

module.exports = mongoose.model('Otp', otpSchema);
