const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Delivery = require('../models/Delivery');
const ApiError = require('../utils/ApiError');

const CYCLE_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function generateDeliveries(subscription) {
  const days = CYCLE_DAYS[subscription.billingCycle] || 30;
  const ops = [];
  for (let i = 0; i < days; i++) {
    const date = startOfDay(new Date(subscription.startDate.getTime() + i * 86400000));
    for (const slot of subscription.deliverySlots) {
      ops.push({
        subscription: subscription._id,
        user: subscription.user,
        scheduledDate: date,
        slot,
        rotisCount: subscription.rotisPerDay,
        status: 'scheduled',
      });
    }
  }
  // inserts ignore duplicates (unique index on sub+date+slot)
  try {
    await Delivery.insertMany(ops, { ordered: false });
  } catch (e) {
    if (![11000].includes(e.code)) throw e;
  }
  return ops.length;
}

async function createSubscription(userId, { planId, billingCycle = 'monthly', deliverySlots = ['morning'], deliveryAddress, autoRenew = true }) {
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) throw ApiError.badRequest('Invalid or inactive plan');

  const active = await Subscription.findOne({ user: userId, status: { $in: ['active', 'paused'] } });
  if (active) throw ApiError.conflict('You already have an active subscription. Pause/cancel it first.');

  const days = CYCLE_DAYS[billingCycle] || 30;
  const startDate = startOfDay(new Date());
  const endDate = new Date(startDate.getTime() + days * 86400000);

  const sub = await Subscription.create({
    user: userId,
    plan: plan._id,
    rotisPerDay: plan.rotisPerDay,
    billingCycle,
    pricePaid: plan.priceFor(billingCycle),
    startDate,
    endDate,
    deliverySlots,
    deliveryAddress,
    autoRenew,
    status: 'active',
    totalDeliveries: days * deliverySlots.length,
    deliveredCount: 0,
  });

  await generateDeliveries(sub);
  return sub.populate('plan');
}

async function getMySubscriptions(userId, { status, page = 1, limit = 10 }) {
  const filter = { user: userId };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    Subscription.find(filter).populate('plan').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscription.countDocuments(filter),
  ]);
  return { docs, total, page: Number(page), limit: Number(limit) };
}

async function getActiveSubscription(userId) {
  return Subscription.findOne({ user: userId, status: { $in: ['active', 'paused'] } }).populate('plan');
}

async function getSubscriptionById(user, id) {
  const sub = await Subscription.findById(id).populate('plan');
  if (!sub) throw ApiError.notFound('Subscription not found');
  if (user.role === 'customer' && sub.user.toString() !== user._id.toString()) {
    throw ApiError.forbidden('Not your subscription');
  }
  return sub;
}

async function updateSubscription(user, id, patch) {
  const sub = await getSubscriptionById(user, id);
  if (!['active', 'paused'].includes(sub.status)) throw ApiError.badRequest('Only active/paused subscriptions can be updated');
  if (patch.deliverySlots) {
    sub.deliverySlots = patch.deliverySlots;
    // regenerate future deliveries for new slots (simple: delete future scheduled + recreate)
    const today = startOfDay(new Date());
    await Delivery.deleteMany({ subscription: sub._id, scheduledDate: { $gte: today }, status: 'scheduled' });
    await generateDeliveries({ ...sub.toObject(), deliverySlots: patch.deliverySlots });
  }
  if (patch.deliveryAddress) sub.deliveryAddress = patch.deliveryAddress;
  if (typeof patch.autoRenew === 'boolean') sub.autoRenew = patch.autoRenew;
  await sub.save();
  return sub;
}

async function pauseSubscription(user, id, reason) {
  const sub = await getSubscriptionById(user, id);
  await sub.pause(reason);
  return sub;
}

async function resumeSubscription(user, id) {
  const sub = await getSubscriptionById(user, id);
  await sub.resume();
  return sub;
}

async function cancelSubscription(user, id) {
  const sub = await getSubscriptionById(user, id);
  await sub.cancel();
  // remove future scheduled deliveries
  await Delivery.deleteMany({ subscription: sub._id, status: 'scheduled', scheduledDate: { $gte: startOfDay(new Date()) } });
  return sub;
}

module.exports = {
  createSubscription,
  getMySubscriptions,
  getActiveSubscription,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
};
