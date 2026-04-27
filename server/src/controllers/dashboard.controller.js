const Bill = require('../models/Bill.model');
const Party = require('../models/Party.model');
const Design = require('../models/Design.model');
const Payment = require('../models/Payment.model');
const StockEntry = require('../models/Stock.model');
const Reminder = require('../models/Reminder.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Revenue stats
    const [totalRevenue, monthRevenue, yearRevenue] = await Promise.all([
      Bill.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Bill.aggregate([{ $match: { billDate: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
      Bill.aggregate([{ $match: { billDate: { $gte: startOfYear }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }])
    ]);

    // Payment stats
    const [totalPaid, totalPending] = await Promise.all([
      Bill.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
      Bill.aggregate([{ $match: { status: { $in: ['pending', 'partial', 'overdue'] } } }, { $group: { _id: null, total: { $sum: '$pendingAmount' } } }])
    ]);

    // Bill status counts
    const billStatusCounts = await Bill.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Party count
    const [totalParties, activeParties] = await Promise.all([
      Party.countDocuments(),
      Party.countDocuments({ isActive: true })
    ]);

    // Design count
    const totalDesigns = await Design.countDocuments({ isActive: true });

    // Stock overview
    const stockData = await StockEntry.aggregate([
      { $group: { _id: '$type', total: { $sum: '$quantity' } } }
    ]);
    const totalInward = stockData.find(s => s._id === 'inward')?.total || 0;
    const totalOutward = stockData.find(s => s._id === 'outward')?.total || 0;

    // Recent bills
    const recentBills = await Bill.find({ status: { $ne: 'cancelled' } })
      .populate('party', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await Bill.aggregate([
      { $match: { billDate: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) }, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: { year: { $year: '$billDate' }, month: { $month: '$billDate' } },
        revenue: { $sum: '$grandTotal' },
        paid: { $sum: '$paidAmount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Payment method breakdown
    const paymentMethods = await Payment.aggregate([
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Unread reminders
    const reminders = await Reminder.find({ isRead: false })
      .populate('party', 'name')
      .populate('bill', 'billNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top parties by revenue
    const topParties = await Bill.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$party', totalBilled: { $sum: '$grandTotal' }, totalPaid: { $sum: '$paidAmount' }, billCount: { $sum: 1 } } },
      { $sort: { totalBilled: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'parties', localField: '_id', foreignField: '_id', as: 'party' } },
      { $unwind: '$party' }
    ]);

    return successResponse(res, {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0,
        year: yearRevenue[0]?.total || 0
      },
      payments: {
        totalPaid: totalPaid[0]?.total || 0,
        totalPending: totalPending[0]?.total || 0
      },
      bills: {
        statusCounts: billStatusCounts,
        recent: recentBills
      },
      parties: { total: totalParties, active: activeParties },
      designs: { total: totalDesigns },
      stock: { totalInward, totalOutward, available: totalInward - totalOutward },
      monthlyRevenue,
      paymentMethods,
      reminders,
      topParties
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate('party', 'name mobile')
      .populate('bill', 'billNumber grandTotal dueDate')
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, reminders);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markReminderRead = async (req, res) => {
  try {
    await Reminder.findByIdAndUpdate(req.params.id, { isRead: true });
    return successResponse(res, null, 'Reminder marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markAllRemindersRead = async (req, res) => {
  try {
    await Reminder.updateMany({ isRead: false }, { isRead: true });
    return successResponse(res, null, 'All reminders marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getDashboardStats, getReminders, markReminderRead, markAllRemindersRead };
