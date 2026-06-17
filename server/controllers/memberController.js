import User from '../models/User.js';
import MembershipPlan from '../models/MembershipPlan.js';
import { getNextMemberCode } from '../utils/generateMemberCode.js';

// @desc    Get all members (with search & status filter)
// @route   GET /api/members?search=&status=
export const getMembers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = { role: 'member' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberCode: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    let members = await User.find(filter)
      .populate('currentPlan', 'name price durationDays')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    const now = new Date();
    members = members.map((m) => {
      const computedStatus =
        m.currentPlan && m.planExpiresAt && m.planExpiresAt > now ? 'active' : 'expired';
      return { ...m.toObject(), status: computedStatus };
    });

    if (status) {
      members = members.filter((m) => m.status === status.toLowerCase());
    }

    res.status(200).json({ count: members.length, members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
export const getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' })
      .populate('currentPlan', 'name price durationDays')
      .select('-password -refreshToken');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ member });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register new member
// @route   POST /api/members
export const createMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      profileImage,
      planId,
      password,
      address,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Validate plan BEFORE generating the member code
    let currentPlan = null;
    let planExpiresAt = null;

    if (planId) {
      const plan = await MembershipPlan.findById(planId);
      if (!plan) {
        return res.status(400).json({ message: 'Invalid membership plan selected' });
      }
      currentPlan = plan._id;
      planExpiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
    }

    // Only generate the code once we know the request is valid
    const memberCode = await getNextMemberCode();

    const member = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: password || 'gympro123',
      role: 'member',
      memberCode,
      phone,
      dateOfBirth,
      gender,
      address,
      profileImage,
      currentPlan,
      planExpiresAt,
    });

    const populatedMember = await User.findById(member._id)
      .populate('currentPlan', 'name price durationDays')
      .select('-password -refreshToken');

    res.status(201).json({ message: 'Member registered successfully', member: populatedMember });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update member profile
// @route   PUT /api/members/:id
export const updateMember = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, gender, address, profileImage, password } = req.body;

    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (firstName || lastName) {
      const newFirst = firstName || member.name.split(' ')[0];
      const newLast = lastName || member.name.split(' ').slice(1).join(' ');
      member.name = `${newFirst} ${newLast}`.trim();
    }
    if (email) member.email = email;
    if (phone) member.phone = phone;
    if (gender) member.gender = gender;
    if (address) member.address = address;
    if (profileImage) member.profileImage = profileImage;
    if (password) member.password = password;

    await member.save();

    const updatedMember = await User.findById(member._id)
      .populate('currentPlan', 'name price durationDays')
      .select('-password -refreshToken');

    res.status(200).json({ message: 'Member updated successfully', member: updatedMember });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
export const deleteMember = async (req, res) => {
  try {
    const member = await User.findOneAndDelete({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};