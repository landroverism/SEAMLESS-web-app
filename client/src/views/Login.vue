<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-[#2C3E50]">Welcome Back</h2>
          <p class="text-gray-600 mt-2">Sign in to access your account</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
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

        <div class="flex items-center justify-between mb-6">
          <el-checkbox v-model="form.remember">Remember me</el-checkbox>
          <el-button 
            text 
            type="primary"
            @click="forgotPassword"
          >
            Forgot password?
          </el-button>
        </div>

        <el-button
          type="primary"
          class="w-full"
          :loading="loading"
          native-type="submit"
        >
          Sign In
        </el-button>

        <el-divider>or continue with</el-divider>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <el-button 
            class="w-full"
            @click="socialLogin('google')"
          >
            <google-icon class="mr-2" :size="18" />
            Google
          </el-button>
          <el-button
            class="w-full"
            @click="socialLogin('facebook')"
          >
            <facebook-icon class="mr-2" :size="18" />
            Facebook
          </el-button>
        </div>

        <p class="text-center text-gray-600">
          Don't have an account?
          <el-button 
            text 
            type="primary"
            @click="$router.push('/register')"
          >
            Sign up
          </el-button>
        </p>
      </el-form>
    </el-card>

    <el-dialog
      v-model="showForgotDialog"
      title="Reset Password"
      width="400px"
    >
      <el-form :model="resetForm" @submit.prevent="handleReset">
        <p class="text-gray-600 mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        <el-form-item>
          <el-input
            v-model="resetForm.email"
            type="email"
            placeholder="Email address"
            :prefix-icon="Mail"
          />
        </el-form-item>
        <el-button
          type="primary"
          class="w-full"
          :loading="resetting"
          native-type="submit"
        >
          Send Reset Instructions
        </el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Facebook as FacebookIcon, Chrome as GoogleIcon } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authService } from '@/services'

const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showForgotDialog = ref(false)
const resetting = ref(false)

const form = ref({
  email: '',
  password: '',
  remember: false
})

const resetForm = ref({
  email: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        console.log('Attempting login with:', { email: form.value.email, password: '***' })
        
        // Call the auth service to login
        const response = await authService.login({
          email: form.value.email,
          password: form.value.password
        })
        
        console.log('Login response:', response.data)
        
        if (response.data && response.data.success) {
          // Store user info in localStorage
          const userData = response.data.data.tailor
          console.log('User data:', userData)
          
          // Show success message
          ElMessage({
            type: 'success',
            message: 'Successfully logged in!',
            duration: 3000
          })
          
          // Navigate based on user role
          if (userData.isAdmin || userData.role === 'admin') {
            console.log('Admin user detected, redirecting to admin dashboard')
            setTimeout(() => router.push('/admin/dashboard'), 500)
          } else {
            console.log('Regular user detected, redirecting to dashboard')
            setTimeout(() => router.push('/admin/dashboard'), 500)
          }
        } else {
          throw new Error(response.data?.message || 'Login failed')
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(error.response?.data?.message || error.message || 'Login failed. Please try again.')
      } finally {
        loading.value = false
      }
    }
  })
}

const forgotPassword = () => {
  showForgotDialog.value = true
}

const handleReset = async () => {
  resetting.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage({
      type: 'success',
      message: 'Reset instructions sent to your email!',
      duration: 3000
    })
    
    showForgotDialog.value = false
    resetForm.value.email = ''
  } catch (error) {
    ElMessage.error('Failed to send reset instructions. Please try again.')
  } finally {
    resetting.value = false
  }
}

const socialLogin = async (provider: 'google' | 'facebook') => {
  try {
    // Implement social login logic here
    ElMessage({
      type: 'info',
      message: `${provider} login not implemented yet`,
      duration: 3000
    })
  } catch (error) {
    ElMessage.error(`${provider} login failed. Please try again.`)
  }
}
</script>