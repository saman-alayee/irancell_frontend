const axios = require('axios');
const config = require('../config');
const AppError = require('../utils/AppError');

class ZarinPalService {
  get baseUrl() {
    return config.zarinpal.sandbox
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';
  }

  get gatewayUrl() {
    return config.zarinpal.sandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://www.zarinpal.com/pg/StartPay';
  }

  async requestPayment({ amount, description, mobile, email, orderId }) {
    if (!config.zarinpal.merchantId) {
      throw new AppError('Payment gateway not configured', 503);
    }

    const response = await axios.post(`${this.baseUrl}/request.json`, {
      merchant_id: config.zarinpal.merchantId,
      amount,
      callback_url: config.zarinpal.callbackUrl,
      description,
      metadata: { mobile, email, order_id: orderId },
    });

    const data = response.data?.data;
    if (data?.code === 100 && data?.authority) {
      return {
        authority: data.authority,
        paymentUrl: `${this.gatewayUrl}/${data.authority}`,
      };
    }

    throw new AppError('Payment request failed', 502);
  }

  async verifyPayment(authority, amount) {
    const response = await axios.post(`${this.baseUrl}/verify.json`, {
      merchant_id: config.zarinpal.merchantId,
      amount,
      authority,
    });

    const data = response.data?.data;
    if (data?.code === 100 || data?.code === 101) {
      return { refId: String(data.ref_id), raw: response.data };
    }

    throw new AppError('Payment verification failed', 402);
  }
}

module.exports = new ZarinPalService();
