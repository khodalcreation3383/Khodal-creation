const Bill = require('../models/Bill.model');
const Payment = require('../models/Payment.model');
const Party = require('../models/Party.model');
const Design = require('../models/Design.model');
const StockEntry = require('../models/Stock.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateBillPDF } = require('../utils/pdfGenerator');
const Settings = require('../models/Settings.model');

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, partyId } = req.query;
    const match = { status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
      match.billDate = {};
      if (startDate) match.billDate.$gte = new Date(startDate);
      if (endDate) match.billDate.$lte = new Date(endDate);
    }
    if (partyId) match.party = require('mongoose').Types.ObjectId(partyId);

    const bills = await Bill.find(match)
      .populate('party', 'name mobile gstNumber')
      .sort({ billDate: -1 });

    const summary = {
      totalBills: bills.length,
      totalRevenue: bills.reduce((s, b) => s + b.grandTotal, 0),
      totalPaid: bills.reduce((s, b) => s + b.paidAmount, 0),
      totalPending: bills.reduce((s, b) => s + b.pendingAmount, 0),
      totalGst: bills.reduce((s, b) => s + b.totalGst, 0)
    };

    return successResponse(res, { bills, summary });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getStockReport = async (req, res) => {
  try {
    const designs = await Design.find({ isActive: true });
    const report = [];

    for (const design of designs) {
      const [inwardData, outwardData] = await Promise.all([
        StockEntry.aggregate([{ $match: { design: design._id, type: 'inward' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
        StockEntry.aggregate([{ $match: { design: design._id, type: 'outward' } }, { $group: { _id: null, total: { $sum: '$quantity' } } }])
      ]);
      const inward = inwardData[0]?.total || 0;
      const outward = outwardData[0]?.total || 0;
      report.push({
        designNumber: design.designNumber,
        name: design.name,
        fabricType: design.fabricType,
        pricePerPiece: design.pricePerPiece,
        totalInward: inward,
        totalOutward: outward,
        available: inward - outward,
        stockValue: (inward - outward) * design.pricePerPiece
      });
    }

    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const exportCSV = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let csvData = '';
    let filename = 'report.csv';

    if (type === 'bills') {
      const match = { status: { $ne: 'cancelled' } };
      if (startDate) match.billDate = { $gte: new Date(startDate) };
      if (endDate) match.billDate = { ...match.billDate, $lte: new Date(endDate) };
      const bills = await Bill.find(match).populate('party', 'name mobile');
      
      csvData = 'Bill Number,Party Name,Party Mobile,Bill Date,Due Date,Subtotal,GST,Grand Total,Paid,Pending,Status\n';
      bills.forEach(b => {
        csvData += `${b.billNumber},"${b.party?.name || ''}","${b.party?.mobile || ''}",${new Date(b.billDate).toLocaleDateString()},${new Date(b.dueDate).toLocaleDateString()},${b.subtotal},${b.totalGst},${b.grandTotal},${b.paidAmount},${b.pendingAmount},${b.status}\n`;
      });
      filename = 'bills-report.csv';
    } else if (type === 'payments') {
      const payments = await Payment.find().populate('party', 'name').populate('bill', 'billNumber');
      csvData = 'Date,Party,Bill Number,Method,Amount,Reference,Notes\n';
      payments.forEach(p => {
        const ref = p.chequeNumber || p.transactionId || p.upiRef || '';
        csvData += `${new Date(p.paymentDate).toLocaleDateString()},"${p.party?.name || ''}","${p.bill?.billNumber || ''}",${p.method},${p.amount},"${ref}","${p.notes || ''}"\n`;
      });
      filename = 'payments-report.csv';
    } else if (type === 'stock') {
      const entries = await StockEntry.find().populate('design', 'designNumber name fabricType').populate('party', 'name');
      csvData = 'Date,Design Number,Design Name,Fabric Type,Type,Quantity,Color,Party,Notes\n';
      entries.forEach(e => {
        csvData += `${new Date(e.entryDate).toLocaleDateString()},"${e.design?.designNumber || ''}","${e.design?.name || ''}","${e.design?.fabricType || ''}",${e.type},${e.quantity},"${e.color || ''}","${e.party?.name || ''}","${e.notes || ''}"\n`;
      });
      filename = 'stock-report.csv';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getSalesReport, getStockReport, exportCSV };
