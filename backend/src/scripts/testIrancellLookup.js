#!/usr/bin/env node
require('dotenv').config();
const { connectDB } = require('../config/database');
const irancellShopService = require('../services/IrancellShopService');
const numberPricingService = require('../services/NumberPricingService');

const number = process.argv[2] || '09001071252';

(async () => {
  await connectDB();
  console.log('Dev mode:', process.env.IRANCELL_SHOP_DEV_MODE === 'true');
  const lookup = await irancellShopService.lookupNumber(number);
  const settings = await numberPricingService.getSettings();
  const priced = numberPricingService.buildPricing(lookup, settings);
  console.log(JSON.stringify(priced, null, 2));
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
