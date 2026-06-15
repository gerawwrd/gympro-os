import Counter from '../models/Counter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MembershipPlan from '../models/MembershipPlan.js';

dotenv.config();

const plans = [
  { name: 'Daily Pass', price: 50, durationDays: 1 },
  { name: 'Weekly Pass', price: 250, durationDays: 7 },
  { name: 'Monthly Pass', price: 500, durationDays: 30 },
  { name: 'Quarterly Pass', price: 1200, durationDays: 90 },
  { name: 'Annual Pass', price: 5000, durationDays: 365 },
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