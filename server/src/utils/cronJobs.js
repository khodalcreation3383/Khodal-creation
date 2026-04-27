const cron = require('node-cron');
const logger = require('./logger');

const startCronJobs = () => {
  // Run every day at 8 AM - check for payment reminders
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running payment reminder cron job...');
    try {
      const Bill = require('../models/Bill.model');
      const Settings = require('../models/Settings.model');
      
      const today = new Date();
      const reminderDate = new Date(today);
      reminderDate.setDate(today.getDate() + 5);

      // Find bills where due date is within 5 days and payment is pending/partial
      const bills = await Bill.find({
        status: { $in: ['pending', 'partial'] },
        dueDate: {
          $gte: today,
          $lte: reminderDate
        }
      }).populate('party', 'name mobile email');

      if (bills.length > 0) {
        logger.info(`Found ${bills.length} bills with upcoming payment due dates`);
        
        // Store reminders in DB for dashboard display
        const Reminder = require('../models/Reminder.model');
        for (const bill of bills) {
          const existing = await Reminder.findOne({ bill: bill._id, type: 'payment_due' });
          if (!existing) {
            await Reminder.create({
              bill: bill._id,
              party: bill.party._id,
              type: 'payment_due',
              message: `Payment due for ${bill.party.name} - Bill #${bill.billNumber} - Due: ${bill.dueDate.toDateString()}`,
              dueDate: bill.dueDate,
              amount: bill.pendingAmount
            });
          }
        }
      }
    } catch (error) {
      logger.error('Cron job error:', error);
    }
  });

  // Clean old reminders every week
  cron.schedule('0 0 * * 0', async () => {
    try {
      const Reminder = require('../models/Reminder.model');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await Reminder.deleteMany({ createdAt: { $lt: thirtyDaysAgo }, isRead: true });
      logger.info('Old reminders cleaned up');
    } catch (error) {
      logger.error('Cleanup cron error:', error);
    }
  });

  logger.info('Cron jobs started');
};

module.exports = { startCronJobs };
