<template>
  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4 text-[#2C3E50]">Our Expert Tailors</h1>
      <p class="text-xl text-gray-600">Connect with skilled professionals for your custom garments</p>
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
            <h3 class="text-xl font-bold mb-2">{{ tailor.name }}</h3>
            
            <el-tag 
              type="success"
              class="mb-3"
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
              <span class="text-sm text-gray-600">({{ tailor.rating }})</span>
            </div>

            <p class="text-gray-600 mb-4">{{ tailor.experience }} of experience</p>

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
      width="50%"
    >
      <div v-if="selectedTailor">
        <div class="flex items-start gap-6">
          <el-image
            :src="selectedTailor.image"
            class="w-32 h-32 rounded-lg object-cover"
          />
          <div>
            <h3 class="text-2xl font-bold mb-2">{{ selectedTailor.name }}</h3>
            <el-tag type="success" class="mb-3">{{ selectedTailor.specialty }}</el-tag>
            <p class="text-gray-600">{{ selectedTailor.experience }} of experience</p>
          </div>
        </div>

        <div class="mt-6">
          <h4 class="font-bold mb-2">About</h4>
          <p class="text-gray-600">
            Professional tailor specializing in {{ selectedTailor.specialty.toLowerCase() }} with extensive experience in creating custom-fitted garments.
          </p>
        </div>

        <div class="mt-6">
          <h4 class="font-bold mb-2">Services</h4>
          <el-tag 
            v-for="service in services"
            :key="service"
            class="mr-2 mb-2"
          >
            {{ service }}
          </el-tag>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showProfileDialog = false">Close</el-button>
        <el-button type="primary" @click="bookAppointment(selectedTailor)">
          Book Appointment
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showBookingDialog"
      title="Book Appointment"
      width="40%"
    >
      <el-form :model="bookingForm" label-position="top">
        <el-form-item label="Date">
          <el-date-picker
            v-model="bookingForm.date"
            type="date"
            placeholder="Select date"
            :disabled-date="disabledDate"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="Time">
          <el-time-select
            v-model="bookingForm.time"
            start="09:00"
            step="00:30"
            end="18:00"
            placeholder="Select time"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="Service Type">
          <el-select v-model="bookingForm.service" placeholder="Select service" class="w-full">
            <el-option
              v-for="service in services"
              :key="service"
              :label="service"
              :value="service"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes">
          <el-input
            v-model="bookingForm.notes"
            type="textarea"
            rows="3"
            placeholder="Any special requirements or preferences?"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showBookingDialog = false">Cancel</el-button>
        <el-button 
          type="primary" 
          :loading="booking"
          @click="confirmBooking"
        >
          Confirm Booking
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
</style>