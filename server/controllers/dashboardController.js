import User from '../models/User.js';
import MembershipPlan from '../models/MembershipPlan.js';

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const allMembers = await User.find({ role: 'member' });
    const totalMembers = allMembers.length;

    const activeCycles = allMembers.filter(
      (m) => m.currentPlan && m.planExpiresAt && m.planExpiresAt > now
    ).length;

    const expiredPlans = allMembers.filter(
      (m) => !m.currentPlan || !m.planExpiresAt || m.planExpiresAt <= now
    ).length;

    const todayCheckIns = 0;
    const currentlyWorkingOut = 0;

    const plans = await MembershipPlan.find({ isActive: true });
    const revenuePlanMix = await Promise.all(
      plans.map(async (plan) => {
        const holders = await User.countDocuments({
          role: 'member',
          currentPlan: plan._id,
          planExpiresAt: { $gt: now },
        });
        return {
          name: plan.name,
          price: plan.price,
          holders,
          revenue: holders * plan.price,
        };
      })
    );

    const grossIncome = revenuePlanMix.reduce((sum, p) => sum + p.revenue, 0);

    const weeklyAttendance = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];

    res.status(200).json({
      totalMembers,
      activeCycles,
      expiredPlans,
      grossIncome,
      todayCheckIns,
      currentlyWorkingOut,
      revenuePlanMix,
      weeklyAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
