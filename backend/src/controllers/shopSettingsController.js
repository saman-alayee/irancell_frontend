const numberService = require('../services/NumberService');
const numberPricingService = require('../services/NumberPricingService');
const irancellShopService = require('../services/IrancellShopService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

exports.getPricing = asyncHandler(async (req, res) => {
  const settings = await numberPricingService.getSettings();
  success(res, {
    ...settings,
    irancellDevMode: irancellShopService.isDevMode(),
  });
});

exports.updatePricing = asyncHandler(async (req, res) => {
  const settings = await numberPricingService.updateSettings(req.body);
  success(res, settings, 'تنظیمات قیمت‌گذاری ذخیره شد');
});

exports.lookupNumber = asyncHandler(async (req, res) => {
  const result = await numberService.lookupFromIrancell(req.body.number);
  success(res, result);
});
