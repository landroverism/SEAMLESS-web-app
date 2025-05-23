const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { validateRequest } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All inventory routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items for the authenticated tailor
 * @access  Private
 */
router.get('/', inventoryController.getAllInventoryItems);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get an inventory item by ID
 * @access  Private
 */
router.get('/:id', inventoryController.getInventoryItemById);

/**
 * @route   POST /api/inventory
 * @desc    Create a new inventory item
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('min_quantity').isNumeric().withMessage('Minimum quantity must be a number'),
    validateRequest
  ],
  inventoryController.createInventoryItem
);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update an inventory item
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('name').optional(),
    body('category').optional(),
    body('description').optional(),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('unit').optional(),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('min_quantity').optional().isNumeric().withMessage('Minimum quantity must be a number'),
    validateRequest
  ],
  inventoryController.updateInventoryItem
);

/**
 * @route   PUT /api/inventory/:id/quantity
 * @desc    Update inventory item quantity
 * @access  Private
 */
router.put(
  '/:id/quantity',
  [
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set'),
    validateRequest
  ],
  inventoryController.updateInventoryQuantity
);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete an inventory item
 * @access  Private
 */
router.delete('/:id', inventoryController.deleteInventoryItem);

/**
 * @route   GET /api/inventory/stats/low-stock
 * @desc    Get low stock inventory items
 * @access  Private
 */
router.get('/stats/low-stock', inventoryController.getLowStockItems);

/**
 * @route   GET /api/inventory/stats/by-category
 * @desc    Get inventory items grouped by category
 * @access  Private
 */
router.get('/stats/by-category', inventoryController.getItemsByCategory);

/**
 * @route   GET /api/inventory/stats/value
 * @desc    Get total inventory value
 * @access  Private
 */
router.get('/stats/value', inventoryController.getTotalInventoryValue);

module.exports = router;
