<template>
  <div class="mobile-feedback-container">
    <!-- Floating Feedback Button (visible only on mobile) -->
    <button 
      v-if="windowWidth <= 768 && !feedbackOpen"
      class="feedback-button"
      @click="openFeedback"
      aria-label="Provide feedback"
    >
      <el-icon><ChatDotRound /></el-icon>
      <span>Feedback</span>
    </button>
    
    <!-- Feedback Panel -->
    <div 
      class="feedback-panel"
      :class="{ 'open': feedbackOpen }"
    >
      <div class="feedback-header">
        <h3 class="text-lg font-medium">How's your experience?</h3>
        <button 
          class="close-button"
          @click="closeFeedback"
          aria-label="Close feedback"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
      
      <div class="feedback-content">
        <template v-if="!feedbackSubmitted">
          <p class="text-sm text-gray-600 mb-4">
            We'd love to hear about your mobile experience with Tailorly.
          </p>
          
          <!-- Rating -->
          <div class="rating-container mb-5">
            <p class="text-sm font-medium mb-3">Rate your experience:</p>
            <div class="flex justify-center gap-3">
              <button 
                v-for="star in 5" 
                :key="star"
                class="star-button"
                :class="{ 'active': feedback.rating >= star }"
                @click="setRating(star)"
              >
                <el-icon><Star /></el-icon>
              </button>
            </div>
          </div>
          
          <!-- Feedback Type -->
          <div class="mb-5">
            <p class="text-sm font-medium mb-3">What are you providing feedback on?</p>
            <el-select 
              v-model="feedback.type" 
              placeholder="Select feedback type"
              class="w-full feedback-select"
              size="large"
              popper-class="feedback-select-dropdown"
            >
              <el-option label="Appointment Booking" value="appointment" />
              <el-option label="Measurement Process" value="measurement" />
              <el-option label="Admin Dashboard" value="admin" />
              <el-option label="General Navigation" value="navigation" />
              <el-option label="Other" value="other" />
            </el-select>
          </div>
          
          <!-- Comments -->
          <div class="mb-5">
            <p class="text-sm font-medium mb-3">Additional comments:</p>
            <el-input
              v-model="feedback.comments"
              type="textarea"
              :rows="4"
              placeholder="Tell us what you think..."
              class="feedback-textarea"
              resize="none"
            />
          </div>
          
          <!-- Submit Button -->
          <el-button 
            type="primary" 
            class="w-full submit-feedback-btn"
            @click="submitFeedback"
            :disabled="!feedback.rating || !feedback.type"
            :loading="submitting"
            size="large"
          >
            Submit Feedback
          </el-button>
        </template>
        
        <!-- Thank You Message -->
        <template v-else>
          <div class="thank-you-container">
            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
            <h4 class="thank-you-title">Thank you for your feedback!</h4>
            <p class="thank-you-message">
              Your input helps us improve the Tailorly experience.
            </p>
            <el-button 
              class="close-feedback-btn"
              @click="closeFeedback"
              size="large"
              round
            >
              Close
            </el-button>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Overlay -->
    <div 
      v-if="feedbackOpen"
      class="feedback-overlay"
      @click="closeFeedback"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ChatDotRound, Close, Star, CircleCheckFilled } from '@element-plus/icons-vue';

// Track window width for responsive behavior
const windowWidth = ref(window.innerWidth);

// Feedback panel state
const feedbackOpen = ref(false);
const feedbackSubmitted = ref(false);
const submitting = ref(false);

// Feedback data
const feedback = reactive({
  rating: 0,
  type: '',
  comments: ''
});

// Set rating
const setRating = (rating) => {
  feedback.rating = rating;
};

// Open feedback panel
const openFeedback = () => {
  feedbackOpen.value = true;
};

// Close feedback panel
const closeFeedback = () => {
  feedbackOpen.value = false;
  
  // Reset if submitted
  if (feedbackSubmitted.value) {
    setTimeout(() => {
      feedbackSubmitted.value = false;
      feedback.rating = 0;
      feedback.type = '';
      feedback.comments = '';
    }, 300);
  }
};

// Submit feedback
const submitFeedback = async () => {
  if (!feedback.rating || !feedback.type) return;
  
  submitting.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log feedback to console (in real app, this would be sent to a server)
    console.log('Feedback submitted:', feedback);
    
    // Show thank you message
    feedbackSubmitted.value = true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
  } finally {
    submitting.value = false;
  }
};

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.mobile-feedback-container {
  position: relative;
  z-index: 1000;
}

.feedback-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #2C3E50;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  z-index: 1001;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feedback-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.feedback-panel {
  position: fixed;
  bottom: -100%;
  left: 0;
  right: 0;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transition: bottom 0.3s ease;
  z-index: 1002;
  max-height: 85vh;
  overflow-y: auto;
}

.feedback-panel.open {
  bottom: 0;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  background-color: #f9f9f9;
}

.feedback-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  padding: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -8px;
}

.close-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.feedback-content {
  padding: 24px 20px;
}

.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.rating-container {
  text-align: center;
}

.star-button {
  background: none;
  border: none;
  color: #d1d5db;
  font-size: 32px;
  cursor: pointer;
  transition: color 0.2s, transform 0.1s;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.star-button:active {
  transform: scale(0.9);
}

.star-button.active {
  color: #f59e0b;
}

/* Form styling */
.feedback-select :deep(.el-input__wrapper) {
  padding: 0 12px;
  height: 48px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
  border-radius: 10px !important;
}

.feedback-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

.feedback-textarea :deep(.el-textarea__inner) {
  padding: 12px;
  border-radius: 10px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05) !important;
}

.feedback-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

/* Submit button */
.submit-feedback-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 8px;
}

/* Thank you message styling */
.thank-you-container {
  text-align: center;
  padding: 16px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon {
  font-size: 64px;
  color: #10b981;
  margin-bottom: 20px;
}

.thank-you-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.thank-you-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.close-feedback-btn {
  min-width: 120px;
  height: 48px;
  font-size: 16px;
}

/* Desktop styles */
@media (min-width: 769px) {
  .feedback-panel {
    width: 400px;
    left: auto;
    right: 20px;
    bottom: -100%;
    border-radius: 8px;
    max-height: 500px;
  }
}
</style>
