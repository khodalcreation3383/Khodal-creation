const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
  designNumber: { type: String },
  designName: { type: String },
  designImage: { type: String },
  fabricType: { type: String },
  color: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  pricePerPiece: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true },
  gstRate: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 }
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  items: [billItemSchema],
  subtotal: { type: Number, required: true },
  gstEnabled: { type: Boolean, default: false },
  totalGst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  // Commission (admin only, never in PDF)
  commissionRate: { type: Number, default: 0 },
  commissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  commissionAmount: { type: Number, default: 0 },
  commissionNote: { type: String },
  notes: { type: String },
  termsAndConditions: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate bill number
billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const lastBill = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNum = 1;
    if (lastBill && lastBill.billNumber) {
      const match = lastBill.billNumber.match(/BILL-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const year = new Date().getFullYear();
    this.billNumber = `BILL-${year}-${String(nextNum).padStart(4, '0')}`;
  }
  
  // Calculate pending amount
  this.pendingAmount = this.grandTotal - this.paidAmount;
  
  // Update status
  if (this.paidAmount <= 0) this.status = 'pending';
  else if (this.paidAmount >= this.grandTotal) this.status = 'paid';
  else this.status = 'partial';
  
  // Check overdue
  if (this.dueDate && new Date() > this.dueDate && this.status !== 'paid') {
    this.status = 'overdue';
  }
  
  next();
});

billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ party: 1 });
billSchema.index({ status: 1 });
billSchema.index({ billDate: -1 });
billSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);
