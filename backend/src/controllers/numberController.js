const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const numberService = require('../services/NumberService');

exports.getByNumber = asyncHandler(async (req, res) => {
  const item = await numberService.getByNumber(req.params.number);
  success(res, item);
});

exports.checkNumber = asyncHandler(async (req, res) => {
  const result = await numberService.checkAndSync(req.params.number);
  success(res, result);
});

exports.simSearch = asyncHandler(async (req, res) => {
  const q = req.query.q || req.query.search || '';
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const mode = req.query.mode === 'advanced' ? 'advanced' : 'simple';
  const prefix = req.query.prefix || '0930';
  const middle = req.query.middle || '';
  const end = req.query.end || '';
  const rest = req.query.rest || '';

  const result = await numberService.simSearch({ q, mode, prefix, middle, end, rest, offset }, limit);
  success(res, result);
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
