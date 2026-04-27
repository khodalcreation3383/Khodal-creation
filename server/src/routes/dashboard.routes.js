const express = require('express');
const router = express.Router();
const { getDashboardStats, getReminders, markReminderRead, markAllRemindersRead } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/reminders', getReminders);
router.patch('/reminders/:id/read', markReminderRead);
router.patch('/reminders/read-all', markAllRemindersRead);

module.exports = router;
