const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const numberValidator = [
  body('number').matches(/^09\d{9}$/).withMessage('Invalid number format'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('status').optional().isIn(['available', 'reserved', 'sold']),
];

const productValidator = [
  body('title').notEmpty().withMessage('Title required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock required'),
];

const checkoutValidator = [
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('mobile').matches(/^09\d{9}$/).withMessage('Invalid mobile'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Invalid email'),
  body('cartItems').isArray({ min: 1 }).withMessage('Cart items required'),
];

const discountValidator = [
  body('code').notEmpty().withMessage('Code required'),
  body('type').isIn(['percent', 'fixed']).withMessage('Invalid type'),
  body('value').isFloat({ min: 0 }).withMessage('Valid value required'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date required'),
];

const userRegisterValidator = [
  body('firstName').notEmpty().withMessage('نام الزامی است'),
  body('lastName').notEmpty().withMessage('نام خانوادگی الزامی است'),
  body('mobile').matches(/^09\d{9}$/).withMessage('شماره موبایل نامعتبر است'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('ایمیل نامعتبر است'),
  body('password').isLength({ min: 6 }).withMessage('رمز عبور حداقل ۶ کاراکتر'),
  body('code').matches(/^\d{4}$/).withMessage('کد تأیید ۴ رقمی نامعتبر است'),
];

const otpSendValidator = [
  body('mobile').matches(/^09\d{9}$/).withMessage('شماره موبایل نامعتبر است'),
  body('purpose').isIn(['register', 'login']).withMessage('نوع درخواست نامعتبر است'),
];

const userLoginValidator = [
  body('mobile').matches(/^09\d{9}$/).withMessage('شماره موبایل نامعتبر است'),
  body('password').notEmpty().withMessage('رمز عبور الزامی است'),
];

const userLoginOtpValidator = [
  body('mobile').matches(/^09\d{9}$/).withMessage('شماره موبایل نامعتبر است'),
  body('code').matches(/^\d{4}$/).withMessage('کد تأیید ۴ رقمی نامعتبر است'),
];

const adminCreateValidator = [
  body('email').isEmail().withMessage('ایمیل نامعتبر است'),
  body('password').isLength({ min: 6 }).withMessage('رمز عبور حداقل ۶ کاراکتر'),
  body('name').notEmpty().withMessage('نام الزامی است'),
];

module.exports = {
  loginValidator,
  numberValidator,
  productValidator,
  checkoutValidator,
  discountValidator,
  userRegisterValidator,
  otpSendValidator,
  userLoginValidator,
  userLoginOtpValidator,
  adminCreateValidator,
};
