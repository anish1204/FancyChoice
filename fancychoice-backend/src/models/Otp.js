const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    purpose: { type: String, enum: ['login', 'signup', 'reset'], default: 'login' },
  },
  { timestamps: true }
);

otpSchema.statics.hashOtp = function (otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};

module.exports = mongoose.model('Otp', otpSchema);
