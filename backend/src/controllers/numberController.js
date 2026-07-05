const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const numberService = require('../services/NumberService');

exports.getByNumber = asyncHandler(async (req, res) => {
  const item = await numberService.getByNumber(req.params.number);
  success(res, item);
});

exports.search = asyncHandler(async (req, res) => {
  const result = await numberService.search(req.query, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  paginated(res, result.items, result.pagination);
});

exports.create = asyncHandler(async (req, res) => {
  const item = await numberService.create(req.body);
  success(res, item, 'Number created', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const item = await numberService.update(req.params.id, req.body);
  success(res, item, 'Number updated');
});

exports.remove = asyncHandler(async (req, res) => {
  await numberService.delete(req.params.id);
  success(res, null, 'Number deleted');
});

exports.stats = asyncHandler(async (req, res) => {
  const stats = await numberService.getStats();
  success(res, stats);
});
