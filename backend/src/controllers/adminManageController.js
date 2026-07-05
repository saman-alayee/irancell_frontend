const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const adminManageService = require('../services/AdminManageService');

exports.list = asyncHandler(async (req, res) => {
  const result = await adminManageService.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  paginated(res, result.items, result.pagination);
});

exports.create = asyncHandler(async (req, res) => {
  const admin = await adminManageService.create(req.body);
  success(res, admin, 'مدیر جدید ایجاد شد', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const admin = await adminManageService.update(req.params.id, req.body);
  success(res, admin, 'مدیر به‌روزرسانی شد');
});

exports.remove = asyncHandler(async (req, res) => {
  await adminManageService.remove(req.params.id, req.admin._id);
  success(res, null, 'مدیر حذف شد');
});
