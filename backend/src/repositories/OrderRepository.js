const Order = require('../models/Order');
const BaseRepository = require('./BaseRepository');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(orderNumber) {
    return this.model.findOne({ orderNumber }).populate('items.numberId items.productId');
  }

  async findByMobile(mobile, options = {}) {
    return this.find({ 'user.mobile': mobile }, options);
  }

  async adminSearch(query = {}, options = {}) {
    const filter = {};
    if (query.fromDate) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(query.fromDate) };
    }
    if (query.toDate) {
      const to = new Date(query.toDate);
      to.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: to };
    }
    if (query.itemType === 'number') filter['items.type'] = 'number';
    if (query.itemType === 'product') filter['items.type'] = 'product';
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { 'user.mobile': { $regex: query.search.replace(/\D/g, ''), $options: 'i' } },
        { 'user.firstName': { $regex: query.search, $options: 'i' } },
        { 'items.title': { $regex: query.search.replace(/\D/g, ''), $options: 'i' } },
      ];
    }
    return this.find(filter, { ...options, sort: { createdAt: -1 } });
  }
}

module.exports = new OrderRepository();
