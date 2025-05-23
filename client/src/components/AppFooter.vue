<template>
  <footer class="bg-primary text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <scissors-icon :size="24" class="text-highlight" />
            Tailorly
          </h3>
          <p class="text-sm text-secondary/80 mb-6">
            Revolutionizing the tailoring industry through technology and connecting customers with expert tailors worldwide.
          </p>
          <div class="flex gap-4">
            <a 
              v-for="icon in socialIcons"
              :key="icon.name"
              :href="icon.link"
              target="_blank"
              rel="noopener noreferrer"
              class="group"
            >
              <el-button 
                circle
                class="social-btn !bg-primary-light hover:!bg-highlight hover:!text-primary transition-all duration-300 transform group-hover:scale-110"
              >
                <component :is="icon.component" :size="18" />
              </el-button>
            </a>
          </div>
        </div>

        <div>
          <h4 class="font-bold mb-4">Quick Links</h4>
          <div class="flex flex-col gap-2">
            <router-link 
              v-for="link in quickLinks"
              :key="link.path"
              :to="link.path"
              class="text-sm text-secondary/80 hover:text-highlight transition-colors flex items-center gap-2"
            >
              <component :is="link.icon" :size="16" />
              {{ link.label }}
            </router-link>
          </div>
        </div>

        <div>
          <h4 class="font-bold mb-4">Services</h4>
          <div class="flex flex-col gap-2">
            <span 
              v-for="service in services"
              :key="service.label"
              class="text-sm text-secondary/80 flex items-center gap-2"
            >
              <component :is="service.icon" :size="16" class="text-highlight" />
              {{ service.label }}
            </span>
          </div>
        </div>

        <div>
          <h4 class="font-bold mb-4">Contact Us</h4>
          <div class="flex flex-col gap-4">
            <div v-for="contact in contactInfo" :key="contact.label" class="flex items-center gap-2">
              <component :is="contact.icon" :size="18" class="text-highlight" />
              <span class="text-sm text-secondary/80">{{ contact.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4">
        <p class="text-sm text-secondary/80">
          © {{ new Date().getFullYear() }} Tailorly. All rights reserved.
        </p>
        <div class="flex gap-6">
          <a 
            v-for="link in legalLinks"
            :key="link"
            href="#"
            class="text-sm text-secondary/80 hover:text-highlight transition-colors"
          >
            {{ link }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { 
  ScissorsIcon, 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon,
  LinkedinIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  HomeIcon,
  RulerIcon,
  UsersIcon,
  InfoIcon,
  ScissorsSquareIcon,
  ShirtIcon,
  HeartIcon,
  BuildingIcon
} from 'lucide-vue-next'

const socialIcons = [
  { 
    name: 'facebook', 
    component: FacebookIcon,
    link: 'https://facebook.com'
  },
  { 
    name: 'twitter', 
    component: TwitterIcon,
    link: 'https://twitter.com'
  },
  { 
    name: 'instagram', 
    component: InstagramIcon,
    link: 'https://instagram.com/landroverism'
  },
  { 
    name: 'linkedin', 
    component: LinkedinIcon,
    link: 'https://linkedin.com'
  }
]

const quickLinks = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Measurements', path: '/measurements', icon: RulerIcon },
  { label: 'Find Tailors', path: '/tailors', icon: UsersIcon },
  { label: 'About Us', path: '/about', icon: InfoIcon }
]

const services = [
  { label: 'Custom Tailoring', icon: ScissorsSquareIcon },
  { label: 'Alterations', icon: ShirtIcon },
  { label: 'Wedding Attire', icon: HeartIcon },
  { label: 'Corporate Uniforms', icon: BuildingIcon }
]

const contactInfo = [
  { icon: MapPinIcon, label: 'Kenyatta Avenue, Nakuru West' },
  { icon: PhoneIcon, label: '+2547 13593401' },
  { icon: MailIcon, label: 'tailorly@gmail.com' }
]

const legalLinks = [
  'Privacy Policy',
  'Terms of Service',
  'Cookie Policy'
]
</script>

<style scoped>
.social-btn {
  position: relative;
  overflow: hidden;
}

.social-btn::after {
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

.social-btn:hover::after {
  width: 100%;
  height: 100%;
}
</style>