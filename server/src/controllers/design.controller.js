const Design = require('../models/Design.model');
const StockEntry = require('../models/Stock.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

const getDesigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, fabricType, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { designNumber: { $regex: search, $options: 'i' } },
      { fabricType: { $regex: search, $options: 'i' } }
    ];
    if (fabricType) query.fabricType = { $regex: fabricType, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Design.countDocuments(query);
    const designs = await Design.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, designs, {
      total, page: parseInt(page), limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return errorResponse(res, 'Design not found', 404);
    return successResponse(res, design);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createDesign = async (req, res) => {
  try {
    const designData = { ...req.body };
    if (req.file) {
      // Cloudinary automatically uploads and returns the URL
      designData.image = req.file.path; // Cloudinary URL
    }
    if (typeof designData.colors === 'string') {
      designData.colors = designData.colors.split(',').map(c => c.trim()).filter(Boolean);
    }
    const design = await Design.create(designData);
    return successResponse(res, design, 'Design created successfully', 201);
  } catch (error) {
    if (error.code === 11000) return errorResponse(res, 'Design number already exists', 400);
    return errorResponse(res, error.message, 500);
  }
};

const updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return errorResponse(res, 'Design not found', 404);

    const updateData = { ...req.body };
    if (req.file) {
      // Delete old image from Cloudinary
      if (design.image) {
        await deleteFromCloudinary(design.image);
      }
      updateData.image = req.file.path; // New Cloudinary URL
    }
    if (typeof updateData.colors === 'string') {
      updateData.colors = updateData.colors.split(',').map(c => c.trim()).filter(Boolean);
    }

    const updated = await Design.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return successResponse(res, updated, 'Design updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return errorResponse(res, 'Design not found', 404);
    design.isActive = false;
    await design.save();
    return successResponse(res, null, 'Design deactivated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getDesignStock = async (req, res) => {
  try {
    const entries = await StockEntry.find({ design: req.params.id })
      .sort({ createdAt: -1 })
      .populate('party', 'name');
    return successResponse(res, entries);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getDesigns, getDesign, createDesign, updateDesign, deleteDesign, getDesignStock };
