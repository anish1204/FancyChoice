require('dotenv').config();
const connectDB = require('../config/database');
const Plan = require('../models/Plan');
const User = require('../models/User');

const plans = [
  {
    name: '2 Rotis / Day',
    slug: '2-rotis',
    rotisPerDay: 2,
    description: 'Perfect for individuals - fresh rotis daily',
    prices: { monthly: 999, quarterly: 2699, yearly: 9999 },
    features: ['2 fresh rotis daily', 'Morning/evening slots', 'Pause anytime'],
    sortOrder: 1,
  },
  {
    name: '5 Rotis / Day',
    slug: '5-rotis',
    rotisPerDay: 5,
    description: 'Ideal for small families',
    prices: { monthly: 1999, quarterly: 5399, yearly: 19999 },
    features: ['5 fresh rotis daily', 'Morning/evening slots', 'Pause anytime', 'Priority delivery'],
    sortOrder: 2,
  },
  {
    name: '10 Rotis / Day',
    slug: '10-rotis',
    rotisPerDay: 10,
    description: 'Best for large families',
    prices: { monthly: 3499, quarterly: 9449, yearly: 34999 },
    features: ['10 fresh rotis daily', 'Both slots available', 'Pause anytime', 'Priority delivery', 'Dedicated support'],
    sortOrder: 3,
  },
];

const run = async () => {
  await connectDB();
  await Plan.deleteMany({});
  await Plan.insertMany(plans);
  console.log('Plans seeded');

  const adminPhone = '9999999999';
  const exists = await User.findOne({ phone: adminPhone });
  if (!exists) {
    await User.create({ name: 'Admin', phone: adminPhone, password: 'admin123', role: 'admin', isVerified: true });
    console.log('Admin created: 9999999999 / admin123');
  }

  const boyPhone = '8888888888';
  const boyExists = await User.findOne({ phone: boyPhone });
  if (!boyExists) {
    await User.create({ name: 'Ravi Rider', phone: boyPhone, password: 'delivery123', role: 'deliveryBoy', isVerified: true });
    console.log('Delivery boy created: 8888888888 / delivery123');
  }
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
