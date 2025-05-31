<template>
  <div class="settings-container settings-page">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#D4AF37]">Account Settings</h1>
      <p class="text-[#777777]">Manage your account preferences and tailor shop settings</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Sidebar Navigation -->
      <div class="col-span-1">
        <el-card shadow="hover" class="settings-sidebar">
          <el-menu
            :default-active="activeSection"
            class="settings-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <template #title>
                <div class="flex items-center gap-2">
                  <user-icon :size="18" class="menu-icon" />
                  <span>Profile</span>
                </div>
              </template>
            </el-menu-item>
            <el-menu-item index="shop">
              <template #title>
                <div class="flex items-center gap-2">
                  <store-icon :size="18" class="menu-icon" />
                  <span>Shop Details</span>
                </div>
              </template>
            </el-menu-item>
            <el-menu-item index="notifications">
              <template #title>
                <div class="flex items-center gap-2">
                  <bell-icon :size="18" class="menu-icon" />
                  <span>Notifications</span>
                </div>
              </template>
            </el-menu-item>
            <el-menu-item index="security">
              <template #title>
                <div class="flex items-center gap-2">
                  <lock-icon :size="18" class="menu-icon" />
                  <span>Security</span>
                </div>
              </template>
            </el-menu-item>
            <el-menu-item index="billing">
              <template #title>
                <div class="flex items-center gap-2">
                  <credit-card-icon :size="18" class="menu-icon" />
                  <span>Billing</span>
                </div>
              </template>
            </el-menu-item>
          </el-menu>
        </el-card>
      </div>
      
      <!-- Settings Content -->
      <div class="col-span-1 md:col-span-2">
        <!-- Profile Settings -->
        <el-card v-if="activeSection === 'profile'" shadow="hover" class="mb-6">
          <template #header>
            <h3 class="text-lg font-bold">Profile Information</h3>
          </template>
          
          <el-form 
            ref="profileFormRef"
            :model="profileForm" 
            label-position="top"
            :rules="profileRules"
          >
            <div class="mb-6">
              <div class="flex items-center gap-4">
                <el-avatar :size="80" :src="profileForm.avatar || 'https://via.placeholder.com/80'" />
                <div>
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleAvatarChange"
                  >
                    <el-button type="primary">Change Avatar</el-button>
                  </el-upload>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="First Name" prop="firstName">
                <el-input v-model="profileForm.firstName" />
              </el-form-item>
              
              <el-form-item label="Last Name" prop="lastName">
                <el-input v-model="profileForm.lastName" />
              </el-form-item>
            </div>
            
            <el-form-item label="Email" prop="email">
              <el-input v-model="profileForm.email" disabled />
            </el-form-item>
            
            <el-form-item label="Phone Number" prop="phone">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
            
            <el-form-item label="Bio">
              <el-input type="textarea" v-model="profileForm.bio" rows="3" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="profileLoading">Save Changes</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- Shop Settings -->
        <el-card v-if="activeSection === 'shop'" shadow="hover" class="mb-6">
          <template #header>
            <h3 class="text-lg font-bold">Shop Details</h3>
          </template>
          
          <el-form 
            ref="shopFormRef"
            :model="shopForm" 
            label-position="top"
            :rules="shopRules"
          >
            <el-form-item label="Shop Name" prop="name">
              <el-input v-model="shopForm.name" />
            </el-form-item>
            
            <el-form-item label="Business Address" prop="address">
              <el-input type="textarea" v-model="shopForm.address" rows="2" />
            </el-form-item>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Business Hours">
                <el-time-select
                  v-model="shopForm.openTime"
                  placeholder="Opening time"
                  start="08:00"
                  step="00:30"
                  end="20:00"
                />
                <span class="mx-2">to</span>
                <el-time-select
                  v-model="shopForm.closeTime"
                  placeholder="Closing time"
                  start="08:00"
                  step="00:30"
                  end="20:00"
                  :min-time="shopForm.openTime"
                />
              </el-form-item>
              
              <el-form-item label="Business Days">
                <el-checkbox-group v-model="shopForm.businessDays">
                  <el-checkbox label="mon">Mon</el-checkbox>
                  <el-checkbox label="tue">Tue</el-checkbox>
                  <el-checkbox label="wed">Wed</el-checkbox>
                  <el-checkbox label="thu">Thu</el-checkbox>
                  <el-checkbox label="fri">Fri</el-checkbox>
                  <el-checkbox label="sat">Sat</el-checkbox>
                  <el-checkbox label="sun">Sun</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>
            
            <el-form-item label="Shop Description">
              <el-input type="textarea" v-model="shopForm.description" rows="3" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveShop" :loading="shopLoading">Save Changes</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- Notifications Settings -->
        <el-card v-if="activeSection === 'notifications'" shadow="hover" class="mb-6">
          <template #header>
            <h3 class="text-lg font-bold">Notification Preferences</h3>
          </template>
          
          <el-form :model="notificationForm">
            <h4 class="font-medium mb-2">Email Notifications</h4>
            <div class="mb-4">
              <el-checkbox v-model="notificationForm.emailNewOrder">New order notifications</el-checkbox>
              <el-checkbox v-model="notificationForm.emailOrderStatus">Order status updates</el-checkbox>
              <el-checkbox v-model="notificationForm.emailInventory">Low inventory alerts</el-checkbox>
              <el-checkbox v-model="notificationForm.emailMarketing">Marketing and promotions</el-checkbox>
            </div>
            
            <h4 class="font-medium mb-2">SMS Notifications</h4>
            <div class="mb-4">
              <el-checkbox v-model="notificationForm.smsNewOrder">New order notifications</el-checkbox>
              <el-checkbox v-model="notificationForm.smsOrderStatus">Order status updates</el-checkbox>
              <el-checkbox v-model="notificationForm.smsInventory">Low inventory alerts</el-checkbox>
            </div>
            
            <h4 class="font-medium mb-2">App Notifications</h4>
            <div class="mb-4">
              <el-checkbox v-model="notificationForm.appNewOrder">New order notifications</el-checkbox>
              <el-checkbox v-model="notificationForm.appOrderStatus">Order status updates</el-checkbox>
              <el-checkbox v-model="notificationForm.appInventory">Low inventory alerts</el-checkbox>
              <el-checkbox v-model="notificationForm.appMessages">Client messages</el-checkbox>
            </div>
            
            <el-form-item>
              <el-button type="primary" @click="saveNotifications" :loading="notificationLoading">Save Preferences</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- Security Settings -->
        <el-card v-if="activeSection === 'security'" shadow="hover" class="mb-6">
          <template #header>
            <h3 class="text-lg font-bold">Security Settings</h3>
          </template>
          
          <div class="mb-6">
            <h4 class="font-medium mb-2">Change Password</h4>
            <el-form 
              ref="passwordFormRef"
              :model="passwordForm" 
              label-position="top"
              :rules="passwordRules"
            >
              <el-form-item label="Current Password" prop="currentPassword">
                <el-input v-model="passwordForm.currentPassword" type="password" show-password />
              </el-form-item>
              
              <el-form-item label="New Password" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              
              <el-form-item label="Confirm New Password" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="changePassword" :loading="passwordLoading">Update Password</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div>
            <h4 class="font-medium mb-2">Two-Factor Authentication</h4>
            <p class="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
            
            <el-switch
              v-model="twoFactorEnabled"
              @change="toggleTwoFactor"
              :loading="twoFactorLoading"
            />
            <span class="ml-2">{{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}</span>
          </div>
        </el-card>
        
        <!-- Billing Settings -->
        <el-card v-if="activeSection === 'billing'" shadow="hover" class="mb-6">
          <template #header>
            <h3 class="text-lg font-bold">Billing Information</h3>
          </template>
          
          <div class="mb-6">
            <h4 class="font-medium mb-2">Current Plan</h4>
            <div class="p-4 border rounded-md bg-gray-50">
              <div class="flex justify-between items-center">
                <div>
                  <h5 class="font-bold text-lg">Professional Plan</h5>
                  <p class="text-sm text-gray-500">$29.99/month</p>
                </div>
                <el-tag type="success">Active</el-tag>
              </div>
              
              <div class="mt-4">
                <ul class="text-sm">
                  <li class="flex items-center gap-2 mb-1">
                    <check-icon :size="16" class="text-green-500" />
                    <span>Unlimited orders</span>
                  </li>
                  <li class="flex items-center gap-2 mb-1">
                    <check-icon :size="16" class="text-green-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li class="flex items-center gap-2 mb-1">
                    <check-icon :size="16" class="text-green-500" />
                    <span>Client management</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <check-icon :size="16" class="text-green-500" />
                    <span>Email notifications</span>
                  </li>
                </ul>
              </div>
              
              <div class="mt-4">
                <el-button>Upgrade Plan</el-button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium mb-2">Payment Method</h4>
            <div class="flex items-center gap-4 p-4 border rounded-md">
              <credit-card-icon :size="24" />
              <div>
                <p class="font-medium">Visa ending in 4242</p>
                <p class="text-sm text-gray-500">Expires 12/2025</p>
              </div>
              <div class="ml-auto">
                <el-button size="small">Edit</el-button>
              </div>
            </div>
            
            <div class="mt-4">
              <el-button type="primary">Add Payment Method</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  UserIcon, 
  StoreIcon, 
  BellIcon, 
  LockIcon, 
  CreditCardIcon,
  CheckIcon
} from 'lucide-vue-next';
import { authService } from '@/services';

