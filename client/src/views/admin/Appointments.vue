<template>
  <div class="appointments-container">
    <div class="header-section">
      <h1 class="text-2xl font-bold mb-4">Appointment Management</h1>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="Filter by date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="fetchAppointments"
            class="w-full sm:w-auto"
          />
          <el-select
            v-model="selectedStatus"
            placeholder="Filter by status"
            @change="fetchAppointments"
            class="w-full sm:w-auto"
          >
            <el-option label="All" value="" />
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Confirmed" value="confirmed" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </div>
        <el-button type="primary" @click="showNewAppointmentDialog">
          <PlusIcon :size="16" class="mr-1" /> New Appointment
        </el-button>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="calendar-section mb-8">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Calendar View</h2>
          <div class="flex gap-2">
            <el-button size="small" @click="calendarView = 'month'" :type="calendarView === 'month' ? 'primary' : ''">Month</el-button>
            <el-button size="small" @click="calendarView = 'week'" :type="calendarView === 'week' ? 'primary' : ''">Week</el-button>
            <el-button size="small" @click="calendarView = 'day'" :type="calendarView === 'day' ? 'primary' : ''">Day</el-button>
          </div>
        </div>
        
        <!-- Simple calendar placeholder - would be replaced with a proper calendar component -->
        <div class="calendar-placeholder bg-gray-100 rounded-lg p-4 text-center">
          <p class="text-gray-500">Calendar view will be implemented here</p>
          <p class="text-sm text-gray-400 mt-2">Using a dedicated calendar component like FullCalendar</p>
        </div>
      </div>
    </div>

    <!-- Appointments List -->
    <div class="appointments-list">
      <h2 class="text-lg font-semibold mb-4">Upcoming Appointments</h2>
      
      <div v-if="loading" class="text-center py-8">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="appointments.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <CalendarIcon :size="48" class="mx-auto text-gray-300 mb-2" />
        <p class="text-gray-500">No appointments found</p>
        <p class="text-sm text-gray-400 mt-1">Try changing your filters or create a new appointment</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <el-card v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
          <div class="flex justify-between">
            <div class="appointment-status">
              <span 
                class="px-2 py-1 text-xs rounded-full" 
                :class="{
                  'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                  'bg-green-100 text-green-800': appointment.status === 'confirmed',
                  'bg-purple-100 text-purple-800': appointment.status === 'completed',
                  'bg-red-100 text-red-800': appointment.status === 'cancelled'
                }"
              >
                {{ appointment.status }}
              </span>
            </div>
            <div class="appointment-actions">
              <el-dropdown trigger="click">
                <MoreVerticalIcon :size="16" class="cursor-pointer text-gray-500" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editAppointment(appointment)">
                      <EditIcon :size="14" class="mr-1" /> Edit
                    </el-dropdown-item>
                    <el-dropdown-item v-if="appointment.status === 'scheduled'" @click="confirmAppointment(appointment)">
                      <CheckIcon :size="14" class="mr-1" /> Confirm
                    </el-dropdown-item>
                    <el-dropdown-item v-if="['scheduled', 'confirmed'].includes(appointment.status)" @click="completeAppointment(appointment)">
                      <CheckCircleIcon :size="14" class="mr-1" /> Mark as Completed
                    </el-dropdown-item>
                    <el-dropdown-item v-if="['scheduled', 'confirmed'].includes(appointment.status)" @click="cancelAppointment(appointment)">
                      <XIcon :size="14" class="mr-1" /> Cancel
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="client-info mt-3 flex items-center">
            <div class="avatar bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
              <UserIcon :size="20" class="text-gray-500" />
            </div>
            <div class="ml-3">
              <h3 class="font-medium">{{ appointment.client?.first_name }} {{ appointment.client?.last_name }}</h3>
              <p class="text-sm text-gray-500">{{ appointment.client?.phone }}</p>
            </div>
          </div>
          
          <div class="appointment-details mt-4">
            <div class="flex items-center mb-2">
              <CalendarIcon :size="16" class="text-gray-500 mr-2" />
              <span>{{ formatDate(appointment.appointment_time) }}</span>
            </div>
            <div class="flex items-center mb-2">
              <ClockIcon :size="16" class="text-gray-500 mr-2" />
              <span>{{ formatTime(appointment.appointment_time) }}</span>
            </div>
            <div class="flex items-center">
              <TagIcon :size="16" class="text-gray-500 mr-2" />
              <span class="capitalize">{{ appointment.service_type }}</span>
            </div>
          </div>
          
          <div v-if="appointment.notes" class="notes mt-3 p-2 bg-gray-50 rounded text-sm">
            <p class="text-gray-600">{{ appointment.notes }}</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- New Appointment Dialog -->
    <el-dialog
      v-model="newAppointmentDialog"
      title="New Appointment"
      width="90%"
      max-width="600px"
      class="appointment-dialog"
    >
      <el-form :model="appointmentForm" label-position="top">
        <!-- Client Selection -->
        <el-form-item label="Client">
          <el-select
            v-model="appointmentForm.clientId"
            filterable
            placeholder="Select a client"
            class="w-full"
          >
            <el-option
              v-for="client in clients"
              :key="client.id"
              :label="`${client.first_name} ${client.last_name}`"
              :value="client.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- Service Type -->
        <el-form-item label="Service Type">
          <el-select
            v-model="appointmentForm.serviceType"
            placeholder="Select service type"
            class="w-full"
            @change="fetchAvailableSlots"
          >
            <el-option label="Measurement" value="measurement" />
            <el-option label="Fitting" value="fitting" />
            <el-option label="Consultation" value="consultation" />
            <el-option label="Fabric Selection" value="fabric" />
          </el-select>
        </el-form-item>
        
        <!-- Date Selection -->
        <el-form-item label="Date">
          <el-date-picker
            v-model="appointmentForm.date"
            type="date"
            placeholder="Select date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
            @change="fetchAvailableSlots"
          />
        </el-form-item>
        
        <!-- Time Slot Selection -->
        <el-form-item label="Time">
          <el-select
            v-model="appointmentForm.time"
            placeholder="Select time slot"
            class="w-full"
            :disabled="!availableSlots.length"
          >
            <el-option
              v-for="(slot, index) in availableSlots"
              :key="index"
              :label="`${slot.time} - ${slot.endTime}`"
              :value="slot.time"
            />
          </el-select>
          <p v-if="appointmentForm.date && appointmentForm.serviceType && !availableSlots.length" class="text-sm text-red-500 mt-1">
            No available slots for this date and service type
          </p>
        </el-form-item>
        
        <!-- Notes -->
        <el-form-item label="Notes">
          <el-input
            v-model="appointmentForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Add any notes about this appointment"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="newAppointmentDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createAppointment" :loading="submitting">Create Appointment</el-button>
      </template>
    </el-dialog>

    <!-- Edit Appointment Dialog -->
    <el-dialog
      v-model="editAppointmentDialog"
      title="Edit Appointment"
      width="90%"
      max-width="600px"
      class="appointment-dialog"
    >
      <el-form v-if="selectedAppointment" :model="editForm" label-position="top">
        <!-- Service Type -->
        <el-form-item label="Service Type">
          <el-select
            v-model="editForm.serviceType"
            placeholder="Select service type"
            class="w-full"
          >
            <el-option label="Measurement" value="measurement" />
            <el-option label="Fitting" value="fitting" />
            <el-option label="Consultation" value="consultation" />
            <el-option label="Fabric Selection" value="fabric" />
          </el-select>
        </el-form-item>
        
        <!-- Date Selection -->
        <el-form-item label="Date">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="Select date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
            @change="fetchAvailableSlotsForEdit"
          />
        </el-form-item>
        
        <!-- Time Slot Selection -->
        <el-form-item label="Time">
          <el-select
            v-model="editForm.time"
            placeholder="Select time slot"
            class="w-full"
          >
            <el-option
              v-for="(slot, index) in availableSlotsForEdit"
              :key="index"
              :label="`${slot.time} - ${slot.endTime}`"
              :value="slot.time"
            />
          </el-select>
        </el-form-item>
        
        <!-- Status -->
        <el-form-item label="Status">
          <el-select
            v-model="editForm.status"
            placeholder="Select status"
            class="w-full"
          >
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Confirmed" value="confirmed" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <!-- Notes -->
        <el-form-item label="Notes">
          <el-input
            v-model="editForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Add any notes about this appointment"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editAppointmentDialog = false">Cancel</el-button>
        <el-button type="primary" @click="updateAppointment" :loading="submitting">Update Appointment</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  TagIcon, 
  PlusIcon, 
  MoreVerticalIcon,
  EditIcon,
  CheckIcon,
  CheckCircleIcon,
  XIcon
} from 'lucide-vue-next';
import appointmentService from '../../services/appointment.service';
import clientsService from '../../services/clients.service';
import { format, parseISO } from 'date-fns';

