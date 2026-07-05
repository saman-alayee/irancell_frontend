const orderRepository = require('../repositories/OrderRepository');
const paymentRepository = require('../repositories/PaymentRepository');
const numberRepository = require('../repositories/NumberRepository');
const productRepository = require('../repositories/ProductRepository');
const numberService = require('./NumberService');
const discountService = require('./DiscountService');
const zarinPalService = require('./ZarinPalService');
const AppError = require('../utils/AppError');
const { generateOrderNumber, normalizeMobile } = require('../utils/helpers');

class OrderService {
  async buildItems(cartItems) {
    const items = [];

    for (const cartItem of cartItems) {
      if (cartItem.type === 'number') {
        const num = await numberRepository.findByNumber(cartItem.number);
        if (!num) throw new AppError(`Number ${cartItem.number} not found`, 404);
        if (num.status !== 'available') {
          throw new AppError(`Number ${cartItem.number} is not available`, 400);
        }
        items.push({
          type: 'number',
          numberId: num._id,
          title: num.number,
          quantity: 1,
          unitPrice: num.price,
          totalPrice: num.price,
        });
      } else if (cartItem.type === 'product') {
        const product = await productRepository.findById(cartItem.productId);
        if (!product || !product.isActive) {
          throw new AppError('Product not found', 404);
        }
        const qty = cartItem.quantity || 1;
        if (product.stock < qty) throw new AppError(`Insufficient stock for ${product.title}`, 400);
        items.push({
          type: 'product',
          productId: product._id,
          title: product.title,
          quantity: qty,
          unitPrice: product.price,
          totalPrice: product.price * qty,
        });
      }
    }

    return items;
  }

  async createOrder({ user, cartItems, discountCode }) {
    const items = await this.buildItems(cartItems);
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    let discountAmount = 0;
    let discount = null;
    if (discountCode) {
      const result = await discountService.validateCode(discountCode, subtotal);
      discountAmount = result.amount;
      discount = result.discount;
    }

    const totalAmount = subtotal - discountAmount;
    const orderNumber = generateOrderNumber();

    const order = await orderRepository.create({
      orderNumber,
      user: {
        ...user,
        mobile: normalizeMobile(user.mobile),
      },
      items,
      subtotal,
      discountAmount,
      totalAmount,
      discountCode: discount?.code,
      status: 'pending',
      paymentStatus: 'pending',
    });

    for (const item of items) {
      if (item.type === 'number') {
        await numberService.reserve(item.numberId);
      }
    }

    if (discount) {
      await discountService.incrementUsage(discount._id);
    }

    return order;
  }

  async initiatePayment(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400);

    const paymentResult = await zarinPalService.requestPayment({
      amount: order.totalAmount * 10,
      description: `Order ${order.orderNumber}`,
      mobile: order.user.mobile,
      email: order.user.email,
      orderId: order._id,
    });

    await paymentRepository.create({
      order: order._id,
      amount: order.totalAmount,
      authority: paymentResult.authority,
      status: 'pending',
    });

    return { paymentUrl: paymentResult.paymentUrl, authority: paymentResult.authority };
  }

  async verifyPayment(authority) {
    const payment = await paymentRepository.findByAuthority(authority);
    if (!payment) throw new AppError('Payment not found', 404);

    const order = payment.order;
    if (payment.status === 'success') {
      return { order, refId: payment.refId };
    }

    const verifyResult = await zarinPalService.verifyPayment(authority, order.totalAmount * 10);

    await paymentRepository.updateById(payment._id, {
      status: 'success',
      refId: verifyResult.refId,
      rawResponse: verifyResult.raw,
    });

    await orderRepository.updateById(order._id, {
      status: 'paid',
      paymentStatus: 'paid',
    });

    for (const item of order.items) {
      if (item.type === 'number' && item.numberId) {
        await numberService.markSold(item.numberId);
      }
      if (item.type === 'product' && item.productId) {
        await productRepository.updateById(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    const updatedOrder = await orderRepository.findById(order._id);
    return { order: updatedOrder, refId: verifyResult.refId };
  }

  async track({ orderNumber, mobile }) {
    if (orderNumber) {
      const order = await orderRepository.findByOrderNumber(orderNumber);
      if (!order) throw new AppError('Order not found', 404);
      return [order];
    }
    if (mobile) {
      const result = await orderRepository.findByMobile(normalizeMobile(mobile));
      return result.items;
    }
    throw new AppError('Order number or mobile required', 400);
  }

  async adminList(query) {
    const options = {
      page: Number(query.page) || 1,
      limit: Math.min(Number(query.limit) || 20, 100),
    };
    return orderRepository.adminSearch(
      {
        fromDate: query.fromDate,
        toDate: query.toDate,
        itemType: query.itemType,
        status: query.status,
        search: query.search,
      },
      options
    );
  }

  async getById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async updateStatus(id, status) {
    const updated = await orderRepository.updateById(id, { status });
    if (!updated) throw new AppError('Order not found', 404);
    return updated;
  }

  async getDashboardStats() {
    const [orderCount, numberStats, productCount, paidOrders, revenueAgg] = await Promise.all([
      orderRepository.count(),
      numberRepository.getStats(),
      productRepository.count(),
      orderRepository.count({ paymentStatus: 'paid' }),
      orderRepository.model.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ordersByDay, revenueByDay, ordersByStatus] = await Promise.all([
      orderRepository.model.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      orderRepository.model.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      orderRepository.model.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      orderCount,
      paidOrderCount: paidOrders,
      totalRevenue,
      numberStats,
      productCount,
      charts: {
        ordersByDay: ordersByDay.map((d) => ({ date: d._id, count: d.count })),
        revenueByDay: revenueByDay.map((d) => ({ date: d._id, total: d.total })),
        ordersByStatus: ordersByStatus.map((d) => ({ status: d._id, count: d.count })),
      },
    };
  }
}

module.exports = new OrderService();