// State
const activeSection = ref('profile');
const profileLoading = ref(false);
const shopLoading = ref(false);
const notificationLoading = ref(false);
const passwordLoading = ref(false);
const twoFactorLoading = ref(false);
const twoFactorEnabled = ref(false);

// Form refs
const profileFormRef = ref(null);
const shopFormRef = ref(null);
const passwordFormRef = ref(null);

// Form models
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  avatar: ''
});

const shopForm = reactive({
  name: '',
  address: '',
  openTime: '09:00',
  closeTime: '18:00',
  businessDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  description: ''
});

const notificationForm = reactive({
  emailNewOrder: true,
  emailOrderStatus: true,
  emailInventory: true,
  emailMarketing: false,
  smsNewOrder: false,
  smsOrderStatus: false,
  smsInventory: false,
  appNewOrder: true,
  appOrderStatus: true,
  appInventory: true,
  appMessages: true
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Form rules
const profileRules = {
  firstName: [{ required: true, message: 'Please enter your first name', trigger: 'blur' }],
  lastName: [{ required: true, message: 'Please enter your last name', trigger: 'blur' }],
  phone: [{ pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number', trigger: 'blur' }]
};

const shopRules = {
  name: [{ required: true, message: 'Please enter your shop name', trigger: 'blur' }],
  address: [{ required: true, message: 'Please enter your business address', trigger: 'blur' }]
};

const passwordRules = {
  currentPassword: [{ required: true, message: 'Please enter your current password', trigger: 'blur' }],
  newPassword: [
    { required: true, message: 'Please enter a new password', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('Passwords do not match'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// Lifecycle hooks
onMounted(async () => {
  await fetchUserProfile();
  await fetchShopDetails();
  await fetchNotificationPreferences();
  await fetchSecuritySettings();
});

// Methods
function handleMenuSelect(key) {
  activeSection.value = key;
}

async function fetchUserProfile() {
  try {
    const response = await authService.getProfile();
    
    if (response.data.success) {
      const user = response.data.data;
      
      profileForm.firstName = user.first_name || '';
      profileForm.lastName = user.last_name || '';
      profileForm.email = user.email || '';
      profileForm.phone = user.phone || '';
      profileForm.bio = user.bio || '';
      profileForm.avatar = user.avatar || '';
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    ElMessage.error('Failed to load profile information');
  }
}

async function fetchShopDetails() {
  try {
    // This would be implemented with a shop service
    // For now, using mock data
    shopForm.name = 'Tailorly Shop';
    shopForm.address = '123 Fashion Street, New York, NY 10001';
    shopForm.description = 'Premium tailoring services for all your fashion needs';
  } catch (error) {
    console.error('Error fetching shop details:', error);
    ElMessage.error('Failed to load shop details');
  }
}

async function fetchNotificationPreferences() {
  try {
    // This would be implemented with a notification service
    // For now, using default values in the reactive object
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    ElMessage.error('Failed to load notification preferences');
  }
}

async function fetchSecuritySettings() {
  try {
    // This would be implemented with a security service
    // For now, using mock data
    twoFactorEnabled.value = false;
  } catch (error) {
    console.error('Error fetching security settings:', error);
    ElMessage.error('Failed to load security settings');
  }
}

function handleAvatarChange(file) {
  // This would upload the file to a server
  // For now, just creating a local URL
  profileForm.avatar = URL.createObjectURL(file.raw);
}

async function saveProfile() {
  if (!profileFormRef.value) return;
  
  try {
    await profileFormRef.value.validate();
    
    profileLoading.value = true;
    
    const userData = {
      first_name: profileForm.firstName,
      last_name: profileForm.lastName,
      phone: profileForm.phone,
      bio: profileForm.bio,
      // avatar would be handled separately in a real implementation
    };
    
    const response = await authService.updateProfile(userData);
    
    if (response.data.success) {
      ElMessage.success('Profile updated successfully');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    ElMessage.error('Failed to update profile');
  } finally {
    profileLoading.value = false;
  }
}

async function saveShop() {
  if (!shopFormRef.value) return;
  
  try {
    await shopFormRef.value.validate();
    
    shopLoading.value = true;
    
    // This would be implemented with a shop service
    // For now, just simulating success
    
    setTimeout(() => {
      ElMessage.success('Shop details updated successfully');
      shopLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error updating shop details:', error);
    ElMessage.error('Failed to update shop details');
    shopLoading.value = false;
  }
}

async function saveNotifications() {
  try {
    notificationLoading.value = true;
    
    // This would be implemented with a notification service
    // For now, just simulating success
    
    setTimeout(() => {
      ElMessage.success('Notification preferences updated successfully');
      notificationLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    ElMessage.error('Failed to update notification preferences');
    notificationLoading.value = false;
  }
}

async function changePassword() {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    
    passwordLoading.value = true;
    
    const passwordData = {
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword
    };
    
    const response = await authService.changePassword(passwordData);
    
    if (response.data.success) {
      ElMessage.success('Password updated successfully');
      
      // Reset form
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    }
  } catch (error) {
    console.error('Error changing password:', error);
    ElMessage.error('Failed to update password');
  } finally {
    passwordLoading.value = false;
  }
}

async function toggleTwoFactor() {
  try {
    twoFactorLoading.value = true;
    
    // This would be implemented with a security service
    // For now, just simulating success
    
    setTimeout(() => {
      ElMessage.success(
        twoFactorEnabled.value 
          ? 'Two-factor authentication enabled' 
          : 'Two-factor authentication disabled'
      );
      twoFactorLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error toggling two-factor authentication:', error);
    ElMessage.error('Failed to update two-factor authentication');
    twoFactorLoading.value = false;
    
    // Revert the change since it failed
    twoFactorEnabled.value = !twoFactorEnabled.value;
  }
}
</script>

<style scoped>
.settings-page {
  padding: 1rem;
  background-color: #FFFFFF;
  color: #333333;
}

.settings-menu {
  border-right: none;
}

.settings-menu .el-menu-item {
  color: #555555;
}

.settings-menu .el-menu-item:hover {
  background-color: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.settings-menu .el-menu-item.is-active {
  color: #D4AF37;
  background-color: rgba(212, 175, 55, 0.1);
}

.settings-menu .menu-icon {
  color: #777777;
}

.settings-menu .el-menu-item.is-active .menu-icon {
  color: #D4AF37;
}

.settings-sidebar {
  background-color: #F5F5F5;
  border: 1px solid #E0E0E0;
}

/* Card styling */
.el-card {
  background-color: #FFFFFF;
  border-color: #E0E0E0;
}

.el-card__header {
  border-bottom: 1px solid #E0E0E0;
  background-color: #F8F8F8;
}

/* Form controls styling */
.el-form-item__label {
  color: #555555;
  font-weight: 500;
}

.el-input__wrapper {
  background-color: #FFFFFF;
  box-shadow: 0 0 0 1px #E0E0E0 inset;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #D4AF37 inset;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #D4AF37 inset;
}

.el-input__inner {
  color: #333333;
}

.el-button--primary {
  background-color: #D4AF37;
  border-color: #D4AF37;
  color: #FFFFFF;
}

.el-button--primary:hover {
  background-color: #E5C158;
  border-color: #E5C158;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #D4AF37;
  border-color: #D4AF37;
}

.el-checkbox__label {
  color: #555555;
}

.el-time-select {
  border-color: #E0E0E0;
}

.el-time-select:hover {
  border-color: #D4AF37;
}

.el-time-select__item.selected {
  color: #D4AF37;
  font-weight: bold;
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: #D4AF37;
  border-color: #D4AF37;
}

.el-radio__label {
  color: #555555;
}
</style>
