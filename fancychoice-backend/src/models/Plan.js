const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "2 Rotis / Day"
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. "2-rotis"
    rotisPerDay: { type: Number, required: true, min: 1 },
    description: { type: String, trim: true },
    prices: {
      monthly: { type: Number, required: true, min: 0 },
      quarterly: { type: Number, required: true, min: 0 },
      yearly: { type: Number, required: true, min: 0 },
    },
    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

planSchema.methods.priceFor = function (cycle) {
  if (cycle === 'quarterly') return this.prices.quarterly;
  if (cycle === 'yearly') return this.prices.yearly;
  return this.prices.monthly;
};

module.exports = mongoose.model('Plan', planSchema);
