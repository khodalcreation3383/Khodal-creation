const express = require('express');
const router = express.Router();
const { getParties, getParty, createParty, updateParty, deleteParty, getPartyLedger } = require('../controllers/party.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getParties);
router.get('/:id', getParty);
router.get('/:id/ledger', getPartyLedger);
router.post('/', createParty);
router.put('/:id', updateParty);
router.delete('/:id', deleteParty);

module.exports = router;
