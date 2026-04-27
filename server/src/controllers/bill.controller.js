const Bill = require('../models/Bill.model');
const Party = require('../models/Party.model');
const Design = require('../models/Design.model');
const StockEntry = require('../models/Stock.model');
const Payment = require('../models/Payment.model');
const Settings = require('../models/Settings.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateBillPDF } = require('../utils/pdfGenerator');

const getBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, party, startDate, endDate, search, sortBy = 'billDate', sortOrder = 'desc' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (party) query.party = party;
    if (search) query.$or = [
      { billNumber: { $regex: search, $options: 'i' } }
    ];
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('party', 'name mobile address gstNumber')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, bills, {
      total, page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('party', 'name mobile address gstNumber email')
      .populate('items.design', 'designNumber name fabricType image');
    if (!bill) return errorResponse(res, 'Bill not found', 404);

    const payments = await Payment.find({ bill: bill._id }).sort({ paymentDate: -1 });
    return successResponse(res, { bill, payments });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createBill = async (req, res) => {
  try {
    const { partyId, items, gstEnabled, notes, termsAndConditions, commissionRate, commissionType, commissionNote, billDate } = req.body;

    const party = await Party.findById(partyId);
    if (!party) return errorResponse(res, 'Party not found', 404);

    // Process items
    const processedItems = [];
    let subtotal = 0;
    let totalGst = 0;

    for (const item of items) {
      const design = await Design.findById(item.designId);
      if (!design) return errorResponse(res, `Design ${item.designId} not found`, 404);

      const itemTotal = item.quantity * item.pricePerPiece;
      const gstRate = gstEnabled ? (item.gstRate || design.gstRate || 0) : 0;
      const gstAmount = (itemTotal * gstRate) / 100;

      processedItems.push({
        design: design._id,
        designNumber: design.designNumber,
        designName: design.name,
        designImage: design.image,
        fabricType: item.fabricType || design.fabricType,
        color: item.color,
        quantity: item.quantity,
        pricePerPiece: item.pricePerPiece,
        totalAmount: itemTotal,
        gstRate,
        gstAmount
      });

      subtotal += itemTotal;
      totalGst += gstAmount;
    }

    const grandTotal = subtotal + totalGst;

    // Calculate commission
    let commissionAmount = 0;
    const effectiveCommissionRate = commissionRate || party.commissionRate || 0;
    const effectiveCommissionType = commissionType || party.commissionType || 'percentage';
    if (effectiveCommissionRate > 0) {
      commissionAmount = effectiveCommissionType === 'percentage'
        ? (grandTotal * effectiveCommissionRate) / 100
        : effectiveCommissionRate;
    }

    // Calculate due date
    const bDate = billDate ? new Date(billDate) : new Date();
    const dueDate = new Date(bDate);
    dueDate.setDate(dueDate.getDate() + (party.paymentTermsDays || 30));

    const bill = await Bill.create({
      party: partyId,
      billDate: bDate,
      dueDate,
      items: processedItems,
      subtotal,
      gstEnabled: !!gstEnabled,
      totalGst,
      grandTotal,
      pendingAmount: grandTotal,
      commissionRate: effectiveCommissionRate,
      commissionType: effectiveCommissionType,
      commissionAmount,
      commissionNote,
      notes,
      termsAndConditions,
      createdBy: req.user._id
    });

    // Update party totals
    await Party.findByIdAndUpdate(partyId, {
      $inc: { totalBilled: grandTotal, totalPending: grandTotal }
    });

    // Create stock outward entries
    for (const item of processedItems) {
      await StockEntry.create({
        design: item.design,
        type: 'outward',
        quantity: item.quantity,
        color: item.color,
        fabricType: item.fabricType,
        referenceType: 'sale',
        referenceId: bill._id,
        referenceModel: 'Bill',
        party: partyId,
        createdBy: req.user._id
      });

      // Update design stock
      const design = await Design.findById(item.design);
      if (design) {
        design.totalStock = Math.max(0, design.totalStock - item.quantity);
        await design.save();
      }
    }

    const populated = await Bill.findById(bill._id).populate('party', 'name mobile address gstNumber');
    return successResponse(res, populated, 'Bill created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return errorResponse(res, 'Bill not found', 404);
    if (bill.status === 'paid') return errorResponse(res, 'Cannot edit a paid bill', 400);

    const allowedUpdates = ['notes', 'termsAndConditions', 'commissionRate', 'commissionType', 'commissionNote', 'commissionAmount'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Bill.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('party', 'name mobile address gstNumber');
    return successResponse(res, updated, 'Bill updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const cancelBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return errorResponse(res, 'Bill not found', 404);
    if (bill.status === 'paid') return errorResponse(res, 'Cannot cancel a paid bill', 400);

    bill.status = 'cancelled';
    await bill.save();

    // Reverse party totals
    await Party.findByIdAndUpdate(bill.party, {
      $inc: { totalBilled: -bill.grandTotal, totalPending: -bill.pendingAmount }
    });

    return successResponse(res, null, 'Bill cancelled successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const downloadBillPDF = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('party')
      .populate('items.design');
    if (!bill) return errorResponse(res, 'Bill not found', 404);

    const settings = await Settings.findOne() || {};
    const payments = await Payment.find({ bill: bill._id });

    const pdfBuffer = await generateBillPDF(bill, settings, payments);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${bill.billNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getBills, getBill, createBill, updateBill, cancelBill, downloadBillPDF };
