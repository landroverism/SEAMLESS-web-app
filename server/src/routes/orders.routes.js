const express = require('express');
const { body } = require('express-validator');
const ordersController = require('../controllers/orders.controller');
const { validateRequest } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the authenticated tailor
 * @access  Private
 */
router.get('/', ordersController.getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get an order by ID
 * @access  Private
 */
router.get('/:id', ordersController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  '/',
  [
    body('client_id').notEmpty().withMessage('Client ID is required'),
    body('service').notEmpty().withMessage('Service is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('due_date').isISO8601().withMessage('Due date must be a valid date'),
    body('status').isIn(['pending', 'in_progress', 'ready_for_fitting', 'completed', 'cancelled'])
      .withMessage('Status must be one of: pending, in_progress, ready_for_fitting, completed, cancelled'),
    validateRequest
  ],
  ordersController.createOrder
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update an order
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('service').optional(),
    body('description').optional(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('notes').optional(),
    validateRequest
  ],
  ordersController.updateOrder
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.put(
  '/:id/status',
  [
    body('status').isIn(['pending', 'in_progress', 'ready_for_fitting', 'completed', 'cancelled'])
      .withMessage('Status must be one of: pending, in_progress, ready_for_fitting, completed, cancelled'),
    validateRequest
  ],
  ordersController.updateOrderStatus
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete('/:id', ordersController.deleteOrder);

/**
 * @route   GET /api/orders/stats/summary
 * @desc    Get order statistics summary
 * @access  Private
 */
router.get('/stats/summary', ordersController.getOrderStatsSummary);

/**
 * @route   GET /api/orders/stats/by-status
 * @desc    Get orders grouped by status
 * @access  Private
 */
router.get('/stats/by-status', ordersController.getOrdersByStatus);

/**
 * @route   GET /api/orders/stats/by-month
 * @desc    Get orders grouped by month
 * @access  Private
 */
router.get('/stats/by-month', ordersController.getOrdersByMonth);

module.exports = router;
