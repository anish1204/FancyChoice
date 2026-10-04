const mongoose = require('mongoose');
const crypto = require('crypto');

const deliverySchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledDate: { type: Date, required: true, index: true },
    slot: { type: String, enum: ['morning', 'evening'], required: true },
    rotisCount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['scheduled', 'preparing', 'out_for_delivery', 'delivered', 'skipped', 'missed', 'failed'],
      default: 'scheduled',
      index: true,
    },
    qrCode: {
      token: { type: String },
      expiresAt: { type: Date },
      scannedAt: { type: Date },
      isVerified: { type: Boolean, default: false },
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    proofImages: [{ type: String }],
    rating: {
      score: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 500 },
      ratedAt: { type: Date },
    },
    deliveredAt: { type: Date },
    failureReason: { type: String, trim: true },
  },
  { timestamps: true }
);

deliverySchema.index({ user: 1, scheduledDate: -1 });
deliverySchema.index({ subscription: 1, scheduledDate: 1, slot: 1 }, { unique: true });

deliverySchema.methods.generateQRCode = function () {
  const token = crypto.randomBytes(24).toString('hex');
  this.qrCode = {
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isVerified: false,
  };
  return this.save().then(() => token);
};

deliverySchema.methods.markDelivered = function ({ proofImages = [], lat, lng } = {}) {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  if (proofImages.length) this.proofImages = proofImages;
  if (lat) this.location = { ...(this.location || {}), lat, lng };
  return this.save();
};

deliverySchema.methods.verifyQRCode = function (token) {
  if (!this.qrCode || !this.qrCode.token) throw new Error('No QR code for this delivery');
  if (this.qrCode.token !== token) throw new Error('Invalid QR code');
  if (this.qrCode.expiresAt && this.qrCode.expiresAt < new Date()) throw new Error('QR code expired');
  this.qrCode.isVerified = true;
  this.qrCode.scannedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Delivery', deliverySchema);