// State
const loading = ref(false);
const submitting = ref(false);
const appointments = ref([]);
const clients = ref([]);
const selectedDate = ref('');
const selectedStatus = ref('');
const calendarView = ref('month');
const newAppointmentDialog = ref(false);
const editAppointmentDialog = ref(false);
const selectedAppointment = ref(null);
const availableSlots = ref([]);
const availableSlotsForEdit = ref([]);

// Form state
const appointmentForm = ref({
  clientId: '',
  serviceType: '',
  date: '',
  time: '',
  notes: ''
});

const editForm = ref({
  id: '',
  serviceType: '',
  date: '',
  time: '',
  status: '',
  notes: ''
});

// Fetch appointments with optional filters
const fetchAppointments = async () => {
  loading.value = true;
  try {
    const filters = {};
    
    if (selectedDate.value) {
      filters.date = selectedDate.value;
    }
    
    if (selectedStatus.value) {
      filters.status = selectedStatus.value;
    }
    
    const response = await appointmentService.getAppointments(filters);
    appointments.value = response.data || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    ElMessage.error('Failed to load appointments');
  } finally {
    loading.value = false;
  }
};

// Fetch clients for appointment creation
const fetchClients = async () => {
  try {
    const response = await clientsService.getClients();
    clients.value = response.data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients');
  }
};

