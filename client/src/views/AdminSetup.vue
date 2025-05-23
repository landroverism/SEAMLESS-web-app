<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Admin Setup
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Create an admin account for Tailorly
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="success" class="rounded-md bg-green-50 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Admin account created successfully
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>You can now log in with your admin credentials.</p>
              </div>
              <div class="mt-4">
                <div class="-mx-2 -my-1.5 flex">
                  <router-link to="/login" class="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Go to Login
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form v-else class="space-y-6" @submit.prevent="setupAdmin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input id="email" name="email" type="email" v-model="email" autocomplete="email" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div class="mt-1">
              <input id="name" name="name" type="text" v-model="name" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input id="password" name="password" type="password" v-model="password" autocomplete="current-password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="specialty" class="block text-sm font-medium text-gray-700">
              Specialty
            </label>
            <div class="mt-1">
              <input id="specialty" name="specialty" type="text" v-model="specialty" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="adminCode" class="block text-sm font-medium text-gray-700">
              Admin Setup Code
            </label>
            <div class="mt-1">
              <input id="adminCode" name="adminCode" type="password" v-model="adminCode" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <p class="mt-2 text-sm text-gray-500">
              This is a one-time code to set up the admin account
            </p>
          </div>

          <div>
            <button type="submit" :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span v-if="loading">Setting up...</span>
              <span v-else>Create Admin Account</span>
            </button>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Error creating admin account
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import authService from '../services/auth.service';

export default {
  name: 'AdminSetup',
  setup() {
    const email = ref('vocalunion8@gmail.com'); // Pre-filled with your email
    const name = ref('Admin User');
    const password = ref('kem98@#$'); // Pre-filled with your password
    const specialty = ref('System Administration');
    const adminCode = ref('');
    const loading = ref(false);
    const error = ref(false);
    const errorMessage = ref('');
    const success = ref(false);

    // The admin setup code is hardcoded here for simplicity
    // In a real application, this would be stored securely
    const ADMIN_SETUP_CODE = 'tailorly-admin-2025';

    const setupAdmin = async () => {
      if (adminCode.value !== ADMIN_SETUP_CODE) {
        error.value = true;
        errorMessage.value = 'Invalid admin setup code';
        return;
      }

      loading.value = true;
      error.value = false;

      try {
        // Create admin user directly with the admin API
        const response = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
            name: name.value,
            specialty: specialty.value,
            adminCode: adminCode.value
          })
        });

        const data = await response.json();
        console.log('Admin creation response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create admin account');
        }

        success.value = true;
      } catch (err) {
        console.error('Registration error:', err);
        error.value = true;
        errorMessage.value = err.response?.data?.message || 'Failed to create admin account';
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      name,
      password,
      specialty,
      adminCode,
      loading,
      error,
      errorMessage,
      success,
      setupAdmin
    };
  }
};
</script>
