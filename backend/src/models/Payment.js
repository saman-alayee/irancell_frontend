const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    authority: { type: String },
    refId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    gateway: { type: String, default: 'zarinpal' },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ authority: 1 });
paymentSchema.index({ order: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
