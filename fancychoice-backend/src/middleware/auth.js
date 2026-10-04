const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) token = header.split(' ')[1];

  if (!token) throw ApiError.unauthorized('Not authorized, no token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw ApiError.unauthorized('User not found or deactivated');
    req.user = user;
    next();
  } catch (err) {
    throw ApiError.unauthorized('Not authorized, token invalid or expired');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Requires role: ${roles.join(', ')}`));
  }
  next();
};

module.exports = { generateToken, authenticate, authorize };
