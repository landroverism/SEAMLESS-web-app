const express = require('express');
const { body } = require('express-validator');
const clientsController = require('../controllers/clients.controller');
const { validateRequest } = require('../middleware/validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All client routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/clients
 * @desc    Get all clients for the authenticated tailor
 * @access  Private
 */
router.get('/', clientsController.getAllClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get a client by ID
 * @access  Private
 */
router.get('/:id', clientsController.getClientById);

/**
 * @route   POST /api/clients
 * @desc    Create a new client
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').optional(),
    body('address').optional(),
    validateRequest
  ],
  clientsController.createClient
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update a client
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional(),
    body('address').optional(),
    validateRequest
  ],
  clientsController.updateClient
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete a client
 * @access  Private
 */
router.delete('/:id', clientsController.deleteClient);

/**
 * @route   PUT /api/clients/:id/preferences
 * @desc    Update client preferences
 * @access  Private
 */
router.put(
  '/:id/preferences',
  [
    body('preferences').notEmpty().withMessage('Preferences are required'),
    validateRequest
  ],
  clientsController.updateClientPreferences
);

/**
 * @route   PUT /api/clients/:id/measurements
 * @desc    Update client measurements
 * @access  Private
 */
router.put(
  '/:id/measurements',
  [
    body('measurements').notEmpty().withMessage('Measurements are required'),
    validateRequest
  ],
  clientsController.updateClientMeasurements
);

/**
 * @route   GET /api/clients/:id/orders
 * @desc    Get all orders for a client
 * @access  Private
 */
router.get('/:id/orders', clientsController.getClientOrders);

module.exports = router;
