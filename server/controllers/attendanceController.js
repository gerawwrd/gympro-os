import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const checkIn = async (req, res) => {
  try {
    const { memberCode } = req.body;
    if (!memberCode) {
      return res.status(400).json({ message: 'Member code is required' });
    }

    const member = await User.findOne({
      role: 'member',
      $or: [
        { memberCode: memberCode.toUpperCase() },
        { email: memberCode.toLowerCase() },
      ],
    }).populate('currentPlan', 'name');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const now = new Date();
    if (!member.currentPlan || !member.planExpiresAt || member.planExpiresAt <= now) {
      return res.status(403).json({
        message: `Access denied — ${member.name}'s membership plan has expired`,
      });
    }

    const activeSession = await Attendance.findOne({
      member: member._id,
      status: 'active',
    });

    if (activeSession) {
      return res.status(409).json({
        message: `${member.name} is already checked in`,
      });
    }

    const attendance = await Attendance.create({
      member: member._id,
      memberCode: member.memberCode,
    });

    res.status(201).json({
      message: `${member.name} checked in successfully`,
      attendance,
      member: {
        name: member.name,
        memberCode: member.memberCode,
        currentPlan: member.currentPlan?.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { memberCode } = req.body;
    if (!memberCode) {
      return res.status(400).json({ message: 'Member code is required' });
    }

    const member = await User.findOne({
      role: 'member',
      $or: [
        { memberCode: memberCode.toUpperCase() },
        { email: memberCode.toLowerCase() },
      ],
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const activeSession = await Attendance.findOne({
      member: member._id,
      status: 'active',
    });

    if (!activeSession) {
      return res.status(409).json({
        message: `${member.name} is not currently checked in`,
      });
    }

    const checkOutTime = new Date();
    const duration = Math.round(
      (checkOutTime - activeSession.checkInTime) / (1000 * 60)
    );

    activeSession.checkOutTime = checkOutTime;
    activeSession.duration = duration;
    activeSession.status = 'completed';
    await activeSession.save();

    res.status(200).json({
      message: `${member.name} checked out successfully`,
      attendance: activeSession,
      duration,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAttendanceLogs = async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let query = {};
    if (search) {
      query.memberCode = { $regex: search, $options: 'i' };
    }

    const logs = await Attendance.find(query)
      .populate('member', 'name memberCode profileImage')
      .sort({ checkInTime: -1 })
      .limit(Number(limit));

    res.status(200).json({ count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const manualCheckOut = async (req, res) => {
  try {
    const session = await Attendance.findById(req.params.id);
    if (!session || session.status !== 'active') {
      return res.status(404).json({ message: 'Active session not found' });
    }

    const checkOutTime = new Date();
    const duration = Math.round(
      (checkOutTime - session.checkInTime) / (1000 * 60)
    );

    session.checkOutTime = checkOutTime;
    session.duration = duration;
    session.status = 'completed';
    await session.save();

    res.status(200).json({ message: 'Manual checkout successful', attendance: session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Attendance.find({ status: 'active' })
      .populate('member', 'name memberCode profileImage');
    res.status(200).json({ count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
