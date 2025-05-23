const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { validateRequest } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/admin/set-role
 * @desc    Set a user as admin
 * @access  Private
 */
router.post(
  '/set-role',
  authenticateToken,
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('adminCode').notEmpty().withMessage('Admin code is required'),
    validateRequest
  ],
  adminController.setAdminRole
);

/**
 * @route   POST /api/admin/create
 * @desc    Create admin user
 * @access  Public (with admin code)
 */
router.post(
  '/create',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('adminCode').notEmpty().withMessage('Admin code is required'),
    validateRequest
  ],
  adminController.createAdmin
);

module.exports = router;
