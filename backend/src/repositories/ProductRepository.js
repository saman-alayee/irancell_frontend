const Product = require('../models/Product');
const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug, isActive: true });
  }

  async findActive(query = {}, options = {}) {
    const filter = { isActive: true };
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.category) filter.category = query.category;
    if (query.minPrice) filter.price = { ...filter.price, $gte: Number(query.minPrice) };
    if (query.maxPrice) filter.price = { ...filter.price, $lte: Number(query.maxPrice) };
    return this.find(filter, options);
  }

  async searchAdmin(query = {}, options = {}) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.category) filter.category = query.category;
    return this.find(filter, options);
  }
}

module.exports = new ProductRepository();
