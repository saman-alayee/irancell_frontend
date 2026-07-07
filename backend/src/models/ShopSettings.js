const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    markupType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    markupValue: { type: Number, default: 0, min: 0 },
    irancellFetchEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShopSettings', shopSettingsSchema);