// Fetch available time slots
const fetchAvailableSlots = async () => {
  if (!appointmentForm.value.date || !appointmentForm.value.serviceType) {
    availableSlots.value = [];
    return;
  }
  
  try {
    const response = await appointmentService.getAvailableSlots(
      appointmentForm.value.date,
      appointmentForm.value.serviceType
    );
    availableSlots.value = response.data || [];
  } catch (error) {
    console.error('Error fetching available slots:', error);
    ElMessage.error('Failed to load available time slots');
    availableSlots.value = [];
  }
};

// Fetch available time slots for editing
const fetchAvailableSlotsForEdit = async () => {
  if (!editForm.value.date || !editForm.value.serviceType) {
    availableSlotsForEdit.value = [];
    return;
  }
  
  try {
    const response = await appointmentService.getAvailableSlots(
      editForm.value.date,
      editForm.value.serviceType
    );
    
    // Include the current time slot if it's the same date
    if (selectedAppointment.value && 
        editForm.value.date === formatDateForApi(selectedAppointment.value.appointment_time)) {
      const currentTime = formatTime(selectedAppointment.value.appointment_time).split(' ')[0];
      
      // Check if the current time is already in the available slots
      const exists = response.data.some(slot => slot.time === currentTime);
      
      if (!exists) {
        // Calculate end time based on duration
        const duration = selectedAppointment.value.duration || 30;
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        response.data.push({
          time: currentTime,
          endTime: endTime
        });
        
        // Sort the slots by time
        response.data.sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
      }
    }
    
    availableSlotsForEdit.value = response.data || [];
  } catch (error) {
    console.error('Error fetching available slots for edit:', error);
    ElMessage.error('Failed to load available time slots');
    availableSlotsForEdit.value = [];
  }
};

// Show new appointment dialog
const showNewAppointmentDialog = () => {
  // Reset form
  appointmentForm.value = {
    clientId: '',
    serviceType: '',
    date: '',
    time: '',
    notes: ''
  };
  availableSlots.value = [];
  
  // Fetch clients if not already loaded
  if (clients.value.length === 0) {
    fetchClients();
  }
  
  newAppointmentDialog.value = true;
};

