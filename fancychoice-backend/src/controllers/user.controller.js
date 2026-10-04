const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.user._id);
  ApiResponse.success(res, data, 'Profile fetched');
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.user._id, req.body);
  ApiResponse.success(res, data, 'Profile updated');
});

const addAddress = asyncHandler(async (req, res) => {
  const data = await userService.addAddress(req.user._id, req.body);
  ApiResponse.created(res, data, 'Address added');
});

const updateAddress = asyncHandler(async (req, res) => {
  const data = await userService.updateAddress(req.user._id, req.params.addressId, req.body);
  ApiResponse.success(res, data, 'Address updated');
});

const deleteAddress = asyncHandler(async (req, res) => {
  const data = await userService.deleteAddress(req.user._id, req.params.addressId);
  ApiResponse.success(res, data, 'Address deleted');
});

const deleteAccount = asyncHandler(async (req, res) => {
  const data = await userService.deactivateAccount(req.user._id);
  ApiResponse.success(res, data, 'Account deactivated');
});

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, deleteAccount };
