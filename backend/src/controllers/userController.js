const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const userService = require('../services/UserService');

exports.sendOtp = asyncHandler(async (req, res) => {
  const result = await userService.sendOtp(req.body.mobile, req.body.purpose);
  success(res, result, result.message);
});

exports.register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body);
  success(res, result, 'ثبت‌نام با موفقیت انجام شد', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body.mobile, req.body.password);
  success(res, result, 'ورود موفق');
});

exports.loginWithOtp = asyncHandler(async (req, res) => {
  const result = await userService.loginWithOtp(req.body.mobile, req.body.code);
  success(res, result, 'ورود موفق');
});

exports.me = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  success(res, profile);
});
