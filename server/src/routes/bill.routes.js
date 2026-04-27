const express = require('express');
const router = express.Router();
const { getBills, getBill, createBill, updateBill, cancelBill, downloadBillPDF } = require('../controllers/bill.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getBills);
router.get('/:id', getBill);
router.get('/:id/pdf', downloadBillPDF);
router.post('/', createBill);
router.put('/:id', updateBill);
router.patch('/:id/cancel', cancelBill);

module.exports = router;
