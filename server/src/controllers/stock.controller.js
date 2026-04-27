const StockEntry = require('../models/Stock.model');
const Design = require('../models/Design.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const getStockEntries = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, design, startDate, endDate, search } = req.query;
    const query = {};
    if (type) query.type = type;
    if (design) query.design = design;
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate);
      if (endDate) query.entryDate.$lte = new Date(endDate);
    }

    const total = await StockEntry.countDocuments(query);
    const entries = await StockEntry.find(query)
      .populate('design', 'designNumber name fabricType image')
      .populate('party', 'name')
      .sort({ entryDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, entries, {
      total, page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getStockSummary = async (req, res) => {
  try {
    const designs = await Design.find({ isActive: true });
    const summary = [];

    for (const design of designs) {
      const inward = await StockEntry.aggregate([
        { $match: { design: design._id, type: 'inward' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const outward = await StockEntry.aggregate([
        { $match: { design: design._id, type: 'outward' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      const totalInward = inward[0]?.total || 0;
      const totalOutward = outward[0]?.total || 0;
      const available = totalInward - totalOutward;

      summary.push({
        design: {
          _id: design._id,
          designNumber: design.designNumber,
          name: design.name,
          fabricType: design.fabricType,
          image: design.image,
          pricePerPiece: design.pricePerPiece
        },
        totalInward,
        totalOutward,
        available,
        stockValue: available * design.pricePerPiece
      });
    }

    const totalStockValue = summary.reduce((s, i) => s + i.stockValue, 0);
    const totalAvailable = summary.reduce((s, i) => s + i.available, 0);

    return successResponse(res, { summary, totalStockValue, totalAvailable });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const addStockEntry = async (req, res) => {
  try {
    const { designId, type, quantity, color, fabricType, notes, referenceType, party } = req.body;

    const design = await Design.findById(designId);
    if (!design) return errorResponse(res, 'Design not found', 404);

    // Check if outward doesn't exceed available stock
    if (type === 'outward') {
      const inward = await StockEntry.aggregate([
        { $match: { design: design._id, type: 'inward' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const outward = await StockEntry.aggregate([
        { $match: { design: design._id, type: 'outward' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      const available = (inward[0]?.total || 0) - (outward[0]?.total || 0);
      if (quantity > available) {
        return errorResponse(res, `Insufficient stock. Available: ${available}`, 400);
      }
    }

    const entry = await StockEntry.create({
      design: designId,
      type,
      quantity: parseInt(quantity),
      color,
      fabricType: fabricType || design.fabricType,
      notes,
      referenceType: referenceType || (type === 'inward' ? 'purchase' : 'sale'),
      party,
      createdBy: req.user._id
    });

    // Update design total stock
    const allInward = await StockEntry.aggregate([
      { $match: { design: design._id, type: 'inward' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const allOutward = await StockEntry.aggregate([
      { $match: { design: design._id, type: 'outward' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    design.totalStock = (allInward[0]?.total || 0) - (allOutward[0]?.total || 0);
    await design.save();

    const populated = await StockEntry.findById(entry._id)
      .populate('design', 'designNumber name fabricType image')
      .populate('party', 'name');

    return successResponse(res, populated, 'Stock entry added successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteStockEntry = async (req, res) => {
  try {
    const entry = await StockEntry.findById(req.params.id);
    if (!entry) return errorResponse(res, 'Entry not found', 404);
    await entry.deleteOne();
    return successResponse(res, null, 'Stock entry deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getStockEntries, getStockSummary, addStockEntry, deleteStockEntry };
