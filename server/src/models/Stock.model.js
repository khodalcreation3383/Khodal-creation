const mongoose = require('mongoose');

const stockEntrySchema = new mongoose.Schema({
  design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
  type: { type: String, enum: ['inward', 'outward'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  fabricType: { type: String, trim: true },
  color: { type: String, trim: true },
  notes: { type: String, trim: true },
  referenceType: { type: String, enum: ['purchase', 'sale', 'return', 'adjustment', 'opening'], default: 'purchase' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: { type: String, enum: ['Bill', 'Purchase'] },
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
  entryDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

stockEntrySchema.index({ design: 1, type: 1 });
stockEntrySchema.index({ entryDate: -1 });

module.exports = mongoose.model('StockEntry', stockEntrySchema);
