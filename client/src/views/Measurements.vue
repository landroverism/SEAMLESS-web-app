<template>
  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-[#1A237E] bg-clip-text text-transparent drop-shadow-sm">Take Your Measurements</h1>
      <p class="text-xl text-accent font-medium">Follow our step-by-step guide for accurate measurements</p>
    </div>

    <el-steps :active="activeStep" finish-status="success" class="mb-8">
      <el-step v-for="step in steps" :key="step.label" :title="step.label" />
    </el-steps>

    <!-- Desktop success alert -->
    <div v-if="measurementsSaved && windowWidth > 768" class="mb-8">
      <el-alert
        type="success"
        show-icon
        :closable="false"
      >
        <template #title>
          Your measurements have been saved successfully!
        </template>
        <template #default>
          <el-button 
            class="mt-2"
            @click="resetMeasurements"
            :icon="RefreshCw"
          >
            Start New Measurements
          </el-button>
        </template>
      </el-alert>
    </div>
    
    <!-- Mobile notification for success -->
    <mobile-notification
      v-if="showMobileNotification"
      title="Measurements Saved!"
      message="Your measurements have been saved successfully"
      type="success"
      action-text="New Measurements"
      :duration="5000"
      @close="showMobileNotification = false"
      @action="resetMeasurements"
    />

    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-6 md:mb-0">
        <el-card class="measurement-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-[#1A237E]">{{ currentStep.label }}</span>
              <el-tooltip
                :content="showTips ? 'Hide Tips' : 'Show Tips'"
                placement="top"
              >
                <el-button 
                  :icon="HelpCircle"
                  circle
                  @click="showTips = !showTips"
                />
              </el-tooltip>
            </div>
          </template>

          <p class="text-text-muted font-medium mb-4 text-base">{{ currentStep.instructions }}</p>

          <el-collapse-transition>
            <div v-show="showTips" class="tips-section">
              <div class="border-l-4 border-accent p-4 bg-accent/5 mb-4 rounded-r-md shadow-sm">
                <h4 class="font-semibold mb-2 text-[#1A237E]">Measurement Tips:</h4>
                <ul class="list-disc list-inside space-y-2">
                  <li v-for="tip in currentStep.tips" :key="tip" class="text-text-muted font-medium">{{ tip }}</li>
                </ul>
              </div>
            </div>
          </el-collapse-transition>

          <el-form-item 
            :error="measurementError"
            class="mb-0"
          >
            <el-input-number
              v-model="measurements[currentStep.label]"
              :min="currentStep.minValue"
              :max="currentStep.maxValue"
              :step="0.5"
              size="large"
              class="w-full"
              :placeholder="`Enter ${currentStep.label.toLowerCase()} measurement`"
            >
              <template #append>{{ currentStep.unit }}</template>
            </el-input-number>
          </el-form-item>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card>
          <template #header>
            <div class="text-lg font-semibold">Video Tutorial</div>
          </template>

          <div class="aspect-video rounded-lg mb-4 overflow-hidden border border-gray-200 shadow-sm">
            <video 
              :src="currentStep.videoUrl" 
              controls 
              class="w-full h-full"
              preload="metadata"
              :id="`video-${currentStep.label.toLowerCase()}`"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p class="text-sm text-gray-500 mb-2">{{ currentStep.videoTitle }}</p>

          <div class="flex justify-between mt-4">
            <el-button 
              :icon="ArrowLeft"
              @click="previousStep"
              :disabled="activeStep === 0"
            >
              Back
            </el-button>

            <el-button 
              v-if="isLastStep"
              type="primary"
              :icon="Save"
              :loading="saving"
              @click="saveMeasurements"
              :disabled="!isCurrentStepValid"
            >
              Save Measurements
            </el-button>
            <el-button 
              v-else
              type="primary"
              @click="nextStep"
              :disabled="!isCurrentStepValid"
            >
              Next
              <el-icon class="el-icon--right"><arrow-right /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { HelpCircle, RefreshCw, ArrowLeft, ArrowRight, Save } from 'lucide-vue-next'
import MobileNotification from '../components/MobileNotification.vue'
import type { Component } from 'vue'

interface Step {
  label: string
  instructions: string
  videoUrl: string
  videoTitle: string
  tips: string[]
  minValue: number
  maxValue: number
  unit: string
}

const steps: Step[] = [
  {
    label: 'Chest',
    instructions: 'Measure around the fullest part of your chest, keeping the tape parallel to the ground.',
    videoUrl: '/videos/Chest Measurement.mp4',
    videoTitle: 'How to Measure Your Chest',
    tips: [
      'Take a deep breath and measure',
      'Keep the tape snug but not tight',
      'Make sure the tape is level around your body'
    ],
    minValue: 30,
    maxValue: 60,
    unit: 'inches'
  },
  {
    label: 'Waist',
    instructions: 'Measure around your natural waistline, keeping the tape comfortably loose.',
    videoUrl: '/videos/How to Measure Your Waist _ Tux Rental Measuring Made Easy.mp4',
    videoTitle: 'How to Measure Your Waist - Tux Rental Measuring Made Easy',
    tips: [
      'Locate your natural waistline',
      'Keep one finger between the tape and your body',
      'Avoid measuring over thick clothing'
    ],
    minValue: 24,
    maxValue: 50,
    unit: 'inches'
  },
  {
    label: 'Shoulders',
    instructions: 'Measure across the back from shoulder point to shoulder point.',
    videoUrl: '/videos/How to Measure Your Shoulders - Fittery.mp4',
    videoTitle: 'How to Measure Your Shoulders',
    tips: [
      'Stand naturally with arms at sides',
      'Measure from the outer edges of each shoulder',
      'Keep the tape straight across the back'
    ],
    minValue: 14,
    maxValue: 30,
    unit: 'inches'
  }
]

// Track window width for responsive layout
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

const activeStep = ref(0)
const showTips = ref(false)
const measurements = ref<Record<string, number>>({})
const saving = ref(false)
const measurementsSaved = ref(false)
const showMobileNotification = ref(false)

const currentStep = computed(() => steps[activeStep.value])
const isLastStep = computed(() => activeStep.value === steps.length - 1)

const measurementError = computed(() => {
  const value = measurements.value[currentStep.value.label]
  if (value === undefined) return ''
  if (value < currentStep.value.minValue || value > currentStep.value.maxValue) {
    return `Please enter a value between ${currentStep.value.minValue} and ${currentStep.value.maxValue} ${currentStep.value.unit}`
  }
  return ''
})

const isCurrentStepValid = computed(() => {
  const value = measurements.value[currentStep.value.label]
  return value !== undefined && !measurementError.value
})

const nextStep = () => {
  if (activeStep.value < steps.length - 1) {
    // Pause current video
    const currentVideo = document.getElementById(`video-${currentStep.value.label.toLowerCase()}`) as HTMLVideoElement
    if (currentVideo) {
      currentVideo.pause()
    }
    
    activeStep.value++
    showTips.value = false
    
    // Reset scroll position for mobile
    if (windowWidth.value <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const previousStep = () => {
  if (activeStep.value > 0) {
    // Pause current video
    const currentVideo = document.getElementById(`video-${currentStep.value.label.toLowerCase()}`) as HTMLVideoElement
    if (currentVideo) {
      currentVideo.pause()
    }
    
    activeStep.value--
    showTips.value = false
    
    // Reset scroll position for mobile
    if (windowWidth.value <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const saveMeasurements = async () => {
  saving.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  measurementsSaved.value = true
  
  // Show mobile notification on small screens
  if (windowWidth.value <= 768) {
    showMobileNotification.value = true
  }
  
  saving.value = false
}

const resetMeasurements = () => {
  measurements.value = {}
  activeStep.value = 0
  measurementsSaved.value = false
  showTips.value = false
}
</script>

<style scoped>
.measurement-card {
  height: 100%;
}

.tips-section {
  margin: -8px -20px 16px;
  padding: 0 20px;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .el-card {
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.5rem;
  }
  
  .el-input-number {
    width: 100% !important;
    height: 3rem !important;
  }
  
  .el-button {
    height: 2.75rem;
    padding: 0 1.25rem;
    font-size: 1rem;
  }
  
  video {
    border-radius: 0.375rem;
  }
}
</style>