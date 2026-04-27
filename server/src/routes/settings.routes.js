const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadLogo } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadLogo: uploadLogoMiddleware, handleUploadError } = require('../middleware/upload.middleware');

router.use(protect);
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/logo', handleUploadError(uploadLogoMiddleware), uploadLogo);

module.exports = router;
