const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');

const createIntent = asyncHandler(async (req, res) => {
  const data = await paymentService.createIntent(req.user, req.body);
  ApiResponse.created(res, data, 'Payment intent created');
});

const confirm = asyncHandler(async (req, res) => {
  const data = await paymentService.confirmPayment(req.params.id, req.body);
  ApiResponse.success(res, data, 'Payment confirmed');
});

const myPayments = asyncHandler(async (req, res) => {
  const { docs, total, page, limit } = await paymentService.listMyPayments(req.user._id, req.query);
  ApiResponse.paginated(res, { docs, total, page, limit }, 'Payments fetched');
});

const refund = asyncHandler(async (req, res) => {
  const data = await paymentService.refund(req.params.id);
  ApiResponse.success(res, data, 'Payment refunded');
});

module.exports = { createIntent, confirm, myPayments, refund };
