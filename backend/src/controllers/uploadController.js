const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');

exports.uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('فایل تصویر الزامی است', 400);

  const imageUrl = `/uploads/products/${req.file.filename}`;
  success(res, { url: imageUrl, filename: req.file.filename }, 'تصویر آپلود شد', 201);
});
