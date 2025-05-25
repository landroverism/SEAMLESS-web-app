<template>
  <div class="measurement-tabs">
    <!-- Mobile View Selector (visible only on small screens) -->
    <div class="mobile-tab-selector md:hidden mb-4">
      <el-select v-model="activeTabMobile" class="w-full" @change="handleMobileTabChange">
        <el-option label="Upper Body Measurements" value="upper" />
        <el-option label="Lower Body Measurements" value="lower" />
      </el-select>
    </div>
    
    <!-- Desktop Tabs (hidden on mobile) -->
    <el-tabs type="border-card" v-model="activeTab" class="hidden md:block">
      <el-tab-pane label="Upper Body">
        <!-- Video tutorial with responsive container -->
        <div class="video-container mb-4">
          <iframe 
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
        
        <!-- Mobile-friendly measurement sections -->
        <div 
          v-for="section in upperBodySections" 
          :key="section.id"
          class="measurement-section"
        >
          <div 
            class="measurement-section-header" 
            @click="toggleSection(section.id)"
          >
            <h3 class="text-md font-medium">{{ section.title }}</h3>
            <el-icon>
              <arrow-down v-if="!expandedSections[section.id]" />
              <arrow-up v-else />
            </el-icon>
          </div>
          <div v-show="expandedSections[section.id]" class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <el-form-item 
                v-for="field in section.fields" 
                :key="field.id" 
                :label="field.label"
              >
                <el-input-number 
                  v-model="measurements[field.id]" 
                  :min="0" 
                  class="measurement-input mobile-full-width" 
                  :precision="1"
                  :step="0.5"
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="Lower Body">
        <!-- Video tutorial with responsive container -->
        <div class="video-container mb-4">
          <iframe 
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
        
        <!-- Mobile-friendly measurement sections -->
        <div 
          v-for="section in lowerBodySections" 
          :key="section.id"
          class="measurement-section"
        >
          <div 
            class="measurement-section-header" 
            @click="toggleSection(section.id)"
          >
            <h3 class="text-md font-medium">{{ section.title }}</h3>
            <el-icon>
              <arrow-down v-if="!expandedSections[section.id]" />
              <arrow-up v-else />
            </el-icon>
          </div>
          <div v-show="expandedSections[section.id]" class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <el-form-item 
                v-for="field in section.fields" 
                :key="field.id" 
                :label="field.label"
              >
                <el-input-number 
                  v-model="measurements[field.id]" 
                  :min="0" 
                  class="measurement-input mobile-full-width" 
                  :precision="1"
                  :step="0.5"
                />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

// Active tab tracking
const activeTab = ref('upper');
const activeTabMobile = ref('upper');

// Track which sections are expanded
const expandedSections = reactive({});

// Handle mobile tab change
const handleMobileTabChange = (value) => {
  activeTab.value = value;
};

// Watch for desktop tab changes to sync with mobile
watch(activeTab, (newValue) => {
  activeTabMobile.value = newValue;
});

// Track window width for responsive adjustments
const windowWidth = ref(window.innerWidth);

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // Expand first section by default on mobile
  if (windowWidth.value <= 768) {
    if (upperBodySections.length > 0) {
      expandedSections[upperBodySections[0].id] = true;
    }
    if (lowerBodySections.length > 0) {
      expandedSections[lowerBodySections[0].id] = true;
    }
  }
});


// Toggle section expansion
const toggleSection = (sectionId) => {
  expandedSections[sectionId] = !expandedSections[sectionId];
};

// Measurement data
const measurements = reactive({});

// Upper body measurement sections
const upperBodySections = [
  {
    id: 'chest',
    title: 'Chest Measurements',
    fields: [
      { id: 'chestWidth', label: 'Chest Width' },
      { id: 'chestCircumference', label: 'Chest Circumference' },
      { id: 'bustPoint', label: 'Bust Point' }
    ]
  },
  {
    id: 'shoulders',
    title: 'Shoulder Measurements',
    fields: [
      { id: 'shoulderWidth', label: 'Shoulder Width' },
      { id: 'shoulderSlope', label: 'Shoulder Slope' },
      { id: 'acrossBack', label: 'Across Back' }
    ]
  },
  {
    id: 'sleeves',
    title: 'Sleeve Measurements',
    fields: [
      { id: 'sleeveLength', label: 'Sleeve Length' },
      { id: 'bicepCircumference', label: 'Bicep Circumference' },
      { id: 'wristCircumference', label: 'Wrist Circumference' }
    ]
  }
];

// Lower body measurement sections
const lowerBodySections = [
  {
    id: 'waist',
    title: 'Waist Measurements',
    fields: [
      { id: 'waistCircumference', label: 'Waist Circumference' },
      { id: 'naturalWaist', label: 'Natural Waist' }
    ]
  },
  {
    id: 'hips',
    title: 'Hip Measurements',
    fields: [
      { id: 'hipCircumference', label: 'Hip Circumference' },
      { id: 'hipDepth', label: 'Hip Depth' }
    ]
  },
  {
    id: 'legs',
    title: 'Leg Measurements',
    fields: [
      { id: 'inseam', label: 'Inseam' },
      { id: 'outseam', label: 'Outseam' },
      { id: 'thighCircumference', label: 'Thigh Circumference' },
      { id: 'kneeCircumference', label: 'Knee Circumference' },
      { id: 'calfCircumference', label: 'Calf Circumference' },
      { id: 'ankleCircumference', label: 'Ankle Circumference' }
    ]
  }
];

// Initialize first section of each tab to be expanded by default
upperBodySections.forEach((section, index) => {
  expandedSections[section.id] = index === 0;
});

lowerBodySections.forEach((section, index) => {
  expandedSections[section.id] = index === 0;
});
</script>

<style scoped>
.measurement-tabs {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 8px 24px 8px;
}

.mobile-tab-selector {
  margin-bottom: 20px;
}

.el-select.w-full {
  width: 100% !important;
  font-size: 1.1rem;
  border-radius: 10px;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  margin-bottom: 20px;
}

.video-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.measurement-section {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 18px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.measurement-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: #f9f9f9;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.measurement-section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.measurement-input {
  width: 100%;
  border-radius: 8px;
  font-size: 1.1rem;
  padding: 10px;
}

.el-form-item {
  margin-bottom: 16px !important;
}

@media (max-width: 768px) {
  .measurement-tabs {
    padding: 0 2vw 24px 2vw;
  }
  .measurement-section {
    margin-bottom: 14px;
  }
  .measurement-section-header {
    padding: 16px 10px;
    font-size: 1rem;
  }
  .el-form-item {
    margin-bottom: 12px !important;
  }
}
</style>
