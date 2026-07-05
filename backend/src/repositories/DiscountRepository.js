const Discount = require('../models/Discount');
const BaseRepository = require('./BaseRepository');

class DiscountRepository extends BaseRepository {
  constructor() {
    super(Discount);
  }

  async findByCode(code) {
    return this.model.findOne({ code: code.toUpperCase(), isActive: true });
  }

  async findActiveWithTimer() {
    return this.model.findOne({
      isActive: true,
      showTimer: true,
      expiresAt: { $gt: new Date() },
    });
  }
}

module.exports = new DiscountRepository();
