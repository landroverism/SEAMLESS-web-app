const express = require('express');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Appointment routes
 * All routes require authentication
 */

// Get all appointments with optional filters
router.get('/', authenticateToken, appointmentsController.getAppointments.bind(appointmentsController));

// Get available time slots
router.get('/available-slots', authenticateToken, appointmentsController.getAvailableSlots.bind(appointmentsController));

// Check if a specific slot is available
router.get('/check-slot', authenticateToken, appointmentsController.checkSlot.bind(appointmentsController));

// Get a specific appointment by ID
router.get('/:id', authenticateToken, appointmentsController.getAppointment.bind(appointmentsController));

// Create a new appointment
router.post('/', authenticateToken, appointmentsController.createAppointment.bind(appointmentsController));

// Update an existing appointment
router.put('/:id', authenticateToken, appointmentsController.updateAppointment.bind(appointmentsController));

// Cancel an appointment
router.delete('/:id', authenticateToken, appointmentsController.cancelAppointment.bind(appointmentsController));

module.exports = router;
