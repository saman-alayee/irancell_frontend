const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const Admin = require('../models/Admin');
const User = require('../models/User');

const authAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (decoded.role === 'user') {
    throw new AppError('Unauthorized', 401);
  }

  const admin = await Admin.findById(decoded.id).select('-password');
  if (!admin) throw new AppError('Unauthorized', 401);

  req.admin = admin;
  next();
});

const authUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('لطفاً وارد حساب کاربری شوید', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (decoded.role !== 'user') {
    throw new AppError('Unauthorized', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('Unauthorized', 401);

  req.user = user;
  next();
});

const authOptional = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded.role === 'user') {
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch {}
  next();
});

module.exports = { authAdmin, authUser, authOptional };
