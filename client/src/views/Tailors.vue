<template>
  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-[#1A237E] bg-clip-text text-transparent drop-shadow-sm">Our Expert Tailors</h1>
      <p class="text-xl text-accent font-medium">Connect with skilled professionals for your custom garments</p>
    </div>

    <el-row :gutter="24">
      <el-col 
        v-for="tailor in tailors"
        :key="tailor.id"
        :xs="24"
        :sm="12"
        :md="8"
        class="mb-6"
      >
        <el-card 
          class="tailor-card h-full"
          :body-style="{ padding: 0 }"
        >
          <el-image
            :src="tailor.image"
            fit="cover"
            class="w-full h-48 object-cover"
          >
            <template #error>
              <div class="h-48 bg-gray-200 flex items-center justify-center">
                <user-icon :size="48" class="text-gray-400" />
              </div>
            </template>
          </el-image>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-2 text-[#1A237E]">{{ tailor.name }}</h3>
            
            <el-tag 
              class="mb-3 !bg-accent/10 !text-accent !border-accent/20"
              effect="plain"
            >
              {{ tailor.specialty }}
            </el-tag>

            <div class="flex items-center gap-2 mb-3">
              <el-rate
                v-model="tailor.rating"
                disabled
                :max="5"
                :colors="['#2ecc71', '#2ecc71', '#2ecc71']"
              />
              <span class="text-sm text-accent font-medium">({{ tailor.rating }})</span>
            </div>

            <p class="text-text-muted font-medium mb-4">{{ tailor.experience }} of experience</p>

            <div class="space-y-3">
              <el-button 
                type="primary" 
                class="w-full"
                @click="viewProfile(tailor)"
              >
                View Profile
              </el-button>
              <el-button 
                class="w-full"
                @click="bookAppointment(tailor)"
              >
                Book Appointment
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showProfileDialog"
      title="Tailor Profile"
      :width="windowWidth <= 768 ? '92%' : '500px'"
      class="mobile-friendly-dialog"
      append-to-body
      destroy-on-close
    >
      <div v-if="selectedTailor" class="profile-content">
        <div class="profile-header">
          <el-image
            :src="selectedTailor.image"
            class="tailor-profile-image"
          />
          <div class="tailor-info">
            <h3 class="tailor-name">{{ selectedTailor.name }}</h3>
            <el-tag type="success" class="specialty-tag">{{ selectedTailor.specialty }}</el-tag>
            <p class="experience-text">{{ selectedTailor.experience }} of experience</p>
          </div>
        </div>

        <div class="info-section">
          <h4 class="section-title">About</h4>
          <p class="section-text">
            Professional tailor specializing in {{ selectedTailor.specialty.toLowerCase() }} with extensive experience in creating custom-fitted garments.
          </p>
        </div>

        <div class="info-section">
          <h4 class="section-title">Services</h4>
          <div class="services-tags">
            <el-tag 
              v-for="service in services"
              :key="service"
              class="service-tag"
            >
              {{ service }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="mobile-dialog-footer">
          <el-button 
            @click="showProfileDialog = false" 
            class="cancel-btn"
            size="large"
            plain
          >
            Close
          </el-button>
          <el-button 
            type="primary" 
            @click="bookAppointment(selectedTailor)"
            class="confirm-btn"
            size="large"
          >
            Book Appointment
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showBookingDialog"
      title="Book Appointment"
      :width="windowWidth <= 768 ? '92%' : '450px'"
      class="mobile-friendly-dialog"
      append-to-body
      destroy-on-close
    >
      <el-form :model="bookingForm" label-position="top">
        <el-form-item label="Date" class="mb-5">
          <el-date-picker
            v-model="bookingForm.date"
            type="date"
            placeholder="Select date"
            :disabled-date="disabledDate"
            class="w-full mobile-input"
            size="large"
            style="height: 48px;"
          />
        </el-form-item>
        <el-form-item label="Time" class="mb-5">
          <el-time-select
            v-model="bookingForm.time"
            start="09:00"
            step="00:30"
            end="18:00"
            placeholder="Select time"
            class="w-full mobile-input"
            size="large"
            style="height: 48px;"
          />
        </el-form-item>
        <el-form-item label="Service Type" class="mb-5">
          <el-select 
            v-model="bookingForm.service" 
            placeholder="Select service" 
            class="w-full mobile-input"
            size="large"
            style="height: 48px;"
          >
            <el-option
              v-for="service in services"
              :key="service"
              :label="service"
              :value="service"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes" class="mb-5">
          <el-input
            v-model="bookingForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Any special requirements or preferences?"
            class="mobile-textarea"
            resize="none"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="mobile-dialog-footer">
          <el-button 
            @click="showBookingDialog = false" 
            class="cancel-btn"
            size="large"
            plain
          >
            Cancel
          </el-button>
          <el-button 
            type="primary" 
            :loading="booking"
            @click="confirmBooking"
            class="confirm-btn"
            size="large"
          >
            Confirm Booking
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UserIcon } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'

interface Tailor {
  id: number
  name: string
  specialty: string
  rating: number
  experience: string
  image: string
}

const tailors: Tailor[] = [
  {
    id: 1,
    name: 'Kelly Kevin',
    specialty: 'Formal Wear',
    rating: 4.8,
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Ham Kemboi',
    specialty: 'Suits & Blazers',
    rating: 4.9,
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Cecilia Gatimu',
    specialty: 'Wedding Dresses',
    rating: 5.0,
    experience: '20 years',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'
  }
]

const services = [
  'Custom Suits',
  'Wedding Dresses',
  'Alterations',
  'Formal Wear',
  'Business Attire',
  'Evening Gowns'
]

const showProfileDialog = ref(false)
const showBookingDialog = ref(false)
const selectedTailor = ref<Tailor | null>(null)
const booking = ref(false)

// Track window width for responsive behavior
const windowWidth = ref(window.innerWidth)

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const bookingForm = ref({
  date: '',
  time: '',
  service: '',
  notes: ''
})

const viewProfile = (tailor: Tailor) => {
  selectedTailor.value = tailor
  showProfileDialog.value = true
}

const bookAppointment = (tailor: Tailor | null) => {
  if (tailor) {
    selectedTailor.value = tailor
    showProfileDialog.value = false
    showBookingDialog.value = true
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const confirmBooking = async () => {
  booking.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  ElMessage({
    type: 'success',
    message: 'Appointment booked successfully!',
    duration: 3000
  })
  
  showBookingDialog.value = false
  booking.value = false
  bookingForm.value = {
    date: '',
    time: '',
    service: '',
    notes: ''
  }
}
</script>

<style scoped>
.tailor-card {
  transition: transform 0.3s ease;
}

.tailor-card:hover {
  transform: translateY(-5px);
}

/* Tailor profile styles */
.profile-content {
  padding: 0 4px;
}

.profile-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.tailor-profile-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tailor-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tailor-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.specialty-tag {
  margin-bottom: 12px;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 16px;
}

.experience-text {
  color: #666;
  margin: 0;
  font-size: 15px;
}

.info-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.section-text {
  margin: 0;
  line-height: 1.6;
  color: #555;
  font-size: 15px;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-tag {
  margin: 4px;
  font-size: 14px;
  border-radius: 16px;
  padding: 6px 12px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .tailor-info {
    align-items: center;
  }
}

/* Mobile-friendly dialog styles */
.mobile-friendly-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  margin: 0 auto !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.mobile-friendly-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 16px;
  margin-right: 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.mobile-friendly-dialog :deep(.el-dialog__headerbtn) {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  font-size: 20px;
}

.mobile-friendly-dialog :deep(.el-dialog__title) {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-right: 20px;
}

.mobile-friendly-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
  background-color: #fff;
}

.mobile-friendly-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

/* Form input enhancements */
.mobile-input :deep(.el-input__wrapper),
.mobile-textarea :deep(.el-textarea__inner) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
  border-radius: 10px !important;
  padding: 4px 12px !important;
}

.mobile-input :deep(.el-input__wrapper.is-focus),
.mobile-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

/* Footer buttons */
.mobile-dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  border-radius: 10px;
  padding: 0 20px;
}

.confirm-btn {
  font-weight: 600;
}

@media (max-width: 768px) {
  .mobile-friendly-dialog :deep(.el-dialog) {
    width: 92% !important;
    max-width: 92% !important;
  }
  
  .mobile-dialog-footer {
    flex-direction: column;
  }
  
  .cancel-btn,
  .confirm-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>