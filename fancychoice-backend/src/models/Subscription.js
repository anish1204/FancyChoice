const mongoose = require('mongoose');

const pauseRecordSchema = new mongoose.Schema(
  {
    pausedAt: { type: Date, default: Date.now },
    resumedAt: { type: Date },
    reason: { type: String, trim: true },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    rotisPerDay: { type: Number, required: true, min: 1 },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    pricePaid: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deliverySlots: { type: [String], enum: ['morning', 'evening'], default: ['morning'] },
    deliveryAddress: {
      label: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
      instructions: String,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'active', 'paused', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    autoRenew: { type: Boolean, default: true },
    pauseHistory: [pauseRecordSchema],
    totalDeliveries: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

subscriptionSchema.virtual('remainingDeliveries').get(function () {
  return Math.max(0, (this.totalDeliveries || 0) - (this.deliveredCount || 0));
});

subscriptionSchema.methods.pause = function (reason) {
  if (this.status !== 'active') throw new Error('Only active subscriptions can be paused');
  this.status = 'paused';
  this.pauseHistory.push({ pausedAt: new Date(), reason });
  return this.save();
};

subscriptionSchema.methods.resume = function () {
  if (this.status !== 'paused') throw new Error('Only paused subscriptions can be resumed');
  this.status = 'active';
  const last = this.pauseHistory[this.pauseHistory.length - 1];
  if (last && !last.resumedAt) last.resumedAt = new Date();
  return this.save();
};

subscriptionSchema.methods.cancel = function () {
  if (['cancelled', 'expired'].includes(this.status)) throw new Error('Subscription already closed');
  this.status = 'cancelled';
  this.autoRenew = false;
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
