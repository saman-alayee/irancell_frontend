const Payment = require('../models/Payment');
const BaseRepository = require('./BaseRepository');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByAuthority(authority) {
    return this.model.findOne({ authority }).populate('order');
  }
}

module.exports = new PaymentRepository();
