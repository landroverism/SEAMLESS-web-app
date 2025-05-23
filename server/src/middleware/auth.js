const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const supabase = require('../services/supabase.service');

/**
 * Middleware to authenticate JWT token
 */
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError('Access denied. No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in Supabase
    const { data: user, error } = await supabase
      .from('tailors')
      .select('id, email')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new ApiError('Invalid token. User not found', 401);
    }

    // Set user in request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Middleware to check if user is admin
 */
exports.isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const { data: tailor, error } = await supabase
      .from('tailors')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !tailor) {
      throw new ApiError('User not found', 404);
    }

    if (tailor.role !== 'admin') {
      throw new ApiError('Access denied. Admin role required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
