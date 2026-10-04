const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const subService = require('../services/subscription.service');

const create = asyncHandler(async (req, res) => {
  const data = await subService.createSubscription(req.user._id, req.body);
  ApiResponse.created(res, data, 'Subscription created');
});

const mySubscriptions = asyncHandler(async (req, res) => {
  const { docs, total, page, limit } = await subService.getMySubscriptions(req.user._id, req.query);
  ApiResponse.paginated(res, { docs, total, page, limit }, 'Subscriptions fetched');
});

const myActive = asyncHandler(async (req, res) => {
  const data = await subService.getActiveSubscription(req.user._id);
  ApiResponse.success(res, data, 'Active subscription fetched');
});

const getById = asyncHandler(async (req, res) => {
  const data = await subService.getSubscriptionById(req.user, req.params.id);
  ApiResponse.success(res, data, 'Subscription fetched');
});

const update = asyncHandler(async (req, res) => {
  const data = await subService.updateSubscription(req.user, req.params.id, req.body);
  ApiResponse.success(res, data, 'Subscription updated');
});

const pause = asyncHandler(async (req, res) => {
  const data = await subService.pauseSubscription(req.user, req.params.id, req.body.reason);
  ApiResponse.success(res, data, 'Subscription paused');
});

const resume = asyncHandler(async (req, res) => {
  const data = await subService.resumeSubscription(req.user, req.params.id);
  ApiResponse.success(res, data, 'Subscription resumed');
});

const cancel = asyncHandler(async (req, res) => {
  const data = await subService.cancelSubscription(req.user, req.params.id);
  ApiResponse.success(res, data, 'Subscription cancelled');
});

module.exports = { create, mySubscriptions, myActive, getById, update, pause, resume, cancel };
