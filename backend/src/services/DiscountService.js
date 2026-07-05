const discountRepository = require('../repositories/DiscountRepository');
const AppError = require('../utils/AppError');

class DiscountService {
  async getActiveTimer() {
    return discountRepository.findActiveWithTimer();
  }

  async validateCode(code, subtotal) {
    const discount = await discountRepository.findByCode(code);
    if (!discount) throw new AppError('Invalid discount code', 400);
    if (discount.expiresAt < new Date()) throw new AppError('Discount expired', 400);
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new AppError('Discount usage limit reached', 400);
    }
    if (subtotal < discount.minOrderAmount) {
      throw new AppError(`Minimum order amount is ${discount.minOrderAmount}`, 400);
    }

    let amount = 0;
    if (discount.type === 'percent') {
      amount = Math.floor((subtotal * discount.value) / 100);
    } else {
      amount = discount.value;
    }

    return { discount, amount: Math.min(amount, subtotal) };
  }

  async list(options) {
    return discountRepository.find({}, options);
  }

  async create(data) {
    data.code = data.code.toUpperCase();
    return discountRepository.create(data);
  }

  async update(id, data) {
    if (data.code) data.code = data.code.toUpperCase();
    const updated = await discountRepository.updateById(id, data);
    if (!updated) throw new AppError('Discount not found', 404);
    return updated;
  }

  async delete(id) {
    const deleted = await discountRepository.deleteById(id);
    if (!deleted) throw new AppError('Discount not found', 404);
    return deleted;
  }

  async incrementUsage(id) {
    return discountRepository.updateById(id, { $inc: { usedCount: 1 } });
  }
}

module.exports = new DiscountService();
