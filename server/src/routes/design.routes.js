const express = require('express');
const router = express.Router();
const { getDesigns, getDesign, createDesign, updateDesign, deleteDesign, getDesignStock } = require('../controllers/design.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadDesignImage, handleUploadError } = require('../middleware/upload.middleware');

router.use(protect);
router.get('/', getDesigns);
router.get('/:id', getDesign);
router.get('/:id/stock', getDesignStock);
router.post('/', handleUploadError(uploadDesignImage), createDesign);
router.put('/:id', handleUploadError(uploadDesignImage), updateDesign);
router.delete('/:id', deleteDesign);

module.exports = router;
