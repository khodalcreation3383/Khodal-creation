const express = require('express');
const router = express.Router();
const { getPayments, addPayment, updateChequeStatus, getPaymentSummary } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getPayments);
router.get('/summary', getPaymentSummary);
router.post('/', addPayment);
router.patch('/:id/cheque-status', updateChequeStatus);

module.exports = router;
