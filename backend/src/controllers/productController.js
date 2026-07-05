const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');
const productService = require('../services/ProductService');

exports.list = asyncHandler(async (req, res) => {
  const result = await productService.list(req.query);
  paginated(res, result.items, result.pagination);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  success(res, product);
});

exports.adminList = asyncHandler(async (req, res) => {
  const result = await productService.adminList(req.query);
  paginated(res, result.items, result.pagination);
});

exports.create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  success(res, product, 'Product created', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  success(res, product, 'Product updated');
});

exports.remove = asyncHandler(async (req, res) => {
  await productService.delete(req.params.id);
  success(res, null, 'Product deleted');
});
