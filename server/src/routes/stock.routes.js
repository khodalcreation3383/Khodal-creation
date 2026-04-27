const express = require('express');
const router = express.Router();
const { getStockEntries, getStockSummary, addStockEntry, deleteStockEntry } = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getStockEntries);
router.get('/summary', getStockSummary);
router.post('/', addStockEntry);
router.delete('/:id', deleteStockEntry);

module.exports = router;
