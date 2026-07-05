const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const excelService = require('../services/ExcelService');

exports.preview = asyncHandler(async (req, res) => {
  if (!req.file) throw new (require('../utils/AppError'))('File required', 400);
  const result = await excelService.preview(req.file.buffer);
  success(res, result);
});

exports.import = asyncHandler(async (req, res) => {
  if (!req.file) throw new (require('../utils/AppError'))('File required', 400);
  const result = await excelService.import(req.file.buffer);
  success(res, result, 'Import completed');
});
