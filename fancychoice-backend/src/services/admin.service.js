const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function dashboard() {
  const { start, end } = todayRange();
  const [users, activeSubs, todayDeliveries, revenueAgg, deliveryStats] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Subscription.countDocuments({ status: 'active' }),
    Delivery.countDocuments({ scheduledDate: { $gte: start, $lte: end } }),
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Delivery.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  return {
    users,
    activeSubscriptions: activeSubs,
    todayDeliveries,
    totalRevenue: revenueAgg[0]?.total || 0,
    deliveryStats,
  };
}

async function listUsers({ page = 1, limit = 20, role, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { docs: docs.map((u) => u.toSafeJSON()), total, page: Number(page), limit: Number(limit) };
}

async function updateUserRole(userId, role) {
  if (!['customer', 'deliveryBoy', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role. Use customer, deliveryBoy or admin.');
  }
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  user.role = role;
  await user.save();
  return user.toSafeJSON();
}

module.exports = { dashboard, listUsers, updateUserRole };
