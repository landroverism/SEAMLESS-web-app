<template>
  <div class="container mx-auto px-4 py-12">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#D4AF37] to-[#E5C158] bg-clip-text text-transparent drop-shadow-sm">
        Custom Tailoring, Simplified
      </h1>
      <p class="text-xl text-[#C4C4C4] font-medium mb-8 max-w-2xl mx-auto">
        Get perfectly fitted garments from expert tailors, all from the comfort of your home
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <el-button class="!bg-[#D4AF37] !border-[#D4AF37] hover:!bg-[#E5C158] hover:!border-[#E5C158] !text-[#1C1B1F] shadow-md" size="large">
          Get Started
        </el-button>
        <el-button class="!border-[#D4AF37] !text-[#D4AF37] hover:!bg-[#D4AF37] hover:!text-[#1C1B1F] shadow-md" size="large">
          Learn More
        </el-button>
      </div>
    </div>

    <el-row :gutter="24" class="features">
      <el-col 
        v-for="feature in features" 
        :key="feature.title"
        :xs="24"
        :sm="24"
        :md="8"
      >
        <el-card 
          class="feature-card h-full shadow-md hover:shadow-lg transition-shadow duration-300 !bg-[#252429] !border-[#3D3A42]"
          :body-style="{ padding: '2rem' }"
        >
          <div class="text-center">
            <component 
              :is="feature.icon" 
              class="text-[#D4AF37] mb-4"
              :size="32"
            />
            <h3 class="text-xl font-bold mb-2 text-[#D4AF37]">{{ feature.title }}</h3>
            <p class="text-[#FFFFFF] font-medium">{{ feature.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { RulerIcon, UsersIcon, ClockIcon } from 'lucide-vue-next'

const features = [
  {
    icon: RulerIcon,
    title: 'Easy Measurements',
    description: 'Follow our guided measurement process with video tutorials'
  },
  {
    icon: UsersIcon,
    title: 'Expert Tailors',
    description: 'Connect with skilled tailors and view their portfolios'
  },
  {
    icon: ClockIcon,
    title: 'Quick Turnaround',
    description: 'Get your custom garments delivered within 2-3 weeks'
  }
]
</script>

<style scoped>
.feature-card {
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}
</style>