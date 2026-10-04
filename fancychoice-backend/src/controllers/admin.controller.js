const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminService = require('../services/admin.service');

const dashboard = asyncHandler(async (req, res) => {
  const data = await adminService.dashboard();
  ApiResponse.success(res, data, 'Dashboard stats fetched');
});

const listUsers = asyncHandler(async (req, res) => {
  const { docs, total, page, limit } = await adminService.listUsers(req.query);
  ApiResponse.paginated(res, { docs, total, page, limit }, 'Users fetched');
});

const setRole = asyncHandler(async (req, res) => {
  const data = await adminService.updateUserRole(req.params.id, req.body.role);
  ApiResponse.success(res, data, 'User role updated');
});

module.exports = { dashboard, listUsers, setRole };
