<template>
  <div class="admin-dashboard">
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Dashboard</h2>
      <div class="flex items-center gap-4">
        <el-select v-model="timeRange" placeholder="Time Range" size="small">
          <el-option label="Last 7 days" value="7days" />
          <el-option label="Last 30 days" value="30days" />
          <el-option label="Last 90 days" value="90days" />
        </el-select>
        <CurrencySelector @currency-changed="handleCurrencyChange" />
      </div>
    </div>
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <el-card shadow="hover" class="overview-card">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-full bg-blue-100">
                  <clipboard-list-icon :size="24" class="text-blue-500" />
                </div>
                <div>
                  <p class="text-gray-500 text-sm">Total Orders</p>
                  <h3 class="text-2xl font-bold">{{ totalOrders }}</h3>
                </div>
              </div>
              <div class="mt-4 text-sm text-green-500 flex items-center">
                <arrow-up-icon :size="16" class="mr-1" />
                <span>+12% from last month</span>
              </div>
            </el-card>
            
            <el-card shadow="hover" class="overview-card">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-full bg-green-100">
                  <users-icon :size="24" class="text-green-500" />
                </div>
                <div>
                  <p class="text-gray-500 text-sm">Active Clients</p>
                  <h3 class="text-2xl font-bold">{{ activeClients }}</h3>
                </div>
              </div>
              <div class="mt-4 text-sm text-green-500 flex items-center">
                <arrow-up-icon :size="16" class="mr-1" />
                <span>+5% from last month</span>
              </div>
            </el-card>
            
            <el-card shadow="hover" class="overview-card">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-full bg-amber-100">
                  <clock-icon :size="24" class="text-amber-500" />
                </div>
                <div>
                  <p class="text-gray-500 text-sm">Pending Orders</p>
                  <h3 class="text-2xl font-bold">{{ pendingOrders }}</h3>
                </div>
              </div>
              <div class="mt-4 text-sm text-amber-500 flex items-center">
                <alert-circle-icon :size="16" class="mr-1" />
                <span>2 orders due today</span>
              </div>
            </el-card>
            
            <el-card shadow="hover" class="overview-card">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-full bg-purple-100">
                  <dollar-sign-icon :size="24" class="text-purple-500" />
                </div>
                <div>
                  <p class="text-gray-500 text-sm">Revenue</p>
                  <h3 class="text-2xl font-bold"><CurrencyFormatter :amount="revenue" :currency="currentCurrency" /></h3>
                </div>
              </div>
              <div class="mt-4 text-sm text-green-500 flex items-center">
                <arrow-up-icon :size="16" class="mr-1" />
                <span>+8% from last month</span>
              </div>
            </el-card>
          </div>
          
          <!-- Service Order Management -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <el-card shadow="hover" class="col-span-2">
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold text-primary">Service Orders by Type</h3>
                  <el-select v-model="timeRange" placeholder="Select" size="small">
                    <el-option label="Last 7 days" value="7days" />
                    <el-option label="Last 30 days" value="30days" />
                    <el-option label="Last 90 days" value="90days" />
                  </el-select>
                </div>
              </template>
              
              <!-- Chart for Service Orders -->
              <div class="h-80">
                <canvas ref="serviceOrdersChart"></canvas>
              </div>
            </el-card>
            
            <el-card shadow="hover">
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold text-primary">Order Status</h3>
                </div>
              </template>
              
              <!-- Pie Chart for Order Status -->
              <div class="h-80">
                <canvas ref="orderStatusChart"></canvas>
              </div>
            </el-card>
          </div>
          
          <!-- Recent Orders -->
          <el-card shadow="hover" class="mb-8">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-primary">Recent Orders</h3>
                <el-button type="primary" plain size="small">View All</el-button>
              </div>
            </template>
            
            <el-table :data="recentOrders" style="width: 100%">
              <el-table-column prop="id" label="Order ID" width="100" />
              <el-table-column prop="client" label="Client" width="180" />
              <el-table-column prop="service" label="Service Type" />
              <el-table-column prop="date" label="Order Date" width="150" />
              <el-table-column prop="dueDate" label="Due Date" width="150" />
              <el-table-column prop="status" label="Status" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="120">
                <template #default="scope">
                  <el-button-group>
                    <el-button type="primary" size="small" plain>
                      <eye-icon :size="16" />
                    </el-button>
                    <el-button type="success" size="small" plain>
                      <message-square-icon :size="16" />
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
          <!-- Client Feedback -->
          <el-card shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-primary">Recent Client Feedback</h3>
                <el-button type="primary" plain size="small">View All</el-button>
              </div>
            </template>
            
            <div class="space-y-4">
              <div v-for="(feedback, index) in recentFeedback" :key="index" class="p-4 border rounded-lg">
                <div class="flex items-start gap-4">
                  <el-avatar :size="40" :src="feedback.clientAvatar" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-bold text-gray-800">{{ feedback.clientName }}</h4>
                      <el-rate v-model="feedback.rating" disabled text-color="#ff9900" />
                    </div>
                    <p class="text-gray-600 mb-2">{{ feedback.comment }}</p>
                    <div class="flex items-center justify-between text-sm text-gray-500">
                      <span>{{ feedback.date }}</span>
                      <span>Order #{{ feedback.orderId }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ClipboardListIcon,
  ClockIcon,
  DollarSignIcon,
  ArrowUpIcon,
  AlertCircleIcon,
  EyeIcon,
  MessageSquareIcon
} from 'lucide-vue-next'
import CurrencyFormatter from '../../components/CurrencyFormatter.vue'
import CurrencySelector from '../../components/CurrencySelector.vue'
import currencyService from '../../services/currency.service'
import Chart from 'chart.js/auto'

