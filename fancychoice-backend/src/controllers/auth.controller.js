const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const sendOtp = asyncHandler(async (req, res) => {
  const result = await authService.sendOtp(req.body.phone, req.body.purpose);
  ApiResponse.success(res, result, 'OTP sent successfully');
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body.phone, req.body.otp);
  ApiResponse.success(res, result, 'Logged in successfully');
});

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  ApiResponse.created(res, result, 'Account created successfully');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, result, 'Logged in successfully');
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: client discards token. Endpoint kept for API parity.
  ApiResponse.success(res, null, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  ApiResponse.success(res, req.user.toSafeJSON(), 'Profile fetched');
});

module.exports = { sendOtp, verifyOtp, signup, login, logout, me };
