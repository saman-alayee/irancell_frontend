const mongoose = require('mongoose');

const NUMBER_STATUSES = ['available', 'reserved', 'sold'];

const numberSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^09\d{9}$/,
    },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: NUMBER_STATUSES, default: 'available' },
    description: { type: String, default: '' },
    category: { type: String, default: 'standard' },
  },
  { timestamps: true }
);

numberSchema.index({ number: 1 });
numberSchema.index({ status: 1 });
numberSchema.index({ price: 1 });

module.exports = mongoose.model('Number', numberSchema);
module.exports.NUMBER_STATUSES = NUMBER_STATUSES;
