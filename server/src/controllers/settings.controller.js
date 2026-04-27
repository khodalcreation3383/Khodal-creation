const Settings = require('../models/Settings.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        businessName: 'Textile Business',
        address: { city: 'Your City', state: 'Your State', country: 'India' }
      });
    }
    return successResponse(res, settings);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      // Deep merge
      const updateData = req.body;
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
          settings[key] = { ...settings[key]?.toObject?.() || settings[key], ...updateData[key] };
        } else {
          settings[key] = updateData[key];
        }
      });
      await settings.save();
    }
    return successResponse(res, settings, 'Settings updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({ businessName: 'Textile Business' });

    // Delete old logo from Cloudinary
    if (settings.logo) {
      await deleteFromCloudinary(settings.logo);
    }

    settings.logo = req.file.path; // Cloudinary URL
    await settings.save();

    return successResponse(res, { logo: settings.logo }, 'Logo uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getSettings, updateSettings, uploadLogo };
