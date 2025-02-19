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
import { User, Mail, Lock } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        ElMessage({
          type: 'success',
          message: 'Account created successfully!',
          duration: 3000
        })
        
        // Navigate to dashboard or home
        router.push('/')
      } catch (error) {
        ElMessage.error('Registration failed. Please try again.')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>