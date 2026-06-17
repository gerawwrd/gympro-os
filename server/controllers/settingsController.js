import GymSettings from '../models/GymSettings.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get gym settings
// @route   GET /api/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create({});
    }
    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update gym settings
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const {
      gymName, email, phone, currency,
      taxRate, openingHour, closingHour, address,
    } = req.body;

    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create({});
    }

    if (gymName !== undefined) settings.gymName = gymName;
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (currency !== undefined) settings.currency = currency;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (openingHour !== undefined) settings.openingHour = openingHour;
    if (closingHour !== undefined) settings.closingHour = closingHour;
    if (address !== undefined) settings.address = address;

    await settings.save();
    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update admin password
// @route   PUT /api/settings/password
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
