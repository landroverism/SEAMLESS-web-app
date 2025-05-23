<template>
  <div class="analytics-page">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-primary">Business Analytics</h1>
      <el-select v-model="timeRange" style="width: 150px">
        <el-option label="Last 7 days" value="7days" />
        <el-option label="Last 30 days" value="30days" />
        <el-option label="Last 90 days" value="90days" />
        <el-option label="This Year" value="year" />
        <el-option label="All Time" value="all" />
      </el-select>
    </div>
    
    <!-- Revenue & Orders Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <el-card shadow="hover">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Revenue Overview</h3>
        </template>
        <div class="h-80">
          <canvas ref="revenueChart"></canvas>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Orders Overview</h3>
        </template>
        <div class="h-80">
          <canvas ref="ordersChart"></canvas>
        </div>
      </el-card>
    </div>
    
    <!-- Service Popularity & Client Acquisition -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <el-card shadow="hover">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Service Popularity</h3>
        </template>
        <div class="h-80">
          <canvas ref="servicePopularityChart"></canvas>
        </div>
      </el-card>
      
      <el-card shadow="hover">
        <template #header>
          <h3 class="text-lg font-bold text-primary">Client Acquisition</h3>
        </template>
        <div class="h-80">
          <canvas ref="clientAcquisitionChart"></canvas>
        </div>
      </el-card>
    </div>
    
    <!-- Key Metrics Table -->
    <el-card shadow="hover">
      <template #header>
        <h3 class="text-lg font-bold text-primary">Key Performance Metrics</h3>
      </template>
      
      <el-table :data="performanceMetrics" style="width: 100%">
        <el-table-column prop="metric" label="Metric" />
        <el-table-column prop="value" label="Value" />
        <el-table-column prop="change" label="Change">
          <template #default="scope">
            <div class="flex items-center" :class="scope.row.change > 0 ? 'text-green-500' : 'text-red-500'">
              <span v-if="scope.row.change > 0">+</span>{{ scope.row.change }}%
              <arrow-up-icon v-if="scope.row.change > 0" :size="16" class="ml-1" />
              <arrow-down-icon v-else :size="16" class="ml-1" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="Target" />
        <el-table-column label="Status">
          <template #default="scope">
            <el-progress 
              :percentage="getProgressPercentage(scope.row)" 
              :status="getProgressStatus(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>