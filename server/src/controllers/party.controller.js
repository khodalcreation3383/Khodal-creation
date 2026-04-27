const Party = require('../models/Party.model');
const Bill = require('../models/Bill.model');
const Payment = require('../models/Payment.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const getParties = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { gstNumber: { $regex: search, $options: 'i' } }
    ];
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Party.countDocuments(query);
    const parties = await Party.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, parties, {
      total, page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return errorResponse(res, 'Party not found', 404);

    // Get payment summary
    const bills = await Bill.find({ party: req.params.id }).sort({ billDate: -1 });
    const payments = await Payment.find({ party: req.params.id }).sort({ paymentDate: -1 });

    const summary = {
      totalBills: bills.length,
      totalBilled: bills.reduce((s, b) => s + b.grandTotal, 0),
      totalPaid: bills.reduce((s, b) => s + b.paidAmount, 0),
      totalPending: bills.reduce((s, b) => s + b.pendingAmount, 0),
      pendingBills: bills.filter(b => b.status === 'pending').length,
      partialBills: bills.filter(b => b.status === 'partial').length,
      paidBills: bills.filter(b => b.status === 'paid').length,
      overdueBills: bills.filter(b => b.status === 'overdue').length,
    };

    return successResponse(res, { party, bills, payments, summary });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createParty = async (req, res) => {
  try {
    const party = await Party.create(req.body);
    return successResponse(res, party, 'Party created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!party) return errorResponse(res, 'Party not found', 404);
    return successResponse(res, party, 'Party updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return errorResponse(res, 'Party not found', 404);
    party.isActive = false;
    await party.save();
    return successResponse(res, null, 'Party deactivated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getPartyLedger = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { party: req.params.id };
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    const bills = await Bill.find(query).sort({ billDate: -1 });
    const payments = await Payment.find({ party: req.params.id }).sort({ paymentDate: -1 });
    return successResponse(res, { bills, payments });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getParties, getParty, createParty, updateParty, deleteParty, getPartyLedger };
