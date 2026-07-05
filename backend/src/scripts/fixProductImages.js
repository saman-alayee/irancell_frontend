require('dotenv').config();
const { connectDB } = require('../config/database');
const Product = require('../models/Product');

const LEGACY_MAP = {
  '/images/modem-350.jpg': '/uploads/products/modem-350.jpg',
  '/images/modem-711.jpg': '/uploads/products/modem-711.jpg',
  '/images/sim.jpg': '/uploads/products/sim.jpg',
};

const fix = async () => {
  await connectDB();
  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const next = (product.images || []).map((url) => {
      if (LEGACY_MAP[url]) return LEGACY_MAP[url];
      if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url)) {
        return url.replace(/^https?:\/\/[^/]+/, '');
      }
      return url;
    });

    const changed = JSON.stringify(next) !== JSON.stringify(product.images || []);
    if (changed) {
      product.images = next;
      await product.save();
      updated += 1;
      console.log(`Fixed: ${product.slug} -> ${next.join(', ')}`);
    }
  }

  console.log(`Done. Updated ${updated} product(s).`);
  process.exit(0);
};

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