// Create a new appointment
const createAppointment = async () => {
  // Validate form
  if (!appointmentForm.value.clientId || 
      !appointmentForm.value.serviceType || 
      !appointmentForm.value.date || 
      !appointmentForm.value.time) {
    ElMessage.warning('Please fill in all required fields');
    return;
  }
  
  submitting.value = true;
  
  try {
    await appointmentService.createAppointment({
      client_id: appointmentForm.value.clientId,
      service_type: appointmentForm.value.serviceType,
      date: appointmentForm.value.date,
      time: appointmentForm.value.time,
      notes: appointmentForm.value.notes
    });
    
    ElMessage.success('Appointment created successfully');
    newAppointmentDialog.value = false;
    fetchAppointments();
  } catch (error) {
    console.error('Error creating appointment:', error);
    ElMessage.error('Failed to create appointment');
  } finally {
    submitting.value = false;
  }
};

// Edit an appointment
const editAppointment = (appointment) => {
  selectedAppointment.value = appointment;
  
  // Extract date and time from appointment_time
  const appointmentDate = formatDateForApi(appointment.appointment_time);
  const appointmentTime = formatTime(appointment.appointment_time).split(' ')[0]; // Get just the time part
  
  editForm.value = {
    id: appointment.id,
    serviceType: appointment.service_type,
    date: appointmentDate,
    time: appointmentTime,
    status: appointment.status,
    notes: appointment.notes || ''
  };
  
  // Fetch available slots for this date
  fetchAvailableSlotsForEdit();
  
  editAppointmentDialog.value = true;
};

// Update an appointment
const updateAppointment = async () => {
  if (!editForm.value.serviceType || !editForm.value.date || !editForm.value.time) {
    ElMessage.warning('Please fill in all required fields');
    return;
  }
  
  submitting.value = true;
  
  try {
    await appointmentService.updateAppointment(editForm.value.id, {
      service_type: editForm.value.serviceType,
      date: editForm.value.date,
      time: editForm.value.time,
      status: editForm.value.status,
      notes: editForm.value.notes
    });
    
    ElMessage.success('Appointment updated successfully');
    editAppointmentDialog.value = false;
    fetchAppointments();
  } catch (error) {
    console.error('Error updating appointment:', error);
    ElMessage.error('Failed to update appointment');
  } finally {
    submitting.value = false;
  }
};

// Confirm an appointment
const confirmAppointment = async (appointment) => {
  try {
    await appointmentService.updateAppointment(appointment.id, {
      status: 'confirmed'
    });
    
    ElMessage.success('Appointment confirmed');
    fetchAppointments();
  } catch (error) {
    console.error('Error confirming appointment:', error);
    ElMessage.error('Failed to confirm appointment');
  }
};

// Complete an appointment
const completeAppointment = async (appointment) => {
  try {
    await appointmentService.updateAppointment(appointment.id, {
      status: 'completed'
    });
    
    ElMessage.success('Appointment marked as completed');
    fetchAppointments();
  } catch (error) {
    console.error('Error completing appointment:', error);
    ElMessage.error('Failed to complete appointment');
  }
};

// Cancel an appointment
const cancelAppointment = async (appointment) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this appointment?',
      'Cancel Appointment',
      {
        confirmButtonText: 'Yes, Cancel It',
        cancelButtonText: 'No, Keep It',
        type: 'warning'
      }
    );
    
    await appointmentService.cancelAppointment(appointment.id);
    
    ElMessage.success('Appointment cancelled');
    fetchAppointments();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error cancelling appointment:', error);
      ElMessage.error('Failed to cancel appointment');
    }
  }
};

// Format date for display
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

// Format time for display
const formatTime = (dateString) => {
  try {
    return format(parseISO(dateString), 'h:mm a');
  } catch (error) {
    return dateString;
  }
};

// Format date for API
const formatDateForApi = (dateString) => {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch (error) {
    return dateString;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.appointments-container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .appointments-container {
    padding: 1.5rem;
  }
}

.appointment-card {
  transition: all 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.calendar-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .el-dialog {
    width: 95% !important;
    margin: 0 auto !important;
  }
  
  .header-section h1 {
    font-size: 1.5rem;
  }
}
</style>
