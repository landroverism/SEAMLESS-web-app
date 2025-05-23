const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new tailor
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    validateRequest
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login a tailor and get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current tailor profile
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a tailor
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update tailor profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  [
    body('name').optional(),
    body('specialty').optional(),
    body('experience').optional(),
    body('phone').optional(),
    validateRequest
  ],
  authController.updateProfile
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validateRequest
  ],
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validateRequest
  ],
  authController.resetPassword
);

module.exports = router;
