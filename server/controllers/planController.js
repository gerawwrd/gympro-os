import MembershipPlan from '../models/MembershipPlan.js';
import User from '../models/User.js';

// @desc    Get all active plans with computed stats
// @route   GET /api/plans
export const getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ price: 1 });

    const now = new Date();
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const activeHolders = await User.countDocuments({
          role: 'member',
          currentPlan: plan._id,
          planExpiresAt: { $gt: now },
        });

        return {
          ...plan.toObject(),
          activeHolders,
        };
      })
    );

    res.status(200).json({ count: plansWithStats.length, plans: plansWithStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
export const getPlanById = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const activeHolders = await User.countDocuments({
      role: 'member',
      currentPlan: plan._id,
      planExpiresAt: { $gt: new Date() },
    });

    res.status(200).json({ plan: { ...plan.toObject(), activeHolders } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new plan
// @route   POST /api/plans
export const createPlan = async (req, res) => {
  try {
    const { name, price, durationDays, perks } = req.body;

    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({ message: 'Name, price, and durationDays are required' });
    }

    const existing = await MembershipPlan.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'A plan with this name already exists' });
    }

    const plan = await MembershipPlan.create({ name, price, durationDays, perks: perks || [] });

    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const { name, price, durationDays, perks, isActive } = req.body;

    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (name !== undefined) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (perks !== undefined) plan.perks = perks;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    res.status(200).json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Soft-delete plan
// @route   DELETE /api/plans/:id
export const deletePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.isActive = false;
    await plan.save();

    res.status(200).json({ message: 'Plan deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
