const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessName: { type: String, required: true, default: 'Textile Business' },
  logo: { type: String, default: null },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
  },
  contact: {
    phone: { type: String },
    mobile: { type: String },
    email: { type: String },
    website: { type: String }
  },
  gst: {
    number: { type: String },
    enabled: { type: Boolean, default: false },
    defaultRate: { type: Number, default: 18 }
  },
  invoice: {
    prefix: { type: String, default: 'BILL' },
    termsAndConditions: { type: String, default: 'Thank you for your business!' },
    footer: { type: String, default: 'This is a computer-generated invoice.' },
    showLogo: { type: Boolean, default: true },
    showGst: { type: Boolean, default: true }
  },
  payment: {
    defaultTermsDays: { type: Number, default: 30 },
    reminderDaysBefore: { type: Number, default: 5 }
  },
  notifications: {
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
