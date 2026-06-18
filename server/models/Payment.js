import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberCode: { type: String },
    memberName: { type: String },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    planName: { type: String },
    planPrice: { type: Number },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Bank Transfer', 'PayPal'],
      default: 'Cash',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
