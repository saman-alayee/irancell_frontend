const axios = require('axios');
const config = require('../config');
const AppError = require('../utils/AppError');

const ZARINPAL_ERROR_MESSAGES = {
  '-11': 'درگاه زرین‌پال هنوز فعال نشده است. لطفاً در پنل زرین‌پال ترمینال را فعال کنید.',
  '-9': 'خطای اعتبارسنجی درگاه پرداخت.',
  '-2': 'اطلاعات پذیرنده نادرست است.',
  '-1': 'اطلاعات ارسالی ناقص است.',
};

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

  parseGatewayError(error) {
    const gatewayError = error?.response?.data?.errors;
    if (!gatewayError) return null;

    const code = String(gatewayError.code ?? '');
    const message = ZARINPAL_ERROR_MESSAGES[code] || gatewayError.message || 'خطا در اتصال به درگاه پرداخت';
    return new AppError(message, 502);
  }

  async postGateway(path, payload) {
    try {
      return await axios.post(`${this.baseUrl}${path}`, payload);
    } catch (error) {
      throw this.parseGatewayError(error) || error;
    }
  }

  buildMetadata({ mobile, email, orderId }) {
    const metadata = {};
    if (mobile) metadata.mobile = mobile;
    if (email) metadata.email = email;
    if (orderId) metadata.order_id = String(orderId);
    return metadata;
  }

  async requestPayment({ amount, description, mobile, email, orderId }) {
    if (!config.zarinpal.merchantId) {
      throw new AppError('درگاه پرداخت پیکربندی نشده است', 503);
    }

    const payload = {
      merchant_id: config.zarinpal.merchantId,
      amount,
      callback_url: config.zarinpal.callbackUrl,
      description,
    };

    const metadata = this.buildMetadata({ mobile, email, orderId });
    if (Object.keys(metadata).length) payload.metadata = metadata;

    const response = await this.postGateway('/request.json', payload);

    const data = response.data?.data;
    const errors = response.data?.errors;
    if (data?.code === 100 && data?.authority) {
      return {
        authority: data.authority,
        paymentUrl: `${this.gatewayUrl}/${data.authority}`,
      };
    }

    const code = String(errors?.code ?? '');
    const message = ZARINPAL_ERROR_MESSAGES[code] || errors?.message || 'خطا در ایجاد تراکنش پرداخت';
    throw new AppError(message, 502);
  }

  async verifyPayment(authority, amount) {
    const response = await this.postGateway('/verify.json', {
      merchant_id: config.zarinpal.merchantId,
      amount,
      authority,
    });

    const data = response.data?.data;
    const errors = response.data?.errors;
    if (data?.code === 100 || data?.code === 101) {
      return { refId: String(data.ref_id), raw: response.data };
    }

    const code = String(errors?.code ?? '');
    const message = ZARINPAL_ERROR_MESSAGES[code] || errors?.message || 'تأیید پرداخت ناموفق بود';
    throw new AppError(message, 402);
  }
}

module.exports = new ZarinPalService();
