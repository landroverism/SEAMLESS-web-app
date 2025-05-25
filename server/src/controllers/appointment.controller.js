const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Appointment Controller
 * Handles all appointment-related operations
 */
const appointmentController = {
  /**
   * Get all appointments for a tailor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAppointments(req, res) {
    try {
      const { tailorId } = req.user;
      const { date, status, clientId } = req.query;
      
      // Build query
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (id, name, email, phone)
        `)
        .eq('tailor_id', tailorId);
      
      // Apply filters if provided
      if (date) {
        query = query.eq('date', date);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      // Order by date and time
      query = query.order('date', { ascending: true }).order('time', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch appointments',
          error: error.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getAppointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Get a specific appointment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAppointment(req, res) {
    try {
      const { id } = req.params;
      const { tailorId } = req.user;
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (id, name, email, phone)
        `)
        .eq('id', id)
        .eq('tailor_id', tailorId)
        .single();
      
      if (error) {
        console.error(`Error fetching appointment ${id}:`, error);
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
          error: error.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully',
        data
      });
    } catch (error) {
      console.error('Error in getAppointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Create a new appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createAppointment(req, res) {
    try {
      const { tailorId } = req.user;
      const {
        clientId,
        serviceType,
        date,
        time,
        duration,
        notes
      } = req.body;
      
      // Validate required fields
      if (!clientId || !serviceType || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          error: 'Client ID, service type, date, and time are required'
        });
      }
      
      // Check if slot is available
      const isAvailable = await checkSlotAvailability(tailorId, date, time, duration || getDefaultDuration(serviceType));
      
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'Time slot is not available',
          error: 'The requested time slot is already booked'
        });
      }
      
      // Create appointment
      const appointmentData = {
        id: uuidv4(),
        tailor_id: tailorId,
        client_id: clientId,
        service_type: serviceType,
        date,
        time,
        duration: duration || getDefaultDuration(serviceType),
        status: 'scheduled',
        notes: notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create appointment',
          error: error.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data
      });
    } catch (error) {
      console.error('Error in createAppointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Update an existing appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const { tailorId } = req.user;
      const {
        serviceType,
        date,
        time,
        duration,
        status,
        notes
      } = req.body;
      
      // Check if appointment exists and belongs to this tailor
      const { data: existingAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .eq('tailor_id', tailorId)
        .single();
      
      if (fetchError) {
        console.error(`Error fetching appointment ${id}:`, fetchError);
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
          error: fetchError.message
        });
      }
      
      // Check if slot is available (if date or time changed)
      if ((date && date !== existingAppointment.date) || (time && time !== existingAppointment.time)) {
        const isAvailable = await checkSlotAvailability(
          tailorId,
          date || existingAppointment.date,
          time || existingAppointment.time,
          duration || existingAppointment.duration,
          id // Exclude current appointment from availability check
        );
        
        if (!isAvailable) {
          return res.status(409).json({
            success: false,
            message: 'Time slot is not available',
            error: 'The requested time slot is already booked'
          });
        }
      }
      
      // Update appointment
      const updateData = {
        ...(serviceType && { service_type: serviceType }),
        ...(date && { date }),
        ...(time && { time }),
        ...(duration && { duration }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('tailor_id', tailorId)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating appointment ${id}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update appointment',
          error: error.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data
      });
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Cancel an appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { tailorId } = req.user;
      
      // Check if appointment exists and belongs to this tailor
      const { data: existingAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .eq('tailor_id', tailorId)
        .single();
      
      if (fetchError) {
        console.error(`Error fetching appointment ${id}:`, fetchError);
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
          error: fetchError.message
        });
      }
      
      // Update appointment status to cancelled
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tailor_id', tailorId)
        .select()
        .single();
      
      if (error) {
        console.error(`Error cancelling appointment ${id}:`, error);
        return res.status(500).json({
          success: false,
          message: 'Failed to cancel appointment',
          error: error.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data
      });
    } catch (error) {
      console.error('Error in cancelAppointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Get available time slots for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableSlots(req, res) {
    try {
      const { tailorId } = req.user;
      const { date, serviceType } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required',
          error: 'Please provide a date'
        });
      }
      
      // Get tailor's working hours (default: 9am-6pm)
      const workingHours = {
        start: '09:00',
        end: '18:00'
      };
      
      // Get default duration for the service type
      const duration = getDefaultDuration(serviceType);
      
      // Get all appointments for the specified date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('time, duration')
        .eq('tailor_id', tailorId)
        .eq('date', date)
        .not('status', 'eq', 'cancelled');
      
      if (error) {
        console.error('Error fetching existing appointments:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch existing appointments',
          error: error.message
        });
      }
      
      // Generate available time slots
      const availableSlots = generateTimeSlots(workingHours, duration, existingAppointments);
      
      return res.status(200).json({
        success: true,
        message: 'Available time slots retrieved successfully',
        data: availableSlots
      });
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
  
  /**
   * Check if a specific time slot is available
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkSlot(req, res) {
    try {
      const { tailorId } = req.user;
      const { date, time, serviceType } = req.query;
      
      if (!date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Date and time are required',
          error: 'Please provide date and time'
        });
      }
      
      const duration = getDefaultDuration(serviceType);
      const isAvailable = await checkSlotAvailability(tailorId, date, time, duration);
      
      return res.status(200).json({
        success: true,
        message: 'Slot availability checked successfully',
        data: {
          available: isAvailable
        }
      });
    } catch (error) {
      console.error('Error in checkSlot:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

/**
 * Check if a time slot is available
 * @param {string} tailorId - Tailor ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {number} duration - Duration in minutes
 * @param {string} excludeAppointmentId - Appointment ID to exclude (for updates)
 * @returns {Promise<boolean>} Promise resolving to true if slot is available
 */
async function checkSlotAvailability(tailorId, date, time, duration, excludeAppointmentId = null) {
  try {
    // Convert time to minutes for easier comparison
    const requestedStartTime = timeToMinutes(time);
    const requestedEndTime = requestedStartTime + duration;
    
    // Query for existing appointments on the same date
    let query = supabase
      .from('appointments')
      .select('time, duration')
      .eq('tailor_id', tailorId)
      .eq('date', date)
      .not('status', 'eq', 'cancelled');
    
    // Exclude current appointment if updating
    if (excludeAppointmentId) {
      query = query.not('id', 'eq', excludeAppointmentId);
    }
    
    const { data: existingAppointments, error } = await query;
    
    if (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
    
    // Check for overlaps with existing appointments
    for (const appointment of existingAppointments) {
      const existingStartTime = timeToMinutes(appointment.time);
      const existingEndTime = existingStartTime + appointment.duration;
      
      // Check if there's an overlap
      if (
        (requestedStartTime >= existingStartTime && requestedStartTime < existingEndTime) ||
        (requestedEndTime > existingStartTime && requestedEndTime <= existingEndTime) ||
        (requestedStartTime <= existingStartTime && requestedEndTime >= existingEndTime)
      ) {
        return false; // Overlap found, slot is not available
      }
    }
    
    return true; // No overlaps, slot is available
  } catch (error) {
    console.error('Error in checkSlotAvailability:', error);
    return false;
  }
}

/**
 * Generate available time slots for a specific date
 * @param {Object} workingHours - Working hours { start, end }
 * @param {number} duration - Duration in minutes
 * @param {Array} existingAppointments - Existing appointments
 * @returns {Array} Array of available time slots
 */
function generateTimeSlots(workingHours, duration, existingAppointments) {
  const slots = [];
  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);
  const step = 30; // 30-minute intervals
  
  // Create a map of busy times
  const busyTimes = [];
  existingAppointments.forEach(appointment => {
    const startTime = timeToMinutes(appointment.time);
    const endTime = startTime + appointment.duration;
    busyTimes.push({ start: startTime, end: endTime });
  });
  
  // Generate slots
  for (let time = startMinutes; time <= endMinutes - duration; time += step) {
    const slotEndTime = time + duration;
    let isAvailable = true;
    
    // Check if slot overlaps with any existing appointment
    for (const busyTime of busyTimes) {
      if (
        (time >= busyTime.start && time < busyTime.end) ||
        (slotEndTime > busyTime.start && slotEndTime <= busyTime.end) ||
        (time <= busyTime.start && slotEndTime >= busyTime.end)
      ) {
        isAvailable = false;
        break;
      }
    }
    
    if (isAvailable) {
      slots.push({
        time: minutesToTime(time),
        endTime: minutesToTime(slotEndTime)
      });
    }
  }
  
  return slots;
}

/**
 * Convert time string to minutes
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get default duration for a service type
 * @param {string} serviceType - Service type
 * @returns {number} Duration in minutes
 */
function getDefaultDuration(serviceType) {
  const durations = {
    measurement: 60,
    fitting: 45,
    consultation: 30,
    fabric: 30
  };
  
  return durations[serviceType] || 30;
}

module.exports = appointmentController;
