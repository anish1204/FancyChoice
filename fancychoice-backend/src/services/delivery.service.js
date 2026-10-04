const QRCode = require('qrcode');
const Delivery = require('../models/Delivery');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');

function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function scopeFilter(user, extra = {}) {
  if (user.role === 'customer') return { user: user._id, ...extra };
  if (user.role === 'deliveryBoy') return { deliveryBoy: user._id, ...extra };
  return { ...extra }; // admin sees all
}

async function getToday(user) {
  const { start, end } = dayRange();
  const filter = await scopeFilter(user, { scheduledDate: { $gte: start, $lte: end } });
  return Delivery.find(filter).populate('subscription user deliveryBoy').sort({ slot: 1 });
}

async function getHistory(user, { page = 1, limit = 20, status }) {
  const filter = await scopeFilter(user, { scheduledDate: { $lt: dayRange().start } });
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    Delivery.find(filter).populate('subscription').sort({ scheduledDate: -1 }).skip(skip).limit(limit),
    Delivery.countDocuments(filter),
  ]);
  return { docs, total, page: Number(page), limit: Number(limit) };
}

async function getById(user, id) {
  const d = await Delivery.findById(id).populate('subscription user deliveryBoy');
  if (!d) throw ApiError.notFound('Delivery not found');
  if (user.role === 'customer' && d.user._id.toString() !== user._id.toString()) throw ApiError.forbidden('Not your delivery');
  if (user.role === 'deliveryBoy' && d.deliveryBoy && d.deliveryBoy._id.toString() !== user._id.toString()) {
    throw ApiError.forbidden('Not assigned to you');
  }
  return d;
}

async function updateStatus(user, id, { status, failureReason, lat, lng, proofImages }) {
  const d = await Delivery.findById(id);
  if (!d) throw ApiError.notFound('Delivery not found');
  if (user.role === 'deliveryBoy' && d.deliveryBoy && d.deliveryBoy.toString() !== user._id.toString()) {
    throw ApiError.forbidden('Not assigned to you');
  }
  d.status = status;
  if (failureReason) d.failureReason = failureReason;
  if (lat) d.location = { ...(d.location || {}), lat, lng };
  if (proofImages) d.proofImages = proofImages;
  if (status === 'delivered') {
    d.deliveredAt = new Date();
    await Subscription.findByIdAndUpdate(d.subscription, { $inc: { deliveredCount: 1 } });
  }
  await d.save();
  return d;
}

async function rateDelivery(user, id, { score, comment }) {
  const d = await Delivery.findById(id);
  if (!d) throw ApiError.notFound('Delivery not found');
  if (d.user.toString() !== user._id.toString()) throw ApiError.forbidden('Not your delivery');
  if (d.status !== 'delivered') throw ApiError.badRequest('Can only rate delivered orders');
  d.rating = { score, comment, ratedAt: new Date() };
  await d.save();
  return d;
}

async function getQrCode(user, id) {
  const d = await Delivery.findById(id);
  if (!d) throw ApiError.notFound('Delivery not found');
  let token = d.qrCode?.token;
  const expired = !d.qrCode?.expiresAt || d.qrCode.expiresAt < new Date();
  if (!token || expired) token = await d.generateQRCode();
  const payload = JSON.stringify({ deliveryId: d._id.toString(), token });
  const qrImage = await QRCode.toDataURL(payload);
  return { token, qrImage, expiresAt: d.qrCode.expiresAt };
}

async function verifyQrCode(user, id, token) {
  const d = await Delivery.findById(id);
  if (!d) throw ApiError.notFound('Delivery not found');
  await d.verifyQRCode(token);
  return d;
}

async function assignDeliveryBoy(adminUser, id, deliveryBoyId) {
  const d = await Delivery.findById(id);
  if (!d) throw ApiError.notFound('Delivery not found');
  d.deliveryBoy = deliveryBoyId;
  await d.save();
  return d;
}

// Ratings & reviews summary for a delivery boy's own performance screen.
async function getMyRatings(deliveryBoyUser) {
  const mongoose = require('mongoose');
  const boyId = new mongoose.Types.ObjectId(deliveryBoyUser._id);
  const [agg] = await Delivery.aggregate([
    { $match: { deliveryBoy: boyId, 'rating.score': { $exists: true } } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        average: { $avg: '$rating.score' },
      },
    },
  ]);
  const reviews = await Delivery.find({ deliveryBoy: boyId, 'rating.score': { $exists: true } })
    .populate('user', 'name phone')
    .sort({ 'rating.ratedAt': -1 })
    .limit(20);
  return {
    count: agg?.count || 0,
    average: agg?.average ? Math.round(agg.average * 10) / 10 : 0,
    reviews,
  };
}

module.exports = {
  getToday,
  getHistory,
  getById,
  updateStatus,
  rateDelivery,
  getQrCode,
  verifyQrCode,
  assignDeliveryBoy,
  getMyRatings,
};
