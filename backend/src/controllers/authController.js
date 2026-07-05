const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const authService = require('../services/AuthService');

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  success(res, result, 'Login successful');
});

exports.me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.admin._id);
  success(res, profile);
});
