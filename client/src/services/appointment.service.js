import api from './api';

/**
 * Appointment Service
 * Handles all appointment-related API calls and data management
 */
class AppointmentService {
  /**
   * Get all appointments for the current tailor
   * @param {Object} filters - Optional filters (date, status, client)
   * @returns {Promise} Promise object with appointments data
   */
  async getAppointments(filters = {}) {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Get a specific appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise object with appointment data
   */
  async getAppointment(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} Promise object with created appointment data
   */
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise} Promise object with updated appointment data
   */
  async updateAppointment(id, appointmentData) {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise object with cancellation result
   */
  async cancelAppointment(id) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get available time slots for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} serviceType - Type of service
   * @returns {Promise} Promise object with available time slots
   */
  async getAvailableSlots(date, serviceType) {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { date, serviceType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  /**
   * Check if a specific time slot is available
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @param {string} serviceType - Type of service
   * @returns {Promise<boolean>} Promise resolving to true if slot is available
   */
  async isSlotAvailable(date, time, serviceType) {
    try {
      const response = await api.get('/appointments/check-slot', {
        params: { date, time, serviceType }
      });
      return response.data.available;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }
}

export default new AppointmentService();
