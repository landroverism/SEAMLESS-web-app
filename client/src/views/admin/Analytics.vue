<template>
  <div class="analytics-page">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-primary">Business Analytics</h1>
      <p class="text-gray-500">Track your business performance and make data-driven decisions</p>
    </div>
    
    <!-- Time Period Filter -->
    <div class="mb-6">
      <el-card shadow="hover" class="mb-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-grow">
            <h3 class="font-medium">Analytics Period</h3>
            <p class="text-sm text-gray-500">Select a time period to view analytics</p>
          </div>
          <div class="flex gap-3">
            <el-select v-model="timePeriod" class="w-40" @change="fetchAnalytics">
              <el-option label="Last 7 Days" value="7days" />
              <el-option label="Last 30 Days" value="30days" />
              <el-option label="Last 90 Days" value="90days" />
              <el-option label="This Year" value="year" />
              <el-option label="All Time" value="all" />
            </el-select>
            <el-date-picker
              v-if="timePeriod === 'custom'"
              v-model="dateRange"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              @change="fetchAnalytics"
            />
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- Analytics Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6" v-loading="overviewLoading">
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-blue-100">
            <shopping-bag-icon :size="24" class="text-blue-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Total Orders</p>
            <h3 class="text-2xl font-bold">{{ analyticsData.totalOrders || 0 }}</h3>
            <p class="text-xs" :class="getChangeClass(analyticsData.orderChange)">
              {{ formatChange(analyticsData.orderChange) }} from previous period
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-green-100">
            <dollar-sign-icon :size="24" class="text-green-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Total Revenue</p>
            <h3 class="text-2xl font-bold">${{ formatNumber(analyticsData.totalRevenue) }}</h3>
            <p class="text-xs" :class="getChangeClass(analyticsData.revenueChange)">
              {{ formatChange(analyticsData.revenueChange) }} from previous period
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-amber-100">
            <users-icon :size="24" class="text-amber-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">New Clients</p>
            <h3 class="text-2xl font-bold">{{ analyticsData.newClients || 0 }}</h3>
            <p class="text-xs" :class="getChangeClass(analyticsData.clientChange)">
              {{ formatChange(analyticsData.clientChange) }} from previous period
            </p>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-purple-100">
            <trending-up-icon :size="24" class="text-purple-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Avg. Order Value</p>
            <h3 class="text-2xl font-bold">${{ formatNumber(analyticsData.avgOrderValue) }}</h3>
            <p class="text-xs" :class="getChangeClass(analyticsData.avgOrderChange)">
              {{ formatChange(analyticsData.avgOrderChange) }} from previous period
            </p>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- Revenue Chart -->
    <el-card shadow="hover" class="mb-6" v-loading="revenueChartLoading">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-primary">Revenue Trend</h3>
          <el-select v-model="revenueChartPeriod" class="w-32" @change="fetchRevenueChart">
            <el-option label="Daily" value="daily" />
            <el-option label="Weekly" value="weekly" />
            <el-option label="Monthly" value="monthly" />
          </el-select>
        </div>
      </template>
      <div class="h-80">
        <canvas ref="revenueChartRef"></canvas>
      </div>
    </el-card>
    
    <!-- Order Status Distribution -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <el-card shadow="hover" v-loading="orderStatusLoading">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Order Status Distribution</h3>
        </template>
        <div class="h-80">
          <canvas ref="orderStatusChartRef"></canvas>
        </div>
      </el-card>
      
      <el-card shadow="hover" v-loading="topProductsLoading">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Top Products</h3>
        </template>
        <el-table :data="topProducts" style="width: 100%">
          <el-table-column label="Product" min-width="180">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                  <scissors-icon :size="16" class="text-gray-500" />
                </div>
                <div>{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="Orders" width="100" />
          <el-table-column label="Revenue" width="120">
            <template #default="scope">
              ${{ formatNumber(scope.row.revenue) }}
            </template>
          </el-table-column>
          <el-table-column label="Trend" width="120">
            <template #default="scope">
              <div class="flex items-center gap-1">
                <arrow-up-icon v-if="scope.row.trend > 0" class="text-green-500" :size="16" />
                <arrow-down-icon v-else-if="scope.row.trend < 0" class="text-red-500" :size="16" />
                <minus-icon v-else class="text-gray-500" :size="16" />
                <span :class="scope.row.trend > 0 ? 'text-green-500' : scope.row.trend < 0 ? 'text-red-500' : 'text-gray-500'">
                  {{ Math.abs(scope.row.trend) }}%
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- Client Acquisition and Retention -->
    <el-card shadow="hover" class="mb-6" v-loading="clientChartLoading">
      <template #header>
        <h3 class="text-lg font-bold text-primary">Client Acquisition & Retention</h3>
      </template>
      <div class="h-80">
        <canvas ref="clientChartRef"></canvas>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { 
  ShoppingBagIcon, 
  DollarSignIcon, 
  UsersIcon, 
  TrendingUpIcon,
  ScissorsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from 'lucide-vue-next';
import { analyticsService } from '@/services';
import Chart from 'chart.js/auto';

// State
const timePeriod = ref('30days');
const revenueChartPeriod = ref('daily');
const dateRange = ref([]);
const overviewLoading = ref(false);
const revenueChartLoading = ref(false);
const orderStatusLoading = ref(false);
const topProductsLoading = ref(false);
const clientChartLoading = ref(false);

const analyticsData = ref({
  totalOrders: 0,
  totalRevenue: 0,
  newClients: 0,
  avgOrderValue: 0,
  orderChange: 0,
  revenueChange: 0,
  clientChange: 0,
  avgOrderChange: 0
});

const topProducts = ref([]);

// Chart references
const revenueChartRef = ref(null);
const orderStatusChartRef = ref(null);
const clientChartRef = ref(null);

// Chart instances
let revenueChart = null;
let orderStatusChart = null;
let clientChart = null;

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchAnalytics(),
    fetchRevenueChart(),
    fetchOrderStatusChart(),
    fetchTopProducts(),
    fetchClientChart()
  ]);
});

