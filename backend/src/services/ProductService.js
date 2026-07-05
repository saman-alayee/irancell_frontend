const productRepository = require('../repositories/ProductRepository');
const AppError = require('../utils/AppError');
const { slugify } = require('../utils/helpers');

class ProductService {
  _parseQuery(query) {
    return {
      page: Number(query.page) || 1,
      limit: Math.min(Number(query.limit) || 20, 100),
      search: query.search || '',
      category: query.category || '',
      minPrice: query.minPrice || '',
      maxPrice: query.maxPrice || '',
    };
  }

  async list(query) {
    const opts = this._parseQuery(query);
    return productRepository.findActive(
      { search: opts.search, category: opts.category, minPrice: opts.minPrice, maxPrice: opts.maxPrice },
      { page: opts.page, limit: opts.limit, sort: { createdAt: -1 } }
    );
  }

  async adminList(query) {
    const opts = this._parseQuery(query);
    return productRepository.searchAdmin(
      { search: opts.search, category: opts.category },
      { page: opts.page, limit: opts.limit, sort: { createdAt: -1 } }
    );
  }

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async create(data) {
    if (!data.slug) data.slug = slugify(data.title);
    const existing = await productRepository.findOne({ slug: data.slug });
    if (existing) throw new AppError('Slug already exists', 409);
    return productRepository.create(data);
  }

  async update(id, data) {
    if (data.title && !data.slug) data.slug = slugify(data.title);
    const updated = await productRepository.updateById(id, data);
    if (!updated) throw new AppError('Product not found', 404);
    return updated;
  }

  async delete(id) {
    const deleted = await productRepository.deleteById(id);
    if (!deleted) throw new AppError('Product not found', 404);
    return deleted;
  }
}

module.exports = new ProductService();
