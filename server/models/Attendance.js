import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberCode: {
      type: String,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