// Watch for changes in chart references
watch(revenueChartRef, (newVal) => {
  if (newVal) {
    initRevenueChart();
  }
});

watch(orderStatusChartRef, (newVal) => {
  if (newVal) {
    initOrderStatusChart();
  }
});

watch(clientChartRef, (newVal) => {
  if (newVal) {
    initClientChart();
  }
});

// Methods
async function fetchAnalytics() {
  try {
    overviewLoading.value = true;
    
    const params = {
      period: timePeriod.value
    };
    
    if (timePeriod.value === 'custom' && dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await analyticsService.getDashboardAnalytics(params);
    
    if (response.data.success) {
      analyticsData.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  } finally {
    overviewLoading.value = false;
  }
}

async function fetchRevenueChart() {
  try {
    revenueChartLoading.value = true;
    
    const params = {
      period: timePeriod.value,
      interval: revenueChartPeriod.value
    };
    
    if (timePeriod.value === 'custom' && dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await analyticsService.getRevenueAnalytics(params);
    
    if (response.data.success) {
      updateRevenueChart(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
  } finally {
    revenueChartLoading.value = false;
  }
}

async function fetchOrderStatusChart() {
  try {
    orderStatusLoading.value = true;
    
    const params = {
      period: timePeriod.value
    };
    
    if (timePeriod.value === 'custom' && dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await analyticsService.getOrderStatusAnalytics(params);
    
    if (response.data.success) {
      updateOrderStatusChart(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching order status chart data:', error);
  } finally {
    orderStatusLoading.value = false;
  }
}

async function fetchTopProducts() {
  try {
    topProductsLoading.value = true;
    
    const params = {
      period: timePeriod.value,
      limit: 5
    };
    
    if (timePeriod.value === 'custom' && dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await analyticsService.getTopProducts(params);
    
    if (response.data.success) {
      topProducts.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching top products:', error);
  } finally {
    topProductsLoading.value = false;
  }
}

async function fetchClientChart() {
  try {
    clientChartLoading.value = true;
    
    const params = {
      period: timePeriod.value
    };
    
    if (timePeriod.value === 'custom' && dateRange.value?.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await analyticsService.getClientAnalytics(params);
    
    if (response.data.success) {
      updateClientChart(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching client chart data:', error);
  } finally {
    clientChartLoading.value = false;
  }
}

function initRevenueChart() {
  if (revenueChart) {
    revenueChart.destroy();
  }
  
  const ctx = revenueChartRef.value.getContext('2d');
  
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Revenue',
          data: [],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `$${formatNumber(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + formatNumber(value);
            }
          }
        }
      }
    }
  });
}

function updateRevenueChart(data) {
  if (!revenueChart) {
    return;
  }
  
  revenueChart.data.labels = data.labels;
  revenueChart.data.datasets[0].data = data.values;
  revenueChart.update();
}

function initOrderStatusChart() {
  if (orderStatusChart) {
    orderStatusChart.destroy();
  }
  
  const ctx = orderStatusChartRef.value.getContext('2d');
  
  orderStatusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            '#10B981', // completed
            '#3B82F6', // in_progress
            '#F59E0B', // pending
            '#EF4444'  // cancelled
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

function updateOrderStatusChart(data) {
  if (!orderStatusChart) {
    return;
  }
  
  orderStatusChart.data.labels = data.labels;
  orderStatusChart.data.datasets[0].data = data.values;
  orderStatusChart.update();
}

function initClientChart() {
  if (clientChart) {
    clientChart.destroy();
  }
  
  const ctx = clientChartRef.value.getContext('2d');
  
  clientChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'New Clients',
          data: [],
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Returning Clients',
          data: [],
          backgroundColor: '#10B981'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    }
  });
}

function updateClientChart(data) {
  if (!clientChart) {
    return;
  }
  
  clientChart.data.labels = data.labels;
  clientChart.data.datasets[0].data = data.new;
  clientChart.data.datasets[1].data = data.returning;
  clientChart.update();
}

function formatNumber(value) {
  if (value === undefined || value === null) return '0.00';
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatChange(value) {
  if (value === undefined || value === null) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}%`;
}

function getChangeClass(value) {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}
</script>

<style scoped>
.analytics-page {
  padding: 1rem;
}
</style>
