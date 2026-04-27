const Payment = require('../models/Payment.model');
const Bill = require('../models/Bill.model');
const Party = require('../models/Party.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, method, party, bill, startDate, endDate } = req.query;
    const query = {};
    if (method) query.method = method;
    if (party) query.party = party;
    if (bill) query.bill = bill;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('party', 'name mobile')
      .populate('bill', 'billNumber grandTotal')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Summary
    const summary = await Payment.aggregate([
      { $match: query },
      { $group: {
        _id: '$method',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }}
    ]);

    return paginatedResponse(res, payments, {
      total, page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(total / limit), summary
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const addPayment = async (req, res) => {
  try {
    const { billId, amount, method, transactionId, bankName, chequeNumber, chequeDate, chequeBank, upiId, upiRef, notes, isAdvance, advancePercentage } = req.body;

    const bill = await Bill.findById(billId).populate('party');
    if (!bill) return errorResponse(res, 'Bill not found', 404);
    if (bill.status === 'cancelled') return errorResponse(res, 'Cannot add payment to cancelled bill', 400);

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > bill.pendingAmount) {
      return errorResponse(res, `Payment amount exceeds pending amount (${bill.pendingAmount})`, 400);
    }

    const payment = await Payment.create({
      bill: billId,
      party: bill.party._id,
      amount: paymentAmount,
      method,
      transactionId,
      bankName,
      chequeNumber,
      chequeDate,
      chequeBank,
      chequeStatus: chequeNumber ? 'pending' : undefined,
      upiId,
      upiRef,
      notes,
      isAdvance: !!isAdvance,
      advancePercentage,
      createdBy: req.user._id
    });

    // Update bill
    bill.paidAmount += paymentAmount;
    bill.pendingAmount = bill.grandTotal - bill.paidAmount;
    if (bill.paidAmount >= bill.grandTotal) bill.status = 'paid';
    else if (bill.paidAmount > 0) bill.status = 'partial';
    await bill.save();

    // Update party totals
    await Party.findByIdAndUpdate(bill.party._id, {
      $inc: { totalPaid: paymentAmount, totalPending: -paymentAmount }
    });

    const populated = await Payment.findById(payment._id)
      .populate('party', 'name mobile')
      .populate('bill', 'billNumber grandTotal');

    return successResponse(res, populated, 'Payment recorded successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateChequeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return errorResponse(res, 'Payment not found', 404);
    if (payment.method !== 'cheque') return errorResponse(res, 'Not a cheque payment', 400);

    payment.chequeStatus = status;
    await payment.save();

    if (status === 'bounced') {
      // Reverse the payment from bill
      const bill = await Bill.findById(payment.bill);
      if (bill) {
        bill.paidAmount -= payment.amount;
        bill.pendingAmount = bill.grandTotal - bill.paidAmount;
        if (bill.paidAmount <= 0) bill.status = 'pending';
        else bill.status = 'partial';
        await bill.save();
      }
      await Party.findByIdAndUpdate(payment.party, {
        $inc: { totalPaid: -payment.amount, totalPending: payment.amount }
      });
    }

    return successResponse(res, payment, 'Cheque status updated');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = new Date(startDate);
      if (endDate) match.paymentDate.$lte = new Date(endDate);
    }

    const summary = await Payment.aggregate([
      { $match: match },
      { $group: {
        _id: '$method',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { totalAmount: -1 } }
    ]);

    const total = summary.reduce((s, i) => s + i.totalAmount, 0);
    return successResponse(res, { summary, total });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getPayments, addPayment, updateChequeStatus, getPaymentSummary };
