const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  designNumber: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  image: { type: String, default: null },
  fabricType: { type: String, required: true, trim: true },
  fabricDetails: { type: String, trim: true },
  colors: [{ type: String, trim: true }],
  pricePerPiece: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 0, min: 0, max: 100 },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  totalStock: { type: Number, default: 0 },
  category: { type: String, trim: true, default: 'General' }
}, { timestamps: true });

// Auto-generate design number
designSchema.pre('save', async function(next) {
  if (!this.designNumber) {
    const lastDesign = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNum = 1;
    if (lastDesign && lastDesign.designNumber) {
      const match = lastDesign.designNumber.match(/DESIGN-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    this.designNumber = `DESIGN-${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

designSchema.index({ designNumber: 1 }, { unique: true });
designSchema.index({ fabricType: 1 });
designSchema.index({ isActive: 1 });

module.exports = mongoose.model('Design', designSchema);
