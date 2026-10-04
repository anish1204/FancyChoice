const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const deliveryService = require('../services/delivery.service');

const today = asyncHandler(async (req, res) => {
  const data = await deliveryService.getToday(req.user);
  ApiResponse.success(res, data, "Today's deliveries fetched");
});

const history = asyncHandler(async (req, res) => {
  const { docs, total, page, limit } = await deliveryService.getHistory(req.user, req.query);
  ApiResponse.paginated(res, { docs, total, page, limit }, 'Delivery history fetched');
});

const getById = asyncHandler(async (req, res) => {
  const data = await deliveryService.getById(req.user, req.params.id);
  ApiResponse.success(res, data, 'Delivery fetched');
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await deliveryService.updateStatus(req.user, req.params.id, req.body);
  ApiResponse.success(res, data, 'Delivery status updated');
});

const rate = asyncHandler(async (req, res) => {
  const data = await deliveryService.rateDelivery(req.user, req.params.id, req.body);
  ApiResponse.success(res, data, 'Delivery rated');
});

const qrCode = asyncHandler(async (req, res) => {
  const data = await deliveryService.getQrCode(req.user, req.params.id);
  ApiResponse.success(res, data, 'QR code fetched');
});

const verifyQr = asyncHandler(async (req, res) => {
  const data = await deliveryService.verifyQrCode(req.user, req.params.id, req.body.token);
  ApiResponse.success(res, data, 'QR verified');
});

const assign = asyncHandler(async (req, res) => {
  const data = await deliveryService.assignDeliveryBoy(req.user, req.params.id, req.body.deliveryBoyId);
  ApiResponse.success(res, data, 'Delivery boy assigned');
});

const myRatings = asyncHandler(async (req, res) => {
  const data = await deliveryService.getMyRatings(req.user);
  ApiResponse.success(res, data, 'Ratings fetched');
});

module.exports = { today, history, getById, updateStatus, rate, qrCode, verifyQr, assign, myRatings };
