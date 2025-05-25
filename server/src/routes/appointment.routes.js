const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Appointment Routes
 * All routes are protected by authentication middleware
 */

// Get all appointments
router.get('/', authMiddleware, appointmentController.getAppointments);

// Get available time slots
router.get('/available-slots', authMiddleware, appointmentController.getAvailableSlots);

// Check if a specific time slot is available
router.get('/check-slot', authMiddleware, appointmentController.checkSlot);

// Get a specific appointment
router.get('/:id', authMiddleware, appointmentController.getAppointment);

// Create a new appointment
router.post('/', authMiddleware, appointmentController.createAppointment);

// Update an appointment
router.put('/:id', authMiddleware, appointmentController.updateAppointment);

// Cancel an appointment
router.delete('/:id', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
