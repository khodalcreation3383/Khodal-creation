const express = require('express');
const router = express.Router();
const { getSalesReport, getStockReport, exportCSV } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/sales', getSalesReport);
router.get('/stock', getStockReport);
router.get('/export', exportCSV);

module.exports = router;
