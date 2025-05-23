<template>
  <div class="orders-page">
    <!-- Order Filtering & Search -->
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Order Management</h1>
      <el-button type="primary" @click="showCreateOrderDialog">Create New Order</el-button>
    </div>
    
    <!-- Filters and Search -->
    <el-card shadow="hover" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <el-input placeholder="Search orders..." prefix-icon="Search" v-model="searchQuery" @input="fetchOrders" />
        <el-select placeholder="Status" v-model="filterStatus" clearable @change="fetchOrders">
          <el-option label="All" value="" />
          <el-option label="Pending" value="pending" />
          <el-option label="In Progress" value="in_progress" />
          <el-option label="Ready for Fitting" value="ready_for_fitting" />
          <el-option label="Completed" value="completed" />
          <el-option label="Cancelled" value="cancelled" />
        </el-select>
        <el-date-picker type="daterange" v-model="dateRange" start-placeholder="Start Date" end-placeholder="End Date" @change="fetchOrders" />
        <el-select placeholder="Sort by" v-model="sortBy" @change="fetchOrders">
          <el-option label="Newest First" value="created_at:desc" />
          <el-option label="Oldest First" value="created_at:asc" />
          <el-option label="Due Date (Soonest)" value="due_date:asc" />
          <el-option label="Amount (Highest)" value="amount:desc" />
        </el-select>
      </div>
    </el-card>
    
    <!-- Orders Table -->
    <el-card shadow="hover">
      <el-table :data="filteredOrders" style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="id" label="Order ID" width="120">
          <template #default="scope">
            <span class="text-xs">{{ scope.row.id.substring(0, 8) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Client" width="200">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <el-avatar :size="32" icon="UserIcon" />
              <div>
                <div class="font-medium">{{ scope.row.clients?.name || 'Unknown' }}</div>
                <div class="text-xs text-gray-500">{{ scope.row.clients?.email || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="service" label="Service" />
        <el-table-column label="Order Date" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Due Date" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.due_date) }}
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="120">
          <template #default="scope">
            ${{ Number(scope.row.amount).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ formatStatus(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">
                <eye-icon :size="16" />
              </el-button>
              <el-button type="success" size="small" @click="updateStatus(scope.row)">
                <check-circle-icon :size="16" />
              </el-button>
              <el-button type="warning" size="small" @click="editOrder(scope.row)">
                <edit-icon :size="16" />
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="flex justify-center mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- Order Details Dialog -->
    <el-dialog v-model="orderDetailsVisible" title="Order Details" width="70%">
      <div v-if="selectedOrder" class="order-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Order ID">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="getStatusType(selectedOrder.status)">{{ formatStatus(selectedOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Client">
            {{ selectedOrder.clients?.name || 'Unknown' }}
          </el-descriptions-item>
          <el-descriptions-item label="Contact">
            {{ selectedOrder.clients?.email || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Service">{{ selectedOrder.service }}</el-descriptions-item>
          <el-descriptions-item label="Amount">${{ Number(selectedOrder.amount).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="Order Date">{{ formatDate(selectedOrder.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="Due Date">{{ formatDate(selectedOrder.due_date) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="mt-6">
          <h3 class="text-lg font-medium mb-2">Description</h3>
          <p class="bg-gray-50 p-4 rounded">{{ selectedOrder.description || 'No description provided.' }}</p>
        </div>
        
        <div class="mt-6" v-if="selectedOrder.notes">
          <h3 class="text-lg font-medium mb-2">Notes</h3>
          <p class="bg-gray-50 p-4 rounded">{{ selectedOrder.notes }}</p>
        </div>
        
        <div class="mt-6" v-if="selectedOrder.clients?.measurements && Object.keys(selectedOrder.clients.measurements).length > 0">
          <h3 class="text-lg font-medium mb-2">Client Measurements</h3>
          <el-table :data="Object.entries(selectedOrder.clients.measurements).map(([key, value]) => ({ key, value }))">
            <el-table-column label="Measurement" prop="key">
              <template #default="scope">
                {{ formatMeasurementLabel(scope.row.key) }}
              </template>
            </el-table-column>
            <el-table-column label="Value" prop="value" />
          </el-table>
        </div>
      </div>
    </el-dialog>
    
    <!-- Status Update Dialog -->
    <el-dialog v-model="statusUpdateVisible" title="Update Order Status" width="40%">
      <el-form :model="statusForm" label-position="top">
        <el-form-item label="Current Status">
          <el-tag :type="getStatusType(selectedOrder?.status || '')">
            {{ formatStatus(selectedOrder?.status || '') }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="New Status">
          <el-select v-model="statusForm.status" class="w-full">
            <el-option label="Pending" value="pending" />
            <el-option label="In Progress" value="in_progress" />
            <el-option label="Ready for Fitting" value="ready_for_fitting" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Notes">
          <el-input type="textarea" v-model="statusForm.notes" rows="3" />
        </el-form-item>
        
        <el-form-item label="Notify Client">
          <el-switch v-model="statusForm.notifyClient" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="statusUpdateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmStatusUpdate" :loading="updateLoading">Update Status</el-button>
      </template>
    </el-dialog>
    
    <!-- Order Form Dialog -->
    <el-dialog 
      v-model="orderFormVisible" 
      :title="isEditMode ? 'Edit Order' : 'Create New Order'" 
      width="60%"
    >
      <el-form 
        ref="orderFormRef"
        :model="orderForm" 
        :rules="orderFormRules"
        label-position="top"
      >
        <el-form-item label="Client" prop="client_id">
          <el-select v-model="orderForm.client_id" class="w-full" filterable>
            <el-option 
              v-for="client in clients" 
              :key="client.id" 
              :label="client.name" 
              :value="client.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Service" prop="service">
          <el-input v-model="orderForm.service" />
        </el-form-item>
        
        <el-form-item label="Description">
          <el-input type="textarea" v-model="orderForm.description" rows="3" />
        </el-form-item>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <el-form-item label="Amount" prop="amount">
            <el-input-number v-model="orderForm.amount" :min="0" :precision="2" :step="10" class="w-full" />
          </el-form-item>
          
          <el-form-item label="Status" prop="status">
            <el-select v-model="orderForm.status" class="w-full">
              <el-option label="Pending" value="pending" />
              <el-option label="In Progress" value="in_progress" />
              <el-option label="Ready for Fitting" value="ready_for_fitting" />
              <el-option label="Completed" value="completed" />
              <el-option label="Cancelled" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Due Date" prop="due_date">
            <el-date-picker v-model="orderForm.due_date" type="date" class="w-full" />
          </el-form-item>
        </div>
        
        <el-form-item label="Notes">
          <el-input type="textarea" v-model="orderForm.notes" rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="orderFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitOrderForm" :loading="formLoading">
          {{ isEditMode ? 'Update Order' : 'Create Order' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
  <div class="orders-page">
    <!-- Order Filtering & Search -->
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Order Management</h1>
      <el-button type="primary">Create New Order</el-button>
    </div>
    
    <!-- Filters and Search -->
    <el-card shadow="hover" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <el-input placeholder="Search orders..." prefix-icon="Search" v-model="searchQuery" />
        <el-select placeholder="Status" v-model="filterStatus" clearable>
          <el-option label="All" value="" />
          <el-option label="Pending" value="pending" />
          <el-option label="In Progress" value="in-progress" />
          <el-option label="Completed" value="completed" />
          <el-option label="Delayed" value="delayed" />
        </el-select>
        <el-date-picker type="daterange" v-model="dateRange" start-placeholder="Start Date" end-placeholder="End Date" />
        <el-select placeholder="Sort by" v-model="sortBy">
          <el-option label="Newest First" value="date-desc" />
          <el-option label="Oldest First" value="date-asc" />
          <el-option label="Due Date (Soonest)" value="due-asc" />
          <el-option label="Amount (Highest)" value="amount-desc" />
        </el-select>
      </div>
    </el-card>
    
    <!-- Orders Table -->
    <el-card shadow="hover">
      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="id" label="Order ID" width="120" />
        <el-table-column label="Client" width="200">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <el-avatar :size="32" :src="scope.row.clientAvatar" />
              <div>
                <div class="font-medium">{{ scope.row.clientName }}</div>
                <div class="text-xs text-gray-500">{{ scope.row.clientEmail }}</div>
              </div>
            </div>
          </template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
        </el-table-column>
        <el-table-column prop="service" label="Service" />
        <el-table-column prop="date" label="Order Date" width="120" />
        <el-table-column prop="dueDate" label="Due Date" width="120" />
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="scope">
            ${{ scope.row.amount.toLocaleString() }}
          </template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">
                <eye-icon :size="16" />
              </el-button>
              <el-button type="success" size="small" @click="updateStatus(scope.row)">
                <check-circle-icon :size="16" />
              </el-button>
              <el-button type="warning" size="small" @click="editOrder(scope.row)">
                <edit-icon :size="16" />
              </el-button>
            </el-button-group>
          </template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
        </el-table-column>
      </el-table>
      
      <div class="flex justify-center mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
        />
      </div>
    </el-card>
    
    <!-- Order Details Dialog -->
    <el-dialog v-model="orderDetailsVisible" title="Order Details" width="70%">
      <!-- Order details content here -->
    </el-dialog>
    
    <!-- Status Update Dialog -->
    <el-dialog v-model="statusUpdateVisible" title="Update Order Status" width="40%">
      <el-form :model="statusForm" label-position="top">
        <el-form-item label="Current Status">
          <el-tag :type="getStatusType(selectedOrder?.status || '')">
            {{ selectedOrder?.status }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="New Status">
          <el-select v-model="statusForm.status" class="w-full">
            <el-option label="Pending" value="Pending" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
            <el-option label="Delayed" value="Delayed" />
            <el-option label="Cancelled" value="Cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Notes">
          <el-input type="textarea" v-model="statusForm.notes" rows="3" />
        </el-form-item>
        
        <el-form-item label="Notify Client">
          <el-switch v-model="statusForm.notifyClient" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="statusUpdateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmStatusUpdate">Update Status</el-button>
      </template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { EyeIcon, CheckCircleIcon, EditIcon, UserIcon } from 'lucide-vue-next';
import { ordersService, clientsService } from '@/services';
import { format } from 'date-fns';

// State
const loading = ref(true);
const tableLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const orders = ref([]);
const clients = ref([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortBy = ref('created_at:desc');
const orderDetailsVisible = ref(false);
const statusUpdateVisible = ref(false);
const orderFormVisible = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);

// Form models
const statusForm = reactive({
  status: '',
  notes: '',
  notifyClient: true
});

const orderForm = reactive({
  client_id: '',
  service: '',
  description: '',
  amount: 0,
  status: 'pending',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date: 1 week from now
  notes: ''
});

const orderFormRules = {
  client_id: [{ required: true, message: 'Please select a client', trigger: 'change' }],
  service: [{ required: true, message: 'Please enter a service', trigger: 'blur' }],
  amount: [{ required: true, message: 'Please enter an amount', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  due_date: [{ required: true, message: 'Please select a due date', trigger: 'change' }]
};

const orderFormRef = ref(null);

// Computed properties
const filteredOrders = computed(() => {
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchClients()
  ]);
});

// Methods
async function fetchOrders() {
  try {
    loading.value = true;
    tableLoading.value = true;
    
    // Parse sort field and direction
    const [sortField, sortOrder] = sortBy.value.split(':');
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField,
      sort_order: sortOrder
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString();
      params.end_date = dateRange.value[1].toISOString();
    }
    
    const response = await ordersService.getAllOrders(params);
    
    if (response.data.success) {
      orders.value = response.data.data.orders;
      totalOrders.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('Failed to load orders. Please try again.');
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
}

async function fetchClients() {
  try {
    const response = await clientsService.getAllClients();
    
    if (response.data.success) {
      clients.value = response.data.data.clients;
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    ElMessage.error('Failed to load clients. Please try again.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMeasurementLabel(key) {
  // Convert snake_case or camelCase to Title Case
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusType(status) {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    ready_for_fitting: 'info',
    completed: 'success',
    cancelled: 'danger'
  };
  
  return statusMap[status] || 'info';
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchOrders();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchOrders();
}

function viewOrder(order) {
  selectedOrder.value = order;
  orderDetailsVisible.value = true;
}

function updateStatus(order) {
  selectedOrder.value = order;
  statusForm.status = order.status;
  statusForm.notes = '';
  statusUpdateVisible.value = true;
}

async function confirmStatusUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedOrder.value) {
      ElMessage.error('No order selected');
      return;
    }
    
    const response = await ordersService.updateOrderStatus(
      selectedOrder.value.id,
      statusForm.status
    );
    
    if (response.data.success) {
      ElMessage.success('Order status updated successfully');
      statusUpdateVisible.value = false;
      
      // Update the order in the list
      const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].status = statusForm.status;
      }
      
      // If we're viewing the order details, update that too
      if (selectedOrder.value) {
        selectedOrder.value.status = statusForm.status;
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    ElMessage.error('Failed to update order status. Please try again.');
  } finally {
    updateLoading.value = false;
  }
}

function showCreateOrderDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(orderForm, {
    client_id: '',
    service: '',
    description: '',
    amount: 0,
    status: 'pending',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: ''
  });
  
  orderFormVisible.value = true;
}

function editOrder(order) {
  isEditMode.value = true;
  selectedOrder.value = order;
  
  // Populate form with order data
  Object.assign(orderForm, {
    client_id: order.client_id,
    service: order.service,
    description: order.description || '',
    amount: Number(order.amount),
    status: order.status,
    due_date: new Date(order.due_date),
    notes: order.notes || ''
  });
  
  orderFormVisible.value = true;
}

async function submitOrderForm() {
  if (!orderFormRef.value) return;
  
  try {
    await orderFormRef.value.validate();
    
    formLoading.value = true;
    
    // Format due date
    const formData = {
      ...orderForm,
      due_date: new Date(orderForm.due_date).toISOString()
    };
    
    let response;
    
    if (isEditMode.value) {
      response = await ordersService.updateOrder(selectedOrder.value.id, formData);
    } else {
      response = await ordersService.createOrder(formData);
    }
    
    if (response.data.success) {
      ElMessage.success(
        isEditMode.value 
          ? 'Order updated successfully' 
          : 'Order created successfully'
      );
      orderFormVisible.value = false;
      fetchOrders(); // Refresh the orders list
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message);
    } else {
      console.error('Error submitting order form:', error);
      ElMessage.error('Failed to save order. Please try again.');
    }
  } finally {
    formLoading.value = false;
  }
}
</script>

<style scoped>
.orders-page {
  padding: 1rem;
}

.order-details {
  max-height: 70vh;
  overflow-y: auto;
}
</style>