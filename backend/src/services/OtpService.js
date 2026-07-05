const otpRepository = require('../repositories/OtpRepository');
const userRepository = require('../repositories/UserRepository');
const smsService = require('./SmsService');
const AppError = require('../utils/AppError');
const { normalizeMobile } = require('../utils/helpers');

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 60;
const MAX_ATTEMPTS = 5;

class OtpService {
  generateCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  async send(mobile, purpose) {
    const normalized = normalizeMobile(mobile);
    if (!/^09\d{9}$/.test(normalized)) {
      throw new AppError('شماره موبایل نامعتبر است', 400);
    }

    const recent = await otpRepository.findRecent(normalized, purpose, RESEND_COOLDOWN_SEC);
    if (recent) {
      throw new AppError('لطفاً ۶۰ ثانیه صبر کنید و دوباره تلاش کنید', 429);
    }

    if (purpose === 'register') {
      const existing = await userRepository.findByMobilePublic(normalized);
      if (existing) throw new AppError('این شماره موبایل قبلاً ثبت شده است', 409);
    } else if (purpose === 'login') {
      const user = await userRepository.findByMobilePublic(normalized);
      if (!user) throw new AppError('کاربری با این شماره یافت نشد', 404);
    } else {
      throw new AppError('نوع درخواست نامعتبر است', 400);
    }

    const code = this.generateCode();
    await otpRepository.invalidateAll(normalized, purpose);
    await otpRepository.create({
      mobile: normalized,
      code,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    await smsService.sendVerifyCode(normalized, code);

    return {
      message: 'کد تأیید ارسال شد',
      expiresIn: OTP_TTL_MS / 1000,
      resendAfter: RESEND_COOLDOWN_SEC,
    };
  }

  async verify(mobile, code, purpose) {
    const normalized = normalizeMobile(mobile);
    const otp = await otpRepository.findValid(normalized, purpose);
    if (!otp) throw new AppError('کد تأیید نامعتبر یا منقضی شده است', 400);

    if (otp.attempts >= MAX_ATTEMPTS) {
      await otpRepository.invalidateAll(normalized, purpose);
      throw new AppError('تعداد تلاش بیش از حد — لطفاً کد جدید درخواست کنید', 429);
    }

    if (String(code).trim() !== otp.code) {
      await otpRepository.incrementAttempts(otp._id);
      throw new AppError('کد تأیید اشتباه است', 400);
    }

    await otpRepository.deleteById(otp._id);
    return true;
  }
}

module.exports = new OtpService();
