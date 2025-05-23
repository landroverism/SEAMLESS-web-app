<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-primary">Join Seamless</h2>
          <p class="text-gray-600 mt-2">Create your account in minutes</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="name">
          <el-input
            v-model="form.name"
            placeholder="Full name"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="Email address"
            :prefix-icon="Mail"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm password"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="terms">
          <el-checkbox v-model="form.terms">
            I agree to the <el-button text type="primary" class="px-1">Terms of Service</el-button> and
            <el-button text type="primary" class="px-1">Privacy Policy</el-button>
          </el-checkbox>
        </el-form-item>

        <el-button
          type="primary"
          class="w-full mb-4"
          :loading="loading"
          native-type="submit"
        >
          Create Account
        </el-button>

        <p class="text-center text-gray-600">
          Already have an account?
          <el-button 
            text 
            type="primary"
            @click="$router.push('/login')"
          >
            Sign in
          </el-button>
        </p>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Lock } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authService } from '@/services'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  } else {
    if (form.value.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please confirm the password'))
  } else if (value !== form.value.password) {
    callback(new Error("Passwords don't match!"))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  terms: [
    { 
      validator: (rule: any, value: boolean, callback: any) => {
        if (!value) {
          callback(new Error('Please accept the terms and conditions'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        console.log('Starting registration process...');
        // Prepare registration data
        const registrationData = {
          name: form.value.name,
          email: form.value.email,
          password: form.value.password,
          specialty: 'General Tailoring', // Default value
          experience: '0-2 years', // Default value
          phone: '' // Optional field
        }
        
        console.log('Registration data prepared:', { ...registrationData, password: '***' });
        
        // First check if the server is reachable
        console.log('Testing API connection...');
        try {
          const healthCheck = await fetch(import.meta.env.VITE_API_URL + '/test-supabase');
          console.log('Health check response:', await healthCheck.json());
        } catch (healthError) {
          console.warn('Health check failed, but continuing with registration:', healthError);
        }
        
        // Call the auth service to register
        console.log('Calling auth service register method...');
        const response = await authService.register(registrationData);
        console.log('Registration response:', response.data);
        
        if (response.data.success) {
          // Email verification is disabled, so user is registered immediately
          ElMessage({
            type: 'success',
            message: 'Account created successfully!',
            duration: 3000
          });
          // Navigate to login page
          router.push('/login');
        } else {
          throw new Error(response.data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        // More detailed error information
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
          ElMessage.error(`Registration failed: ${error.response.data?.message || error.message || 'Server error'}`)
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          ElMessage.error('No response received from server. Please check your connection.')
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          ElMessage.error(error.message || 'Registration failed. Please try again.')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>