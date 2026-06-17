import Payment from '../models/Payment.js';
import User from '../models/User.js';
import MembershipPlan from '../models/MembershipPlan.js';
import Counter from '../models/Counter.js';

const generateReferenceId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'paymentRef' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TXN${counter.seq}`;
};

// @desc    Get all payments
// @route   GET /api/payments
export const getPayments = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { referenceId: { $regex: search, $options: 'i' } },
        { memberCode: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(query)
      .sort({ paidAt: -1 })
      .populate('member', 'name memberCode email')
      .populate('plan', 'name price');

    res.status(200).json({ count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single payment (for receipt)
// @route   GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'name memberCode email')
      .populate('plan', 'name price durationDays');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Record a new payment (also renews member plan)
// @route   POST /api/payments
export const recordPayment = async (req, res) => {
  try {
    const { memberId, planId, paymentMethod } = req.body;

    if (!memberId || !planId || !paymentMethod) {
      return res.status(400).json({ message: 'Member, plan, and payment method are required' });
    }

    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const referenceId = await generateReferenceId();

    const payment = await Payment.create({
      referenceId,
      member: member._id,
      memberCode: member.memberCode,
      memberName: member.name,
      plan: plan._id,
      planName: plan.name,
      planPrice: plan.price,
      paymentMethod,
    });

    // Renew member's plan
    member.currentPlan = plan._id;
    member.planExpiresAt = new Date(
      Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
    );
    await member.save();

    res.status(201).json({
      message: 'Payment recorded and plan renewed successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
