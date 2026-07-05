const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    category: { type: String, default: 'modem' },
    isActive: { type: Boolean, default: true },
    discountEnabled: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 99 },
    discountExpiresAt: { type: Date },
    showDiscountTimer: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
