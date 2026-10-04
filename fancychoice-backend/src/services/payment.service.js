const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

async function createIntent(user, { subscriptionId, amount, currency = 'INR', billingCycle }) {
  const stripe = stripeClient();
  let sub = null;
  if (subscriptionId) {
    sub = await Subscription.findById(subscriptionId);
    if (!sub) throw ApiError.notFound('Subscription not found');
  }
  const finalAmount = amount || sub?.pricePaid;
  if (!finalAmount) throw ApiError.badRequest('Amount is required');

  const payment = await Payment.create({
    user: user._id,
    subscription: sub?._id,
    amount: finalAmount,
    currency,
    billingCycle: billingCycle || sub?.billingCycle,
    provider: stripe ? 'stripe' : 'mock',
    status: 'pending',
  });

  if (!stripe) {
    // Mock mode for dev: return client secret placeholder
    return { payment, clientSecret: `mock_secret_${payment._id}`, mock: true };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(finalAmount * 100), // paise
    currency: currency.toLowerCase(),
    metadata: { paymentId: payment._id.toString(), userId: user._id.toString() },
  });
  payment.stripePaymentIntentId = intent.id;
  await payment.save();
  return { payment, clientSecret: intent.client_secret, mock: false };
}

async function confirmPayment(paymentId, { success = true, receiptUrl } = {}) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  payment.status = success ? 'succeeded' : 'failed';
  if (success) {
    payment.paidAt = new Date();
    if (receiptUrl) payment.receiptUrl = receiptUrl;
    if (payment.subscription) {
      await Subscription.findByIdAndUpdate(payment.subscription, { payment: payment._id, status: 'active' });
    }
  }
  await payment.save();
  return payment;
}

async function listMyPayments(userId, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    Payment.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments({ user: userId }),
  ]);
  return { docs, total, page: Number(page), limit: Number(limit) };
}

async function refund(paymentId) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'succeeded') throw ApiError.badRequest('Only succeeded payments can be refunded');
  const stripe = stripeClient();
  if (stripe && payment.stripePaymentIntentId) {
    await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
  }
  payment.status = 'refunded';
  await payment.save();
  return payment;
}

module.exports = { createIntent, confirmPayment, listMyPayments, refund };
