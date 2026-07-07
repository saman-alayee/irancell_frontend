const ShopSettings = require('../models/ShopSettings');

const DEFAULTS = {
  markupType: 'percent',
  markupValue: 0,
  irancellFetchEnabled: true,
};

class NumberPricingService {
  async getSettings() {
    let doc = await ShopSettings.findOne({ key: 'default' });
    if (!doc) {
      doc = await ShopSettings.create({ key: 'default', ...DEFAULTS });
    }
    return doc.toObject();
  }

  async updateSettings(data) {
    const doc = await ShopSettings.findOneAndUpdate(
      { key: 'default' },
      {
        markupType: data.markupType ?? DEFAULTS.markupType,
        markupValue: Number(data.markupValue ?? DEFAULTS.markupValue),
        irancellFetchEnabled: data.irancellFetchEnabled ?? DEFAULTS.irancellFetchEnabled,
      },
      { upsert: true, new: true }
    );
    return doc.toObject();
  }

  applyMarkup(basePrice, settings = null) {
    const s = settings || DEFAULTS;
    const base = Math.max(0, Number(basePrice) || 0);
    const value = Math.max(0, Number(s.markupValue) || 0);
    if (s.markupType === 'fixed') return Math.round(base + value);
    return Math.round(base * (1 + value / 100));
  }

  buildPricing(lookup, settings) {
    const basePrice = Math.max(0, Number(lookup.basePrice) || 0);
    const price = this.applyMarkup(basePrice, settings);
    return {
      ...lookup,
      basePrice,
      price,
      markupType: settings.markupType,
      markupValue: settings.markupValue,
    };
  }
}

module.exports = new NumberPricingService();
