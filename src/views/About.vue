<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-16 relative overflow-hidden rounded-2xl">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-80"></div>
        <el-image
          src="https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?auto=format&fit=crop&q=80"
          fit="cover"
          class="w-full h-[400px] object-cover"
          :preview-src-list="[]"
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            About Seamless
          </h1>
          <p class="text-xl max-w-2xl">
            Revolutionizing the tailoring industry through technology and craftsmanship
          </p>
        </div>
      </div>

      <!-- Story Section -->
      <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div class="order-2 md:order-1">
          <h2 class="text-2xl font-bold mb-4 text-primary">Our Story</h2>
          <p class="text-gray-600 mb-4">
            Founded in 2023, Seamless emerged from a simple yet powerful idea: to bridge the gap between skilled tailors and customers seeking perfect-fitting garments.
          </p>
          <p class="text-gray-600 mb-4">
            We believe that everyone deserves clothing that fits perfectly and makes them feel confident. Our platform combines traditional tailoring expertise with modern technology to make custom clothing accessible to all.
          </p>
          <div class="flex gap-4 mt-6">
            <el-button 
              type="primary"
              class="get-started-btn"
              @click="$router.push('/register')"
            >
              Join Our Journey
              <arrow-right-icon class="ml-2" :size="16" />
            </el-button>
            <el-button plain>Contact Us</el-button>
          </div>
        </div>
        <div class="order-1 md:order-2 relative group">
          <el-image
            src="https://plus.unsplash.com/premium_photo-1675799887840-98178eff888d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a25pdHRpbmd8ZW58MHx8MHx8fDA%3D"
            fit="cover"
            class="rounded-lg shadow-lg w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
            :preview-src-list="[]"
          />
          <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg"></div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div 
          v-for="(value, index) in values" 
          :key="value.title" 
          class="feature-card p-6 rounded-lg text-center transform hover:-translate-y-2 transition-all duration-300"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <component 
            :is="value.icon" 
            class="text-accent mx-auto mb-4 transform transition-transform duration-300 hover:scale-110"
            :size="32"
          />
          <h3 class="text-xl font-bold mb-2 text-primary">{{ value.title }}</h3>
          <p class="text-gray-600">{{ value.description }}</p>
        </div>
      </div>

      <!-- Mission Section -->
      <div class="bg-secondary rounded-lg p-8 md:p-12 relative overflow-hidden">
        <div class="absolute inset-0 bg-pattern opacity-5"></div>
        <h2 class="text-2xl font-bold mb-6 text-center text-primary relative z-10">Our Mission</h2>
        <div class="grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <p class="text-gray-600 mb-4">
              At Seamless, we're on a mission to revolutionize the tailoring industry by:
            </p>
            <ul class="space-y-4">
              <li 
                v-for="(point, index) in missionPoints" 
                :key="index" 
                class="flex items-start gap-3 transform hover:translate-x-2 transition-transform duration-300"
              >
                <check-circle-icon class="text-accent mt-1" :size="20" />
                <span class="text-gray-600">{{ point }}</span>
              </li>
            </ul>
          </div>
          <div class="relative group">
            <el-image
              src="https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBwZW9wbGUlMjBob2xkaW5nJTIwaGFuZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww"
              fit="cover"
              class="rounded-lg shadow-lg w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
              :preview-src-list="[]"
            />
            <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold mb-8 text-center text-primary">Meet Our Team</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="member in teamMembers" 
            :key="member.name"
            class="text-center group"
          >
            <div class="relative mb-4 rounded-full overflow-hidden w-48 h-48 mx-auto">
              <el-image
                :src="member.image"
                fit="cover"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                :preview-src-list="[]"
              />
              <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </div>
            <h3 class="text-lg font-bold text-primary mb-1">{{ member.name }}</h3>
            <p class="text-gray-600 mb-2">{{ member.role }}</p>
            <p class="text-sm text-gray-500">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  HeartIcon, 
  AwardIcon, 
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from 'lucide-vue-next'

const values = [
  {
    icon: HeartIcon,
    title: 'Quality First',
    description: 'We never compromise on the quality of our service or the craftsmanship of our tailors.'
  },
  {
    icon: AwardIcon,
    title: 'Excellence',
    description: 'We strive for excellence in every stitch, every measurement, and every customer interaction.'
  },
  {
    icon: UsersIcon,
    title: 'Community',
    description: 'We build strong relationships between tailors and customers, creating a thriving community.'
  }
]

const missionPoints = [
  'Connecting skilled tailors with customers worldwide',
  'Making custom-fitted clothing accessible to everyone',
  'Preserving and promoting the art of tailoring',
  'Reducing waste through made-to-measure garments',
  'Creating sustainable employment opportunities for tailors'
]

const teamMembers = [
  {
    name: 'Mercy Nyambura',
    role: 'Founder & CEO',
    image: 'https://media.istockphoto.com/id/1017932446/photo/portrait-of-african-woman-at-street.webp?a=1&b=1&s=612x612&w=0&k=20&c=_M8PGUCFV06ZpLb141YVZyhVyVOkj4KLjmNR2KGSLSo=',
    description: 'Fashion industry veteran with 15+ years of experience'
  },
  {
    name: 'Ham Kemboi',
    role: 'Head of Technology',
    image: 'https://plus.unsplash.com/premium_photo-1669627111634-90e7e99505b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8eW91bmclMjBhZnJpY2FuJTIwYm95JTIwMjB5ZWFyJTIwb2xkJTIwJTIwd2hvJTIwbGlrZXMlMjBjb2Rpbmd8ZW58MHx8MHx8fDA%3D',
    description: 'Tech innovator passionate about fashion-tech integration'
  },
  {
    name: 'Ann Njeru',
    role: 'Lead Designer',
    image: 'https://plus.unsplash.com/premium_photo-1700932723489-dcbfd3e5db1f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHlvdW5nJTIwYWZyaWNhbiUyMGdpcmwlMjAyMHllYXIlMjBvbGR8ZW58MHx8MHx8fDA%3D',
    description: 'Award-winning fashion designer with global experience'
  }
]
</script>

<style scoped>
.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.get-started-btn {
  position: relative;
  overflow: hidden;
}

.get-started-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.get-started-btn:hover::after {
  width: 100%;
  height: 100%;
}

.feature-card {
  background: white;
  border: 1px solid #ECF0F1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  border-color: #2C3E50;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>