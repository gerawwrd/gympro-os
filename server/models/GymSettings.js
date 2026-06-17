import mongoose from 'mongoose';

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: 'GymPro Elite Fitness' },
    email: { type: String, default: 'info@gympro.com' },
    phone: { type: String, default: '+1 (555) 902-1200' },
    currency: { type: String, default: 'PHP (P)' },
    taxRate: { type: Number, default: 5 },
    openingHour: { type: String, default: '05:00 AM' },
    closingHour: { type: String, default: '11:00 PM' },
    address: { type: String, default: '450 Strength Blvd, Metropolis' },
  },
  { timestamps: true }
);

const GymSettings = mongoose.model('GymSettings', gymSettingsSchema);
export default GymSettings;
