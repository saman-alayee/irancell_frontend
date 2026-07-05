const axios = require('axios');
const config = require('../config');
const AppError = require('../utils/AppError');
const { toSmsIrMobile } = require('../utils/helpers');

class SmsService {
  async sendVerifyCode(mobile, code) {
    const { apiKey, templateId, codeParam, devMode } = config.smsIr;

    if (devMode) {
      console.log(`[SMS DEV] OTP for ${mobile}: ${code}`);
      return { dev: true };
    }

    if (!apiKey) {
      throw new AppError('تنظیمات پیامک ناقص است — API Key تعریف نشده', 500);
    }

    if (!templateId) {
      throw new AppError('تنظیمات پیامک ناقص است — TemplateId تعریف نشده', 500);
    }

    const payload = {
      mobile: toSmsIrMobile(mobile),
      templateId: Number(templateId),
      parameters: [
        { name: codeParam, value: String(code) },
      ],
    };

    try {
      const response = await axios.post(
        'https://api.sms.ir/v1/send/verify',
        payload,
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 15000,
        }
      );

      const data = response.data;
      if (data?.status !== 1) {
        const msg = data?.message || 'ارسال پیامک ناموفق بود';
        if (process.env.NODE_ENV !== 'production') {
          console.error('[SMS.ir] verify failed:', { payload: { ...payload, parameters: '[hidden]' }, response: data });
        }
        throw new AppError(msg, 502);
      }

      return data;
    } catch (err) {
      if (err instanceof AppError) throw err;

      const apiData = err.response?.data;
      const msg = apiData?.message || apiData?.Message || err.message;

      if (process.env.NODE_ENV !== 'production') {
        console.error('[SMS.ir] request error:', apiData || err.message);
      }

      throw new AppError(`خطا در ارسال پیامک: ${msg}`, 502);
    }
  }
}

module.exports = new SmsService();
