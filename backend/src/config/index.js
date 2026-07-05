require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiPublicUrl: process.env.API_PUBLIC_URL || `http://127.0.0.1:${process.env.PORT || 3001}`,
  zarinpal: {
    merchantId: process.env.ZARINPAL_MERCHANT_ID || '',
    sandbox: process.env.ZARINPAL_SANDBOX === 'true',
    callbackUrl: process.env.ZARINPAL_CALLBACK_URL || 'http://127.0.0.1:3001/api/payment/verify',
  },
  smsIr: {
    apiKey: (process.env.SMS_IR_API_KEY || '').trim(),
    templateId: (process.env.SMS_IR_TEMPLATE_ID || '').trim(),
    codeParam: (process.env.SMS_IR_CODE_PARAM || 'VERIFICATIONCODE').trim(),
    devMode: process.env.SMS_IR_DEV_MODE === 'true',
  },
};
