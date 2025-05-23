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
            <span class="text-xs">{{ scope.row.id.substring(0, 8) }}</span>
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