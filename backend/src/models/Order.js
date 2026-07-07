const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['number', 'product'], required: true },
    numberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Number' },
    number: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    discountCode: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'user.mobile': 1 });

module.exports = mongoose.model('Order', orderSchema);
