const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return errorResponse(res, 'Not authorized, user not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token failed', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 'Admin access required', 403);
  }
};

module.exports = { protect, adminOnly };
