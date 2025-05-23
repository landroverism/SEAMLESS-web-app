<template>
  <div class="analytics-page">
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold text-primary mb-6">Your Tailoring Analytics</h1>
      <p class="text-gray-600 mb-8">Track your orders, measurements, and preferences over time</p>
      
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <el-card shadow="hover">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-full bg-blue-100">
              <shopping-bag-icon :size="24" class="text-blue-500" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Total Orders</p>
              <h3 class="text-2xl font-bold">{{ customerStats.totalOrders || 0 }}</h3>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-full bg-green-100">
              <ruler-icon :size="24" class="text-green-500" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Measurements Updated</p>
              <h3 class="text-2xl font-bold">{{ customerStats.lastMeasurementUpdate || 'Never' }}</h3>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-full bg-purple-100">
              <calendar-icon :size="24" class="text-purple-500" />
            </div>
            <div>
              <p class="text-gray-500 text-sm">Next Appointment</p>
              <h3 class="text-2xl font-bold">{{ customerStats.nextAppointment || 'None' }}</h3>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- Orders & Measurements Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <el-card shadow="hover">
          <template #header>
            <h3 class="text-lg font-bold text-primary">Orders Overview</h3>
          </template>
          <div class="h-80">
            <canvas ref="ordersChart"></canvas>
          </div>
        </el-card>
        
        <el-card shadow="hover">
          <template #header>
            <h3 class="text-lg font-bold text-primary">Measurement History</h3>
          </template>
          <div class="h-80">
            <canvas ref="measurementsChart"></canvas>
          </div>
        </el-card>
      </div>
      
      <!-- Service History & Preferences -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <el-card shadow="hover">
          <template #header>
            <h3 class="text-lg font-bold text-primary">Service History</h3>
          </template>
          <div class="h-80">
            <canvas ref="serviceHistoryChart"></canvas>
          </div>
        </el-card>
        
        <el-card shadow="hover">
          <template #header>
            <h3 class="text-lg font-bold text-primary">Your Preferences</h3>
          </template>
          <div class="p-4">
            <div v-if="customerPreferences.length > 0">
              <div v-for="(pref, index) in customerPreferences" :key="index" class="mb-4">
                <h4 class="font-medium mb-2">{{ pref.category }}</h4>
                <el-tag 
                  v-for="item in pref.items" 
                  :key="item" 
                  class="mr-2 mb-2"
                >
                  {{ item }}
                </el-tag>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <folder-icon :size="48" class="mx-auto mb-4 opacity-50" />
              <p>No preferences recorded yet</p>
              <p class="text-sm">Your style preferences will appear here once you've placed orders</p>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- Recent Orders -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-primary">Recent Orders</h3>
            <el-button type="primary" size="small" @click="$router.push('/orders')">View All Orders</el-button>
          </div>
        </template>
        
        <el-table :data="recentOrders" style="width: 100%">
          <el-table-column label="Order ID" width="100">
            <template #default="scope">
              <span class="text-xs font-mono">{{ scope.row.id.substring(0, 8) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Date" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="Service" min-width="180">
            <template #default="scope">
              <div class="font-medium">{{ scope.row.service }}</div>
              <div class="text-xs text-gray-500">{{ scope.row.details }}</div>
            </template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Amount" width="100">
            <template #default="scope">
              ${{ scope.row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="100" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">
                View
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { 
  ShoppingBagIcon, 
  RulerIcon, 
  CalendarIcon,
  FolderIcon
} from 'lucide-vue-next';

// Chart references
const ordersChart = ref(null);
const measurementsChart = ref(null);
const serviceHistoryChart = ref(null);

// Data
const customerStats = ref({
  totalOrders: 12,
  lastMeasurementUpdate: '2 weeks ago',
  nextAppointment: 'June 5, 2025'
});

const customerPreferences = ref([
  {
    category: 'Fabrics',
    items: ['Cotton', 'Linen', 'Wool Blend']
  },
  {
    category: 'Colors',
    items: ['Navy Blue', 'Charcoal', 'Forest Green']
  },
  {
    category: 'Styles',
    items: ['Slim Fit', 'Single Breasted', 'Notch Lapel']
  }
]);

const recentOrders = ref([
  {
    id: '1234567890abcdef',
    date: new Date('2025-05-01'),
    service: 'Custom Suit',
    details: '3-piece wool blend',
    status: 'Completed',
    amount: 899.99
  },
  {
    id: '2345678901abcdef',
    date: new Date('2025-04-15'),
    service: 'Shirt Alteration',
    details: 'Sleeve adjustment',
    status: 'Completed',
    amount: 45.00
  },
  {
    id: '3456789012abcdef',
    date: new Date('2025-05-10'),
    service: 'Trousers',
    details: 'Linen summer collection',
    status: 'In Progress',
    amount: 199.99
  },
  {
    id: '4567890123abcdef',
    date: new Date('2025-05-18'),
    service: 'Jacket Repair',
    details: 'Replace lining',
    status: 'Pending',
    amount: 120.00
  }
]);

// Lifecycle hooks
onMounted(() => {
  // Initialize charts
  initOrdersChart();
  initMeasurementsChart();
  initServiceHistoryChart();
});

// Methods
function initOrdersChart() {
  const ctx = ordersChart.value.getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Orders',
        data: [2, 1, 3, 2, 4, 0],
        backgroundColor: '#3B82F6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function initMeasurementsChart() {
  const ctx = measurementsChart.value.getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Mar', 'May'],
      datasets: [
        {
          label: 'Chest',
          data: [42, 42, 43],
          borderColor: '#10B981',
          tension: 0.4
        },
        {
          label: 'Waist',
          data: [36, 35, 35],
          borderColor: '#3B82F6',
          tension: 0.4
        },
        {
          label: 'Shoulders',
          data: [18, 18, 18.5],
          borderColor: '#F59E0B',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function initServiceHistoryChart() {
  const ctx = serviceHistoryChart.value.getContext('2d');
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Suits', 'Shirts', 'Trousers', 'Alterations', 'Other'],
      datasets: [{
        data: [4, 3, 2, 2, 1],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#EC4899'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getStatusType(status) {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'In Progress':
      return 'primary';
    case 'Pending':
      return 'warning';
    case 'Cancelled':
      return 'danger';
    default:
      return 'info';
  }
}

function viewOrder(order) {
  // This would navigate to the order details page
  console.log('View order:', order);
}
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
