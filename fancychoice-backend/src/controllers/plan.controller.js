const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const planService = require('../services/plan.service');

const list = asyncHandler(async (req, res) => {
  const data = await planService.listPlans();
  ApiResponse.success(res, data, 'Plans fetched');
});

const get = asyncHandler(async (req, res) => {
  const data = await planService.getPlan(req.params.id);
  ApiResponse.success(res, data, 'Plan fetched');
});

const create = asyncHandler(async (req, res) => {
  const data = await planService.createPlan(req.body);
  ApiResponse.created(res, data, 'Plan created');
});

const update = asyncHandler(async (req, res) => {
  const data = await planService.updatePlan(req.params.id, req.body);
  ApiResponse.success(res, data, 'Plan updated');
});

const remove = asyncHandler(async (req, res) => {
  const data = await planService.deletePlan(req.params.id);
  ApiResponse.success(res, data, 'Plan deactivated');
});

module.exports = { list, get, create, update, remove };
