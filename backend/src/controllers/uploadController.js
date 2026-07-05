const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const config = require('../config');

exports.uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('فایل تصویر الزامی است', 400);

  const imageUrl = `${config.apiPublicUrl || 'http://127.0.0.1:3001'}/uploads/products/${req.file.filename}`;
  success(res, { url: imageUrl, filename: req.file.filename }, 'تصویر آپلود شد', 201);
});
