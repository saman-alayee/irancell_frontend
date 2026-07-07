const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const AppError = require('../utils/AppError');
const excelService = require('../services/ExcelService');

const getSource = (req) => (req.query.source === 'irancell' ? 'irancell' : 'manual');

exports.preview = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('File required', 400);
  const result = await excelService.preview(req.file.buffer, { source: getSource(req) });
  success(res, result);
});

exports.import = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('File required', 400);
  const result = await excelService.import(req.file.buffer, { source: getSource(req) });
  success(res, result, 'Import completed');
});
