const { supabase } = require('../services/supabase.service');
const logger = require('../utils/logger');

/**
 * Appointments Controller
 * Handles all appointment-related operations
 */
class AppointmentsController {
  /**
   * Get all appointments for the current tailor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAppointments(req, res) {
    try {
      const { user } = req;
      const { date, status, clientId } = req.query;
      
      // Build query
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (id, first_name, last_name, email, phone)
        `)
        .eq('tailor_id', user.id);
      
      // Apply filters if provided
      if (date) {
        // For date, we want to get all appointments on that day
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('appointment_time', startDate.toISOString())
          .lt('appointment_time', endDate.toISOString());
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Execute query with connection error handling
      let data, error;
      try {
        const result = await query.order('appointment_time', { ascending: true });
        data = result.data;
        error = result.error;
      } catch (connectionError) {
        logger.error('Supabase connection error in getAppointments:', connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (error) {
        logger.error('Error fetching appointments:', error);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error in getAppointments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Get a specific appointment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAppointment(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      
      // Execute query with connection error handling
      let data, error;
      try {
        const result = await supabase
          .from('appointments')
          .select(`
            *,
            clients:client_id (id, first_name, last_name, email, phone)
          `)
          .eq('id', id)
          .eq('tailor_id', user.id)
          .single();
        
        data = result.data;
        error = result.error;
      } catch (connectionError) {
        logger.error(`Supabase connection error in getAppointment(${id}):`, connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (error) {
        logger.error(`Error fetching appointment ${id}:`, error);
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found',
          error: error.message
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error in getAppointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Create a new appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createAppointment(req, res) {
    try {
      const { user } = req;
      const {
        client_id,
        appointment_time,
        duration,
        service_type,
        notes,
        status = 'scheduled'
      } = req.body;
      
      // Validate required fields
      if (!client_id || !appointment_time || !duration || !service_type) {
        return res.status(400).json({
          error: 'Missing required fields: client_id, appointment_time, duration, service_type'
        });
      }
      
      // Check if the slot is available
      const isAvailable = await this.checkSlotAvailability(
        user.id,
        appointment_time,
        duration
      );
      
      if (!isAvailable) {
        return res.status(409).json({ error: 'Time slot is not available' });
      }
      
      // Create the appointment with connection error handling
      let data, error;
      try {
        const result = await supabase
          .from('appointments')
          .insert([{
            tailor_id: user.id,
            client_id,
            appointment_time,
            duration,
            service_type,
            notes,
            status
          }])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } catch (connectionError) {
        logger.error('Supabase connection error in createAppointment:', connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (error) {
        logger.error('Error creating appointment:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create appointment',
          error: error.message
        });
      }
      
      return res.status(201).json(data);
    } catch (error) {
      logger.error('Error in createAppointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Update an existing appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      const {
        client_id,
        appointment_time,
        duration,
        service_type,
        notes,
        status
      } = req.body;
      
      // Get the current appointment with connection error handling
      let currentAppointment, fetchError;
      try {
        const fetchResult = await supabase
          .from('appointments')
          .select('*')
          .eq('id', id)
          .eq('tailor_id', user.id)
          .single();
        
        currentAppointment = fetchResult.data;
        fetchError = fetchResult.error;
      } catch (connectionError) {
        logger.error(`Supabase connection error in updateAppointment(${id}) - fetch:`, connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (fetchError) {
        logger.error(`Error fetching appointment ${id}:`, fetchError);
        return res.status(404).json({
          success: false, 
          message: 'Appointment not found',
          error: fetchError.message
        });
      }
      
      // Check if the new slot is available (if time or duration changed)
      if (
        appointment_time && 
        (appointment_time !== currentAppointment.appointment_time || 
         duration !== currentAppointment.duration)
      ) {
        const isAvailable = await this.checkSlotAvailability(
          user.id,
          appointment_time,
          duration,
          id // Exclude current appointment from availability check
        );
        
        if (!isAvailable) {
          return res.status(409).json({ error: 'Time slot is not available' });
        }
      }
      
      // Update the appointment with connection error handling
      let data, error;
      try {
        const updateResult = await supabase
          .from('appointments')
          .update({
            client_id: client_id || currentAppointment.client_id,
            appointment_time: appointment_time || currentAppointment.appointment_time,
            duration: duration || currentAppointment.duration,
            service_type: service_type || currentAppointment.service_type,
            notes: notes !== undefined ? notes : currentAppointment.notes,
            status: status || currentAppointment.status
          })
          .eq('id', id)
          .eq('tailor_id', user.id)
          .select()
          .single();
        
        data = updateResult.data;
        error = updateResult.error;
      } catch (connectionError) {
        logger.error(`Supabase connection error in updateAppointment(${id}) - update:`, connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (error) {
        logger.error(`Error updating appointment ${id}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update appointment',
          error: error.message
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error in updateAppointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Cancel an appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      
      // Update the appointment status to cancelled with connection error handling
      let data, error;
      try {
        const cancelResult = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .eq('tailor_id', user.id)
          .select()
          .single();
        
        data = cancelResult.data;
        error = cancelResult.error;
      } catch (connectionError) {
        logger.error(`Supabase connection error in cancelAppointment(${id}):`, connectionError);
        return res.status(503).json({
          success: false,
          message: 'Appointment service temporarily unavailable. Please try again later.',
          error: connectionError.message || 'Connection timeout'
        });
      }
      
      if (error) {
        logger.error(`Error cancelling appointment ${id}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to cancel appointment',
          error: error.message
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error in cancelAppointment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Get available time slots for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableSlots(req, res) {
    try {
      const { user } = req;
      const { date, serviceType } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }
      
      // Get tailor's working hours
      // For now, we'll use default hours (9 AM - 5 PM)
      const workingHours = {
        start: 9, // 9 AM
        end: 17,  // 5 PM
      };
      
      // Get all appointments for this tailor on the specified date
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, duration')
        .eq('tailor_id', user.id)
        .gte('appointment_time', startDate.toISOString())
        .lt('appointment_time', endDate.toISOString())
        .neq('status', 'cancelled');
      
      if (error) {
        logger.error('Error fetching existing appointments:', error);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }
      
      // Calculate available slots
      // For simplicity, we'll use 30-minute slots
      const slotDuration = 30; // minutes
      const slots = [];
      
      // Convert existing appointments to blocked time ranges
      const blockedRanges = existingAppointments.map(appointment => {
        const start = new Date(appointment.appointment_time);
        const end = new Date(start.getTime() + appointment.duration * 60000);
        return { start, end };
      });
      
      // Generate all possible slots
      const slotDate = new Date(date);
      slotDate.setHours(workingHours.start, 0, 0, 0);
      
      while (slotDate.getHours() < workingHours.end) {
        const slotStart = new Date(slotDate);
        const slotEnd = new Date(slotDate.getTime() + slotDuration * 60000);
        
        // Check if this slot overlaps with any existing appointment
        const isAvailable = !blockedRanges.some(range => {
          return (slotStart < range.end && slotEnd > range.start);
        });
        
        if (isAvailable) {
          slots.push({
            time: slotStart.toISOString(),
            formattedTime: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        
        // Move to next slot
        slotDate.setMinutes(slotDate.getMinutes() + slotDuration);
      }
      
      return res.status(200).json(slots);
    } catch (error) {
      logger.error('Error in getAvailableSlots:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Check if a specific time slot is available
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkSlot(req, res) {
    try {
      const { user } = req;
      const { date, time, serviceType } = req.query;
      
      if (!date || !time) {
        return res.status(400).json({ error: 'Date and time are required' });
      }
      
      // Combine date and time
      const appointmentTime = new Date(`${date}T${time}`);
      
      // Default duration based on service type, or use 60 minutes
      const duration = serviceType === 'fitting' ? 30 : 
                      serviceType === 'consultation' ? 45 : 60;
      
      const isAvailable = await this.checkSlotAvailability(
        user.id,
        appointmentTime.toISOString(),
        duration
      );
      
      return res.status(200).json({ available: isAvailable });
    } catch (error) {
      logger.error('Error in checkSlot:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Helper method to check if a time slot is available
   * @param {string} tailorId - Tailor ID
   * @param {string} appointmentTime - ISO timestamp
   * @param {number} duration - Duration in minutes
   * @param {string} excludeAppointmentId - Optional appointment ID to exclude
   * @returns {Promise<boolean>} - True if slot is available
   */
  async checkSlotAvailability(tailorId, appointmentTime, duration, excludeAppointmentId = null) {
    try {
      const startTime = new Date(appointmentTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      // Query to find overlapping appointments
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('tailor_id', tailorId)
        .neq('status', 'cancelled')
        .or(`appointment_time.lte.${endTime.toISOString()},appointment_time.gte.${startTime.toISOString()}`);
      
      // Exclude the current appointment if updating
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logger.error('Error checking slot availability:', error);
        return false;
      }
      
      // If no overlapping appointments found, the slot is available
      return data.length === 0;
    } catch (error) {
      logger.error('Error in checkSlotAvailability:', error);
      return false;
    }
  }
}

module.exports = new AppointmentsController();
