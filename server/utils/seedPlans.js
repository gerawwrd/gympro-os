import Counter from '../models/Counter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MembershipPlan from '../models/MembershipPlan.js';

dotenv.config();

const plans = [
  {
    name: 'Daily Pass',
    price: 50,
    durationDays: 1,
    perks: [
      'Single entry access badge',
      'Locker room use',
      'Access to cardiovascular machine tracks',
      'Gym general area access',
    ],
  },
  {
    name: 'Weekly Pass',
    price: 250,
    durationDays: 7,
    perks: [
      '7 consecutive scan passes',
      'Standard locker allocation',
      'Full machine area integration',
      'Shower room towels basic use',
    ],
  },
  {
    name: 'Monthly Pass',
    price: 500,
    durationDays: 30,
    perks: [
      '30-day scans allocation',
      'Full access anytime of day',
      'Free hydration water bottle access',
      'Group fitness trial voucher',
    ],
  },
  {
    name: 'Quarterly Pass',
    price: 1200,
    durationDays: 90,
    perks: ['90-day subscription value', 'Full access anytime of day'],
  },
  {
    name: 'Annual Pass',
    price: 5000,
    durationDays: 365,
    perks: ['365-day access index', 'Free guest ticket monthly'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await MembershipPlan.deleteMany({});
    console.log('Cleared existing plans');

    await MembershipPlan.insertMany(plans);
    console.log('Seeded membership plans');

    await Counter.findByIdAndUpdate(
      { _id: 'memberCode' },
      { $set: { seq: 1000 } },
      { upsert: true }
    );
    console.log('Initialized memberCode counter at 1000');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seed();