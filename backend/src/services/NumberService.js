const numberRepository = require('../repositories/NumberRepository');
const AppError = require('../utils/AppError');
const { normalizeNumber } = require('../utils/helpers');

class NumberService {
  async getByNumber(number) {
    const normalized = normalizeNumber(number);
    const item = await numberRepository.findByNumber(normalized);
    if (!item) throw new AppError('Number not found', 404);
    return item;
  }

  async search(query, options) {
    return numberRepository.search(query, options);
  }

  async create(data) {
    data.number = normalizeNumber(data.number);
    const existing = await numberRepository.findByNumber(data.number);
    if (existing) throw new AppError('Number already exists', 409);
    return numberRepository.create(data);
  }

  async update(id, data) {
    if (data.number) {
      data.number = normalizeNumber(data.number);
      const existing = await numberRepository.findByNumber(data.number);
      if (existing && existing._id.toString() !== id) {
        throw new AppError('Number already exists', 409);
      }
    }
    const updated = await numberRepository.updateById(id, data);
    if (!updated) throw new AppError('Number not found', 404);
    return updated;
  }

  async delete(id) {
    const deleted = await numberRepository.deleteById(id);
    if (!deleted) throw new AppError('Number not found', 404);
    return deleted;
  }

  async getStats() {
    return numberRepository.getStats();
  }

  async reserve(numberId) {
    const item = await numberRepository.findById(numberId);
    if (!item) throw new AppError('Number not found', 404);
    if (item.status !== 'available') {
      throw new AppError('Number is not available', 400);
    }
    return numberRepository.updateById(numberId, { status: 'reserved' });
  }

  async markSold(numberId) {
    return numberRepository.updateById(numberId, { status: 'sold' });
  }

  async release(numberId) {
    const item = await numberRepository.findById(numberId);
    if (item?.status === 'reserved') {
      return numberRepository.updateById(numberId, { status: 'available' });
    }
  }
}

module.exports = new NumberService();
