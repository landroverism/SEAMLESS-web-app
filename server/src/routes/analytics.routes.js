const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics data
 * @access  Private
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private
 */
router.get('/revenue', analyticsController.getRevenueAnalytics);

/**
 * @route   GET /api/analytics/services
 * @desc    Get service popularity analytics
 * @access  Private
 */
router.get('/services', analyticsController.getServiceAnalytics);

/**
 * @route   GET /api/analytics/clients
 * @desc    Get client analytics
 * @access  Private
 */
router.get('/clients', analyticsController.getClientAnalytics);

/**
 * @route   GET /api/analytics/performance
 * @desc    Get tailor performance analytics
 * @access  Private
 */
router.get('/performance', analyticsController.getPerformanceAnalytics);

module.exports = router;
