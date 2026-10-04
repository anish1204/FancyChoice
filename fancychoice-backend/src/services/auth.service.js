const crypto = require('crypto');
const Otp = require('../models/Otp');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../middleware/auth');

const OTP_EXPIRE_MIN = parseInt(process.env.OTP_EXPIRE_MINUTES || '5', 10);
const OTP_BYPASS = process.env.OTP_BYPASS === 'true';

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

async function sendSmsMock(phone, otp) {
  // Real implementation: Twilio. Dev: log to console.
  if (process.env.TWILIO_ACCOUNT_SID) {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({
      body: `Your FancyChoice OTP is ${otp}. Valid for ${OTP_EXPIRE_MIN} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`,
    });
  } else {
    console.log(`[OTP-MOCK] Send OTP ${otp} to +91${phone}`);
  }
}

async function sendOtp(phone, purpose = 'login') {
  // Invalidate previous unverified OTPs
  await Otp.deleteMany({ phone, verified: false });

  const otp = generateOtpCode();
  const otpHash = Otp.hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MIN * 60 * 1000);

  await Otp.create({ phone, otpHash, expiresAt, purpose });
  await sendSmsMock(phone, otp);

  // Return OTP in dev-bypass mode so mobile can auto-fill / tests pass
  return { message: 'OTP sent', expiresInMinutes: OTP_EXPIRE_MIN, ...(OTP_BYPASS ? { devOtp: otp } : {}) };
}

async function verifyOtp(phone, otp) {
  if (OTP_BYPASS && process.env.NODE_ENV !== 'production') {
    // Still try to mark latest OTP verified, but accept any code
    await Otp.findOneAndUpdate({ phone }, { verified: true }, { sort: { createdAt: -1 } });
  } else {
    const record = await Otp.findOne({ phone, verified: false }).sort({ createdAt: -1 });
    if (!record) throw ApiError.badRequest('No OTP found. Please request a new one.');
    if (record.expiresAt < new Date()) throw ApiError.badRequest('OTP expired. Please request a new one.');
    if (record.attempts >= 5) throw ApiError.badRequest('Too many attempts. Request a new OTP.');

    const hash = Otp.hashOtp(otp);
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(record.otpHash))) {
      record.attempts += 1;
      await record.save();
      throw ApiError.badRequest('Invalid OTP');
    }
    record.verified = true;
    await record.save();
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: `User ${phone.slice(-4)}`, phone, isVerified: true });
  } else if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id);
  return { user: user.toSafeJSON(), token };
}

async function signup({ name, phone, email, password, address }) {
  const existing = await User.findOne({ $or: [{ phone }, ...(email ? [{ email }] : [])] });
  if (existing) throw ApiError.conflict('Phone or email already registered');

  const user = new User({ name, phone, email, password, isVerified: false });
  if (address) user.addresses.push({ ...address, isDefault: true });
  await user.save();

  const token = generateToken(user._id);
  return { user: user.toSafeJSON(), token };
}

async function login({ identifier, password }) {
  const user = await User.findOne({
    $or: [{ phone: identifier }, { email: (identifier || '').toLowerCase() }],
  }).select('+password');

  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.isActive) throw ApiError.forbidden('Account deactivated');
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id);
  return { user: user.toSafeJSON(), token };
}

module.exports = { sendOtp, verifyOtp, signup, login };
