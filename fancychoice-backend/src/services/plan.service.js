const Plan = require('../models/Plan');
const ApiError = require('../utils/ApiError');

async function listPlans({ onlyActive = true } = {}) {
  const filter = onlyActive ? { isActive: true } : {};
  return Plan.find(filter).sort({ sortOrder: 1, rotisPerDay: 1 });
}

async function getPlan(idOrSlug) {
  const plan = await Plan.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }).catch(() =>
    Plan.findOne({ slug: idOrSlug })
  );
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
}

async function createPlan(data) {
  const exists = await Plan.findOne({ slug: data.slug.toLowerCase() });
  if (exists) throw ApiError.conflict('Plan slug already exists');
  return Plan.create(data);
}

async function updatePlan(id, patch) {
  const plan = await Plan.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
}

async function deletePlan(id) {
  const plan = await Plan.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan };
