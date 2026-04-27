const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return successResponse(res, { user, token }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getMe = async (req, res) => {
  try {
    return successResponse(res, req.user, 'User fetched');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);
    
    user.password = newPassword;
    await user.save();
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { login, getMe, changePassword };