// Dashboard data
const totalOrders = ref(248)
const activeClients = ref(124)
const pendingOrders = ref(18)
const revenue = ref(1258000) // In KES (about 12,580 USD)
const timeRange = ref('30days')
const currentCurrency = ref(currencyService.getPreferredCurrency())

// Handle currency change
const handleCurrencyChange = (currency) => {
  currentCurrency.value = currency
  console.log(`Currency changed to ${currency}`)
}

// Charts refs
const serviceOrdersChart = ref(null)
const orderStatusChart = ref(null)

// Recent orders data
const recentOrders = ref([
  { id: 'ORD-1234', client: 'John Smith', service: 'Custom Suit', date: '2025-05-15', dueDate: '2025-05-25', status: 'In Progress' },
  { id: 'ORD-1233', client: 'Carla Lagat', service: 'Dress Alteration', date: '2025-05-14', dueDate: '2025-05-20', status: 'Completed' },
  { id: 'ORD-1232', client: 'Abel Ndocha', service: 'Wedding Suit', date: '2025-05-12', dueDate: '2025-06-01', status: 'Pending' },
  { id: 'ORD-1231', client: 'Emily Davis', service: 'Shirt Tailoring', date: '2025-05-10', dueDate: '2025-05-18', status: 'Delayed' },
  { id: 'ORD-1230', client: 'Robert Wilson', service: 'Pants Hemming', date: '2025-05-08', dueDate: '2025-05-15', status: 'Completed' }
])

// Recent feedback data
const recentFeedback = ref([
  { 
    clientName: 'Carla Lagat', 
    // clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'The dress alterations were perfect! Exactly what I wanted and delivered on time.',
    date: '2025-05-18',
    orderId: '1233'
  },
  { 
    clientName: 'Abel Ndocha', 
    // clientAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    comment: 'Great service, the pants fit perfectly now. Would recommend!',
    date: '2025-05-16',
    orderId: '1230'
  }
])

// Methods
const getStatusType = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'success'
    case 'In Progress':
      return 'primary'
    case 'Pending':
      return 'warning'
    case 'Delayed':
      return 'danger'
    default:
      return 'info'
  }
}

// Initialize charts
onMounted(() => {
  // Service Orders Chart
  if (serviceOrdersChart.value) {
    new Chart(serviceOrdersChart.value, {
      type: 'bar',
      data: {
        labels: ['Custom Suits', 'Alterations', 'Wedding Attire', 'Shirts', 'Pants', 'Corporate Uniforms'],
        datasets: [{
          label: 'Number of Orders',
          data: [65, 42, 28, 35, 58, 20],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
  
  // Order Status Chart
  if (orderStatusChart.value) {
    new Chart(orderStatusChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
        datasets: [{
          data: [125, 45, 18, 5],
          backgroundColor: [
            'rgba(46, 204, 113, 0.6)',
            'rgba(52, 152, 219, 0.6)',
            'rgba(241, 196, 15, 0.6)',
            'rgba(231, 76, 60, 0.6)'
          ],
          borderColor: [
            'rgba(46, 204, 113, 1)',
            'rgba(52, 152, 219, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(231, 76, 60, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.overview-card {
  transition: transform 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
}
</style>
