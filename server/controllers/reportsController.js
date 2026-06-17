import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';

// @desc    Get all reports data
// @route   GET /api/reports
export const getReports = async (req, res) => {
  try {
    const now = new Date();

    // --- ATTENDANCE STATS ---
    const totalVisits = await Attendance.countDocuments();
    const activeSessions = await Attendance.countDocuments({ status: 'active' });

    const completedSessions = await Attendance.find({ status: 'completed' });
    const avgDuration = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length)
      : 0;

    // Peak workout hours (group by hour)
    const allSessions = await Attendance.find({});
    const hourCounts = {};
    for (let h = 6; h <= 22; h++) {
      hourCounts[h] = 0;
    }
    allSessions.forEach((s) => {
      const hour = new Date(s.checkInTime).getHours();
      if (hourCounts[hour] !== undefined) {
        hourCounts[hour]++;
      }
    });
    const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count,
    }));

    // Access times checklist (last 20 sessions)
    const recentSessions = await Attendance.find({ status: 'completed' })
      .populate('member', 'name memberCode')
      .sort({ checkInTime: -1 })
      .limit(20);

    // --- REVENUE STATS ---
    const payments = await Payment.find().sort({ paidAt: 1 });
    const totalRevenue = payments.reduce((sum, p) => sum + p.planPrice, 0);
    const totalInvoices = payments.length;
    const avgInvoice = totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0;

    // Revenue by month
    const revenueByMonth = {};
    payments.forEach((p) => {
      const key = new Date(p.paidAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      revenueByMonth[key] = (revenueByMonth[key] || 0) + p.planPrice;
    });
    const revenueTrends = Object.entries(revenueByMonth).map(([month, total]) => ({
      month,
      total,
    }));

    // --- MEMBERSHIP STATS ---
    const allMembers = await User.find({ role: 'member' });
    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter(
      (m) => m.currentPlan && m.planExpiresAt && m.planExpiresAt > now
    ).length;
    const expiredMembers = totalMembers - activeMembers;

    const maleCount = allMembers.filter((m) => m.gender === 'male').length;
    const femaleCount = allMembers.filter((m) => m.gender === 'female').length;
    const otherCount = allMembers.filter((m) => m.gender === 'other' || !m.gender).length;

    const genderMix = {
      male: { count: maleCount, percent: totalMembers > 0 ? Math.round((maleCount / totalMembers) * 100) : 0 },
      female: { count: femaleCount, percent: totalMembers > 0 ? Math.round((femaleCount / totalMembers) * 100) : 0 },
      other: { count: otherCount, percent: totalMembers > 0 ? Math.round((otherCount / totalMembers) * 100) : 0 },
    };

    const membersChecklist = await User.find({ role: 'member' })
      .populate('currentPlan', 'name')
      .select('name memberCode email currentPlan planExpiresAt gender')
      .sort({ createdAt: -1 });

    res.status(200).json({
      attendance: {
        totalVisits,
        activeSessions,
        avgDuration,
        peakHours,
        recentSessions,
      },
      revenue: {
        totalRevenue,
        totalInvoices,
        avgInvoice,
        revenueTrends,
        payments,
      },
      membership: {
        totalMembers,
        activeMembers,
        expiredMembers,
        genderMix,
        membersChecklist,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
