const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  alternativeMobile: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  mapLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    mapUrl: { type: String }
  },
  gstNumber: { type: String, trim: true, uppercase: true },
  referredBy: { type: String, trim: true },
  paymentTermsDays: { type: Number, default: 30, min: 0 },
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },
  commissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  isActive: { type: Boolean, default: true },
  notes: { type: String, trim: true },
  // Computed fields (updated on bill creation)
  totalBilled: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 }
}, { timestamps: true });

partySchema.index({ name: 1 });
partySchema.index({ mobile: 1 });
partySchema.index({ gstNumber: 1 });

module.exports = mongoose.model('Party', partySchema);
