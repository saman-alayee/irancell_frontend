const AppError = require('../utils/AppError');

const store = new Map();

const rateLimit = ({ windowMs = 60_000, max = 20, message = 'تعداد درخواست بیش از حد مجاز است' } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      return next(new AppError(message, 429));
    }

    next();
  };
};

module.exports = rateLimit;
