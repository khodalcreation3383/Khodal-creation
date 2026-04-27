const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'other'],
    required: true
  },
  // Bank transfer fields
  transactionId: { type: String, trim: true },
  bankName: { type: String, trim: true },
  // Cheque fields
  chequeNumber: { type: String, trim: true },
  chequeDate: { type: Date },
  chequeBank: { type: String, trim: true },
  chequeStatus: { type: String, enum: ['pending', 'cleared', 'bounced'], default: 'pending' },
  // UPI
  upiId: { type: String, trim: true },
  upiRef: { type: String, trim: true },
  notes: { type: String, trim: true },
  isAdvance: { type: Boolean, default: false },
  advancePercentage: { type: Number, min: 0, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

paymentSchema.index({ bill: 1 });
paymentSchema.index({ party: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ method: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
