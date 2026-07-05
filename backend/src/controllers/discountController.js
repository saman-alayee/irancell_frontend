const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const discountService = require('../services/DiscountService');

exports.list = asyncHandler(async (req, res) => {
  const result = await discountService.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  paginated(res, result.items, result.pagination);
});

exports.create = asyncHandler(async (req, res) => {
  const discount = await discountService.create(req.body);
  success(res, discount, 'Discount created', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const discount = await discountService.update(req.params.id, req.body);
  success(res, discount, 'Discount updated');
});

exports.remove = asyncHandler(async (req, res) => {
  await discountService.delete(req.params.id);
  success(res, null, 'Discount deleted');
});
