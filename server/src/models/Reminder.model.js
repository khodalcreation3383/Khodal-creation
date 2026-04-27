const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
  type: { type: String, enum: ['payment_due', 'overdue', 'custom'], default: 'payment_due' },
  message: { type: String, required: true },
  dueDate: { type: Date },
  amount: { type: Number },
  isRead: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false }
}, { timestamps: true });

reminderSchema.index({ isRead: 1 });
reminderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reminder', reminderSchema);
