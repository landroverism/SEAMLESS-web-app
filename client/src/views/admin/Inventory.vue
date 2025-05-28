<template>
  <div class="inventory-page">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Inventory Management</h1>
      <el-button type="primary" @click="showAddMaterialDialog">Add New Material</el-button>
    </div>
    
    <!-- Inventory Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" v-loading="overviewLoading">
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-blue-100">
            <package-icon :size="24" class="text-blue-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Total Materials</p>
            <h3 class="text-2xl font-bold">{{ inventoryStats.total || 0 }}</h3>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-amber-100">
            <alert-triangle-icon :size="24" class="text-amber-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Low Stock Items</p>
            <h3 class="text-2xl font-bold">{{ inventoryStats.lowStock || 0 }}</h3>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-full bg-green-100">
            <dollar-sign-icon :size="24" class="text-green-500" />
          </div>
          <div>
            <p class="text-gray-500 text-sm">Total Value</p>
            <h3 class="text-2xl font-bold">${{ inventoryStats.totalValue?.toFixed(2) || '0.00' }}</h3>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- Inventory Table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-primary">Materials Inventory</h3>
          <div class="flex gap-2">
            <el-input 
              placeholder="Search materials..." 
              prefix-icon="Search" 
              v-model="searchQuery" 
              style="width: 250px" 
              @input="fetchInventory"
            />
            <el-select 
              placeholder="Category" 
              v-model="filterCategory" 
              clearable 
              style="width: 150px"
              @change="fetchInventory"
            >
              <el-option label="All" value="" />
              <el-option label="Fabrics" value="fabrics" />
              <el-option label="Threads" value="threads" />
              <el-option label="Buttons" value="buttons" />
              <el-option label="Zippers" value="zippers" />
              <el-option label="Accessories" value="accessories" />
            </el-select>
            <el-checkbox v-model="showLowStock" @change="fetchInventory">Low Stock Only</el-checkbox>
          </div>
        </div>
      </template>
      
      <el-table :data="inventoryItems" style="width: 100%" v-loading="tableLoading">
        <el-table-column label="ID" width="80">
          <template #default="scope">
            <span class="text-xs">{{ scope.row.id ? scope.row.id.substring(0, 8) : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Material" min-width="200">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                <package-icon :size="20" class="text-gray-500" />
              </div>
              <div>
                <div class="font-medium">{{ scope.row.name }}</div>
                <div class="text-xs text-gray-500">{{ capitalizeCategory(scope.row.category) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" show-overflow-tooltip />
        <el-table-column label="Quantity" width="120">
          <template #default="scope">
            {{ scope.row.quantity }} {{ scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="Price" width="100">
          <template #default="scope">
            ${{ Number(scope.row.price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="Stock Status" width="120">
          <template #default="scope">
            <el-tag :type="getStockStatusType(scope.row)">
              {{ getStockStatus(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="updateStock(scope.row)">
                <plus-icon :size="16" />
              </el-button>
              <el-button type="warning" size="small" @click="editMaterial(scope.row)">
                <edit-icon :size="16" />
              </el-button>
              <el-button type="danger" size="small" @click="deleteMaterial(scope.row)">
                <trash-icon :size="16" />
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
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- Add/Edit Material Dialog -->
    <el-dialog 
      v-model="materialFormVisible" 
      :title="isEditMode ? 'Edit Material' : 'Add New Material'" 
      width="60%"
    >
      <el-form 
        ref="materialFormRef"
        :model="materialForm" 
        :rules="materialFormRules"
        label-position="top"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <el-form-item label="Name" prop="name">
            <el-input v-model="materialForm.name" />
          </el-form-item>
          
          <el-form-item label="Category" prop="category">
            <el-select v-model="materialForm.category" class="w-full">
              <el-option label="Fabrics" value="fabrics" />
              <el-option label="Threads" value="threads" />
              <el-option label="Buttons" value="buttons" />
              <el-option label="Zippers" value="zippers" />
              <el-option label="Accessories" value="accessories" />
            </el-select>
          </el-form-item>
        </div>
        
        <el-form-item label="Description">
          <el-input type="textarea" v-model="materialForm.description" rows="3" />
        </el-form-item>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <el-form-item label="Quantity" prop="quantity">
            <el-input-number v-model="materialForm.quantity" :min="0" class="w-full" />
          </el-form-item>
          
          <el-form-item label="Unit" prop="unit">
            <el-select v-model="materialForm.unit" class="w-full">
              <el-option label="Meters" value="meters" />
              <el-option label="Yards" value="yards" />
              <el-option label="Pieces" value="pieces" />
              <el-option label="Spools" value="spools" />
              <el-option label="Packs" value="packs" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Price" prop="price">
            <el-input-number v-model="materialForm.price" :min="0" :precision="2" :step="1" class="w-full" />
          </el-form-item>
        </div>
        
        <el-form-item label="Minimum Quantity" prop="min_quantity">
          <el-input-number 
            v-model="materialForm.min_quantity" 
            :min="0" 
            class="w-full"
            :max="materialForm.quantity"
          />
          <div class="text-xs text-gray-500 mt-1">You'll receive alerts when stock falls below this level</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="materialFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitMaterialForm" :loading="formLoading">
          {{ isEditMode ? 'Update Material' : 'Add Material' }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- Update Stock Dialog -->
    <el-dialog v-model="stockUpdateVisible" title="Update Stock" width="40%">
      <div v-if="selectedMaterial" class="mb-4">
        <h3 class="font-medium">{{ selectedMaterial.name }}</h3>
        <p class="text-sm text-gray-500">Current stock: {{ selectedMaterial.quantity }} {{ selectedMaterial.unit }}</p>
      </div>
      
      <el-form :model="stockForm" label-position="top">
        <el-form-item label="Operation">
          <el-radio-group v-model="stockForm.operation">
            <el-radio label="add">Add Stock</el-radio>
            <el-radio label="subtract">Remove Stock</el-radio>
            <el-radio label="set">Set Exact Amount</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="Quantity">
          <el-input-number 
            v-model="stockForm.quantity" 
            :min="stockForm.operation === 'subtract' ? 1 : 0" 
            :max="stockForm.operation === 'subtract' ? selectedMaterial?.quantity : undefined"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="stockUpdateVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmStockUpdate" :loading="updateLoading">Update Stock</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessageBox } from 'element-plus';
import notificationService from '@/services/notification.service';
import { 
  PackageIcon, 
  AlertTriangleIcon, 
  DollarSignIcon,
  PlusIcon, 
  EditIcon, 
  TrashIcon 
} from 'lucide-vue-next';
import { inventoryService } from '@/services';

// State
const tableLoading = ref(false);
const overviewLoading = ref(false);
const updateLoading = ref(false);
const formLoading = ref(false);
const inventoryItems = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterCategory = ref('');
const showLowStock = ref(false);
const materialFormVisible = ref(false);
const stockUpdateVisible = ref(false);
const selectedMaterial = ref(null);
const isEditMode = ref(false);
const inventoryStats = ref({
  total: 0,
  lowStock: 0,
  totalValue: 0
});

// Form models
const materialForm = reactive({
  name: '',
  category: 'fabrics',
  description: '',
  quantity: 0,
  unit: 'meters',
  price: 0,
  min_quantity: 0
});

const materialFormRules = {
  name: [{ required: true, message: 'Please enter a name', trigger: 'blur' }],
  category: [{ required: true, message: 'Please select a category', trigger: 'change' }],
  quantity: [{ required: true, message: 'Please enter a quantity', trigger: 'blur' }],
  unit: [{ required: true, message: 'Please select a unit', trigger: 'change' }],
  price: [{ required: true, message: 'Please enter a price', trigger: 'blur' }],
  min_quantity: [{ required: true, message: 'Please enter a minimum quantity', trigger: 'blur' }]
};

const stockForm = reactive({
  operation: 'add',
  quantity: 1
});

const materialFormRef = ref(null);

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([
    fetchInventory(),
    fetchInventoryStats()
  ]);
});

// Methods
async function fetchInventory() {
  try {
    tableLoading.value = true;
    
    // Build query parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: 'name',
      sort_order: 'asc'
    };
    
    // Add filters if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    if (filterCategory.value) {
      params.category = filterCategory.value;
    }
    
    if (showLowStock.value) {
      params.low_stock = true;
    }
    
    const response = await inventoryService.getAllInventoryItems(params);
    
    if (response.data.success) {
      inventoryItems.value = response.data.data.items;
      totalItems.value = response.data.data.pagination.total;
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    notificationService.error('Failed to load inventory. Please try again.', 3000);
  } finally {
    tableLoading.value = false;
  }
}

async function fetchInventoryStats() {
  try {
    overviewLoading.value = true;
    
    // Get total inventory count
    const countResponse = await inventoryService.getAllInventoryItems({
      limit: 1,
      page: 1
    });
    
    if (countResponse.data.success) {
      inventoryStats.value.total = countResponse.data.data.pagination.total;
    }
    
    // Get low stock items
    const lowStockResponse = await inventoryService.getLowStockItems();
    
    if (lowStockResponse.data.success) {
      inventoryStats.value.lowStock = lowStockResponse.data.data.length;
    }
    
    // Get total inventory value
    const valueResponse = await inventoryService.getTotalInventoryValue();
    
    if (valueResponse.data.success) {
      inventoryStats.value.totalValue = valueResponse.data.data.total_value;
    }
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    notificationService.error('Failed to load inventory statistics.', 3000);
  } finally {
    overviewLoading.value = false;
  }
}

function capitalizeCategory(category) {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getStockStatus(item) {
  if (item.quantity <= 0) {
    return 'Out of Stock';
  } else if (item.quantity < item.min_quantity) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

function getStockStatusType(item) {
  if (item.quantity <= 0) {
    return 'danger';
  } else if (item.quantity < item.min_quantity) {
    return 'warning';
  } else {
    return 'success';
  }
}

function handleSizeChange(val) {
  pageSize.value = val;
  fetchInventory();
}

function handleCurrentChange(val) {
  currentPage.value = val;
  fetchInventory();
}

function showAddMaterialDialog() {
  isEditMode.value = false;
  
  // Reset form
  Object.assign(materialForm, {
    name: '',
    category: 'fabrics',
    description: '',
    quantity: 0,
    unit: 'meters',
    price: 0,
    min_quantity: 0
  });
  
  materialFormVisible.value = true;
}

function editMaterial(material) {
  isEditMode.value = true;
  selectedMaterial.value = material;
  
  // Populate form with material data
  Object.assign(materialForm, {
    name: material.name,
    category: material.category,
    description: material.description || '',
    quantity: Number(material.quantity),
    unit: material.unit,
    price: Number(material.price),
    min_quantity: Number(material.min_quantity)
  });
  
  materialFormVisible.value = true;
}

async function submitMaterialForm() {
  if (!materialFormRef.value) return;
  
  try {
    await materialFormRef.value.validate();
    
    formLoading.value = true;
    
    let response;
    
    if (isEditMode.value) {
      response = await inventoryService.updateInventoryItem(selectedMaterial.value.id, materialForm);
    } else {
      response = await inventoryService.createInventoryItem(materialForm);
    }
    
    if (response.data.success) {
      notificationService.success(
        isEditMode.value 
          ? 'Material updated successfully' 
          : 'Material added successfully',
        3000
      );
      materialFormVisible.value = false;
      
      // Refresh the inventory list and stats
      await Promise.all([
        fetchInventory(),
        fetchInventoryStats()
      ]);
    }
  } catch (error) {
    if (error.message) {
      notificationService.error(error.message, 3000);
    } else {
      console.error('Error submitting material form:', error);
      notificationService.error('Failed to save material. Please try again.', 3000);
    }
  } finally {
    formLoading.value = false;
  }
}

function updateStock(material) {
  selectedMaterial.value = material;
  stockForm.operation = 'add';
  stockForm.quantity = 1;
  stockUpdateVisible.value = true;
}

async function confirmStockUpdate() {
  try {
    updateLoading.value = true;
    
    if (!selectedMaterial.value) {
      notificationService.error('No material selected', 3000);
      return;
    }
    
    const response = await inventoryService.updateInventoryQuantity(
      selectedMaterial.value.id,
      stockForm.quantity,
      stockForm.operation
    );
    
    if (response.data.success) {
      notificationService.success('Stock updated successfully', 3000);
      stockUpdateVisible.value = false;
      
      // Refresh the inventory list and stats
      await Promise.all([
        fetchInventory(),
        fetchInventoryStats()
      ]);
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    notificationService.error('Failed to update stock. Please try again.', 3000);
  } finally {
    updateLoading.value = false;
  }
}

async function deleteMaterial(material) {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this material? This action cannot be undone.',
      'Delete Material',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    );
    
    const response = await inventoryService.deleteInventoryItem(material.id);
    
    if (response.data.success) {
      notificationService.success('Material deleted successfully', 3000);
      
      // Refresh the inventory list and stats
      await Promise.all([
        fetchInventory(),
        fetchInventoryStats()
      ]);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting material:', error);
      notificationService.error('Failed to delete material. Please try again.', 3000);
    }
  }
}
</script>

<style scoped>
.inventory-page {
  padding: 1rem;
}
</style>
