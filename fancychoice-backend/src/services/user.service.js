const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeJSON();
}

async function updateProfile(userId, { name, email, deliveryPreferences, avatar }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (avatar) user.avatar = avatar;
  if (deliveryPreferences) user.deliveryPreferences = { ...user.deliveryPreferences, ...deliveryPreferences };
  await user.save();
  return user.toSafeJSON();
}

async function addAddress(userId, address) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (address.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
  if (user.addresses.length === 0) address.isDefault = true;
  user.addresses.push(address);
  await user.save();
  return user.toSafeJSON();
}

async function updateAddress(userId, addressId, patch) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const addr = user.addresses.id(addressId);
  if (!addr) throw ApiError.notFound('Address not found');
  Object.assign(addr, patch);
  if (patch.isDefault) user.addresses.forEach((a) => { if (a._id.toString() !== addressId) a.isDefault = false; });
  await user.save();
  return user.toSafeJSON();
}

async function deleteAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const addr = user.addresses.id(addressId);
  if (!addr) throw ApiError.notFound('Address not found');
  addr.deleteOne();
  await user.save();
  return user.toSafeJSON();
}

async function deactivateAccount(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = false;
  await user.save();
  return { message: 'Account deactivated' };
}

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, deactivateAccount };
