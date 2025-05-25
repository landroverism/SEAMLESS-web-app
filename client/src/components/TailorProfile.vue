<template>
  <div>
    <!-- Tailor Profile Button -->
    <el-button 
      type="info" 
      @click="openProfileDialog"
      class="profile-button"
    >
      <el-icon class="mr-2"><User /></el-icon>
      View Profile
    </el-button>
    
    <!-- Tailor Profile Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="tailor.name"
      class="profile-dialog modern-dialog"
      width="92%"
      :fullscreen="false"
      top="5vh"
      append-to-body
      destroy-on-close
    >
      <div class="profile-content">
        <!-- Tailor Image -->
        <div class="tailor-image-container">
          <img :src="tailor.image || '/images/default-profile.jpg'" :alt="tailor.name" class="tailor-image" />
        </div>
        
        <!-- Tailor Info -->
        <div class="tailor-info">
          <h2 class="tailor-name">{{ tailor.name }}</h2>
          
          <!-- Specialization Tags -->
          <div class="specialization-tags">
            <el-tag 
              v-for="(specialty, index) in tailor.specialties" 
              :key="index"
              class="specialty-tag"
            >
              {{ specialty }}
            </el-tag>
          </div>
          
          <!-- Experience -->
          <div class="info-section">
            <h3 class="section-title">Experience</h3>
            <p class="experience-text">{{ tailor.experience }} years of professional experience</p>
          </div>
          
          <!-- About -->
          <div class="info-section">
            <h3 class="section-title">About</h3>
            <p class="about-text">{{ tailor.bio }}</p>
          </div>
          
          <!-- Services -->
          <div class="info-section">
            <h3 class="section-title">Services</h3>
            <ul class="services-list">
              <li v-for="(service, index) in tailor.services" :key="index" class="service-item">
                {{ service.name }} - {{ formatPrice(service.price) }}
              </li>
            </ul>
          </div>
          
          <!-- Ratings -->
          <div class="info-section">
            <h3 class="section-title">Ratings</h3>
            <div class="rating-container">
              <el-rate
                v-model="tailor.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
              <span class="review-count">({{ tailor.reviewCount }} reviews)</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            @click="dialogVisible = false" 
            class="close-btn"
            size="large"
          >
            Close
          </el-button>
          <el-button 
            type="primary" 
            @click="bookAppointment" 
            class="book-btn"
            size="large"
          >
            Book Appointment
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { User } from '@element-plus/icons-vue';

// Props
const props = defineProps({
  tailor: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      image: '',
      specialties: [],
      experience: 0,
      bio: '',
      services: [],
      rating: 0,
      reviewCount: 0
    })
  }
});

// Emits
const emit = defineEmits(['book-appointment']);

// Reactive state
const dialogVisible = ref(false);
const windowWidth = ref(window.innerWidth);

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

// Open profile dialog
const openProfileDialog = () => {
  dialogVisible.value = true;
};

// Book appointment
const bookAppointment = () => {
  dialogVisible.value = false;
  emit('book-appointment', props.tailor);
};

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};
</script>

<style scoped>
/* Enhanced styles for tailor profile */
.profile-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
}

/* Dialog improvements for mobile */
.modern-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  margin: 0 auto !important;
  width: 92% !important;
  max-width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modern-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 16px;
  margin-right: 0;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.modern-dialog :deep(.el-dialog__headerbtn) {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  font-size: 20px;
}

.modern-dialog :deep(.el-dialog__title) {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-right: 20px;
}

.modern-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
  background-color: #fff;
}

.modern-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

/* Profile content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 4px;
}

.tailor-image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.tailor-image {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tailor-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tailor-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: #333;
}

.specialization-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 4px 0 8px;
}

.specialty-tag {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 16px;
  margin: 4px;
}

.info-section {
  margin-top: 6px;
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

.experience-text,
.about-text {
  margin: 0;
  line-height: 1.6;
  color: #555;
  font-size: 15px;
}

.services-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.service-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  color: #555;
  font-size: 15px;
}

.service-item:last-child {
  border-bottom: none;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  color: #999;
  font-size: 14px;
}

/* Footer buttons */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.close-btn,
.book-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  border-radius: 10px;
  padding: 0 20px;
}

.close-btn {
  border: 1px solid #dcdfe6;
}

.book-btn {
  font-weight: 600;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .profile-content {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .tailor-image-container {
    width: 30%;
  }
  
  .tailor-info {
    width: 70%;
  }
  
  .tailor-name {
    text-align: left;
  }
  
  .specialization-tags {
    justify-content: flex-start;
  }
}
</style>
