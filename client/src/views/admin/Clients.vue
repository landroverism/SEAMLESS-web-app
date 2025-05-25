<template>
  <div class="clients-page">
    <el-container>
      <!-- Main Content -->
      <el-main class="bg-gray-50 p-6">
        <div class="client-list-header mb-6 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-primary">Client Management</h1>
          <el-button type="primary">
            <plus-icon :size="18" class="mr-2" />
            Add New Client
          </el-button>
        </div>

        <!-- Search and Filter -->
        <el-card shadow="hover" class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-input
              v-model="searchQuery"
              placeholder="Search clients..."
              prefix-icon="Search"
              clearable
              class="search-box mobile-full-width"
            />
            <el-select
              v-model="filterStatus"
              placeholder="Filter by status"
              clearable
              class="w-full mobile-full-width"
            >
              <el-option label="Active" value="active" />
              <el-option label="Inactive" value="inactive" />
              <el-option label="New" value="new" />
            </el-select>
            <el-select
              v-model="sortBy"
              placeholder="Sort by"
              class="w-full mobile-full-width"
            >
              <el-option label="Name (A-Z)" value="name_asc" />
              <el-option label="Name (Z-A)" value="name_desc" />
              <el-option label="Recent Orders" value="recent_orders" />
              <el-option label="Total Spent" value="total_spent" />
            </el-select>
          </div>
        </el-card>

        <!-- Client List -->
        <el-card shadow="hover" class="mb-6">
          <el-table
            :data="filteredClients"
            style="width: 100%"
            @row-click="viewClientDetails"
          >
            <el-table-column label="Client" min-width="250">
              <template #default="scope">
                <div class="flex items-center gap-3">
                  <el-avatar :size="40" :src="scope.row.avatar" />
                  <div>
                    <div class="font-bold text-primary">{{ scope.row.name }}</div>
                    <div class="text-sm text-gray-500">{{ scope.row.email }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="Phone" width="150" />
            <el-table-column prop="orderCount" label="Orders" width="100" />
            <el-table-column prop="totalSpent" label="Total Spent" width="150">
              <template #default="scope">
                ${{ scope.row.totalSpent.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="lastOrder" label="Last Order" width="150" />
            <el-table-column prop="status" label="Status" width="120">
              <template #default="scope">
                <el-tag
                  :type="getStatusType(scope.row.status)"
                  size="small"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="120" fixed="right">
              <template #default="scope">
                <el-button-group>
                  <el-button type="primary" size="small" plain @click.stop="viewClientDetails(scope.row)">
                    <eye-icon :size="16" />
                  </el-button>
                  <el-button type="success" size="small" plain @click.stop="openMessageDialog(scope.row)">
                    <message-square-icon :size="16" />
                  </el-button>
                  <el-button type="warning" size="small" plain @click.stop="editClient(scope.row)">
                    <edit-icon :size="16" />
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="flex justify-center mt-4 overflow-x-auto py-2">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :layout="windowWidth <= 768 ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'"
              :total="totalClients"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              class="flex-wrap"
            />
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- Client Details Dialog -->
    <el-dialog
      v-model="clientDetailsVisible"
      title="Client Details"
      :width="windowWidth <= 768 ? '95%' : '70%'"
      class="client-details-dialog"
    >
      <div v-if="selectedClient">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Client Profile -->
          <div class="md:col-span-1">
            <el-card shadow="never" class="h-full">
              <div class="flex flex-col items-center text-center mb-6">
                <el-avatar :size="100" :src="selectedClient.avatar" class="mb-4" />
                <h3 class="text-xl font-bold text-primary">{{ selectedClient.name }}</h3>
                <p class="text-gray-500">Client since {{ selectedClient.joinDate }}</p>
                <div class="mt-4 flex gap-2">
                  <el-button type="primary" plain size="small">
                    <message-square-icon :size="16" class="mr-1" />
                    Message
                  </el-button>
                  <el-button type="success" plain size="small">
                    <phone-icon :size="16" class="mr-1" />
                    Call
                  </el-button>
                </div>
              </div>
              
              <div class="border-t pt-4">
                <h4 class="font-bold text-gray-700 mb-2">Contact Information</h4>
                <ul class="space-y-2">
                  <li class="flex items-center gap-2 text-gray-600">
                    <mail-icon :size="16" />
                    <span>{{ selectedClient.email }}</span>
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <phone-icon :size="16" />
                    <span>{{ selectedClient.phone }}</span>
                  </li>
                  <li class="flex items-center gap-2 text-gray-600">
                    <map-pin-icon :size="16" />
                    <span>{{ selectedClient.address }}</span>
                  </li>
                </ul>
              </div>
            </el-card>
          </div>
          
          <!-- Client Preferences and Requirements -->
          <div class="md:col-span-2">
            <el-tabs>
              <el-tab-pane label="Preferences & Requirements">
                <el-card shadow="never" class="mb-6">
                  <template #header>
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-bold text-primary">Client Preferences</h3>
                      <el-button type="primary" plain size="small">
                        <edit-icon :size="16" class="mr-1" />
                        Edit
                      </el-button>
                    </div>
                  </template>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 class="font-bold text-gray-700 mb-3">Style Preferences</h4>
                      <div class="space-y-2">
                        <div v-for="(preference, key) in selectedClient.preferences.style" :key="key" class="flex justify-between">
                          <span class="text-gray-600">{{ key }}</span>
                          <span class="font-medium">{{ preference }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 class="font-bold text-gray-700 mb-3">Fabric Preferences</h4>
                      <div class="space-y-2">
                        <div v-for="(preference, key) in selectedClient.preferences.fabric" :key="key" class="flex justify-between">
                          <span class="text-gray-600">{{ key }}</span>
                          <span class="font-medium">{{ preference }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-6">
                    <h4 class="font-bold text-gray-700 mb-3">Special Requirements</h4>
                    <el-input
                      type="textarea"
                      v-model="selectedClient.preferences.specialRequirements"
                      :rows="4"
                      readonly
                    />
                  </div>
                </el-card>
                
                <el-card shadow="never">
                  <template #header>
                    <div class="flex justify-between items-center">
                      <h3 class="text-lg font-bold text-primary">Measurements</h3>
                      <el-button type="primary" plain size="small">
                        <ruler-icon :size="16" class="mr-1" />
                        Update Measurements
                      </el-button>
                    </div>
                  </template>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="(value, key) in selectedClient.measurements" :key="key" class="border rounded p-3">
                      <div class="text-sm text-gray-500">{{ key }}</div>
                      <div class="font-bold text-lg">{{ value }}</div>
                    </div>
                  </div>
                  
                  <div class="mt-4 text-sm text-gray-500">
                    Last updated: {{ selectedClient.measurementsUpdated }}
                  </div>
                </el-card>
              </el-tab-pane>
              
              <el-tab-pane label="Order History">
                <el-table :data="selectedClient.orders" style="width: 100%">
                  <el-table-column prop="id" label="Order ID" width="120" />
                  <el-table-column prop="date" label="Date" width="120" />
                  <el-table-column prop="service" label="Service" />
                  <el-table-column prop="amount" label="Amount" width="120">
                    <template #default="scope">
                      ${{ scope.row.amount.toLocaleString() }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="Status" width="120">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)" size="small">
                        {{ scope.row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="100">
                    <template #default="scope">
                      <el-button type="primary" size="small" plain>
                        <eye-icon :size="16" />
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              
              <el-tab-pane label="Notes">
                <el-card shadow="never">
                  <div class="mb-4">
                    <el-input
                      v-model="newNote"
                      type="textarea"
                      :rows="3"
                      placeholder="Add a note about this client..."
                    />
                    <div class="mt-2 flex justify-end">
                      <el-button type="primary" @click="addNote">
                        <plus-icon :size="16" class="mr-1" />
                        Add Note
                      </el-button>
                    </div>
                  </div>
                  
                  <div v-if="selectedClient.notes.length === 0" class="text-center py-8 text-gray-500">
                    No notes yet. Add your first note about this client.
                  </div>
                  
                  <div v-else class="space-y-4">
                    <div v-for="(note, index) in selectedClient.notes" :key="index" class="border-b pb-4">
                      <div class="flex justify-between items-start mb-2">
                        <div class="font-bold text-primary">{{ note.author }}</div>
                        <div class="text-sm text-gray-500">{{ note.date }}</div>
                      </div>
                      <p class="text-gray-700">{{ note.content }}</p>
                    </div>
                  </div>
                </el-card>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Message Dialog -->
    <el-dialog
      v-model="messageDialogVisible"
      title="Send Message"
      width="40%"
    >
      <div v-if="selectedClient">
        <p class="mb-4">Send a message to {{ selectedClient.name }}</p>
        
        <el-form>
          <el-form-item label="Subject">
            <el-input v-model="messageForm.subject" placeholder="Message subject" />
          </el-form-item>
          
          <el-form-item label="Message">
            <el-input
              v-model="messageForm.content"
              type="textarea"
              :rows="5"
              placeholder="Type your message here..."
            />
          </el-form-item>
          
          <el-form-item label="Notification Method">
            <el-checkbox-group v-model="messageForm.methods">
              <el-checkbox label="email">Email</el-checkbox>
              <el-checkbox label="sms">SMS</el-checkbox>
              <el-checkbox label="app">App Notification</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="messageDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="sendMessage">Send Message</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  PlusIcon,
  EyeIcon,
  MessageSquareIcon,
  EditIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  RulerIcon
} from 'lucide-vue-next'

// Client list state
const searchQuery = ref('')
const filterStatus = ref('')
const sortBy = ref('name_asc')
const currentPage = ref(1)
const pageSize = ref(10)
const totalClients = ref(125)

// Mock client data
const clients = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+254 712 345 678',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    address: '123 Main St, Nairobi',
    orderCount: 8,
    totalSpent: 2450,
    lastOrder: '2025-05-10',
    status: 'active',
    joinDate: 'Jan 2024',
    preferences: {
      style: {
        'Fit': 'Slim fit',
        'Collar': 'Spread collar',
        'Cuffs': 'French cuffs',
        'Buttons': 'Mother of pearl'
      },
      fabric: {
        'Material': 'Egyptian cotton',
        'Weight': 'Medium',
        'Pattern': 'Solid colors',
        'Color Preference': 'Blues and whites'
      },
      specialRequirements: 'Allergic to wool. Prefers extra room in the shoulders due to athletic build.'
    },
    measurements: {
      'Neck': '16.5"',
      'Chest': '42"',
      'Waist': '34"',
      'Sleeve': '33"',
      'Shoulder': '18.5"',
      'Inseam': '32"',
      'Height': '6\'1"',
      'Weight': '185 lbs'
    },
    measurementsUpdated: '2025-04-12',
    orders: [
      { id: 'ORD-1234', date: '2025-05-10', service: 'Custom Suit', amount: 850, status: 'In Progress' },
      { id: 'ORD-1156', date: '2025-03-22', service: 'Shirt Tailoring', amount: 320, status: 'Completed' },
      { id: 'ORD-1089', date: '2025-02-15', service: 'Pants Alteration', amount: 180, status: 'Completed' }
    ],
    notes: [
      { author: 'Kelly Kevin', date: '2025-04-12', content: 'Client prefers appointments on weekends. Very particular about fabric quality.' },
      { author: 'Ann Njeru', date: '2025-03-15', content: 'Discussed potential wedding suit options for June 2025. Will follow up next month.' }
    ]
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+254 723 456 789',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    address: '456 Park Ave, Mombasa',
    orderCount: 5,
    totalSpent: 1850,
    lastOrder: '2025-05-14',
    status: 'active',
    joinDate: 'Mar 2024',
    preferences: {
      style: {
        'Fit': 'Regular fit',
        'Neckline': 'V-neck',
        'Sleeves': 'Three-quarter length',
        'Details': 'Minimal embellishments'
      },
      fabric: {
        'Material': 'Linen and cotton blends',
        'Weight': 'Light to medium',
        'Pattern': 'Subtle patterns',
        'Color Preference': 'Pastels and earth tones'
      },
      specialRequirements: 'Prefers sustainable and eco-friendly fabrics when available. Needs extra room in hip area.'
    },
    measurements: {
      'Bust': '36"',
      'Waist': '28"',
      'Hips': '38"',
      'Shoulder': '15"',
      'Arm Length': '22"',
      'Height': '5\'6"',
      'Weight': '135 lbs'
    },
    measurementsUpdated: '2025-05-01',
    orders: [
      { id: 'ORD-1233', date: '2025-05-14', service: 'Dress Alteration', amount: 420, status: 'Completed' },
      { id: 'ORD-1187', date: '2025-04-02', service: 'Blouse Tailoring', amount: 280, status: 'Completed' },
      { id: 'ORD-1122', date: '2025-03-10', service: 'Skirt Hemming', amount: 150, status: 'Completed' }
    ],
    notes: [
      { author: 'Ham Kemboi', date: '2025-05-14', content: 'Client very satisfied with recent dress alterations. Mentioned interest in custom summer dresses.' }
    ]
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+254 734 567 890',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    address: '789 Oak Rd, Kisumu',
    orderCount: 3,
    totalSpent: 1200,
    lastOrder: '2025-05-12',
    status: 'new',
    joinDate: 'Apr 2025',
    preferences: {
      style: {
        'Fit': 'Classic fit',
        'Collar': 'Button-down',
        'Cuffs': 'Regular cuffs',
        'Pockets': 'Standard pockets'
      },
      fabric: {
        'Material': 'Cotton and polyester blends',
        'Weight': 'Medium to heavy',
        'Pattern': 'Checks and stripes',
        'Color Preference': 'Blues, grays, and blacks'
      },
      specialRequirements: 'Needs extra length in shirts due to tall frame. Prefers reinforced stitching on pockets.'
    },
    measurements: {
      'Neck': '17"',
      'Chest': '44"',
      'Waist': '36"',
      'Sleeve': '35"',
      'Shoulder': '19"',
      'Inseam': '34"',
      'Height': '6\'3"',
      'Weight': '210 lbs'
    },
    measurementsUpdated: '2025-04-20',
    orders: [
      { id: 'ORD-1232', date: '2025-05-12', service: 'Wedding Suit', amount: 950, status: 'Pending' },
      { id: 'ORD-1198', date: '2025-04-18', service: 'Shirt Tailoring (3 shirts)', amount: 250, status: 'Completed' }
    ],
    notes: [
      { author: 'Kelly Kevin', date: '2025-05-12', content: 'Client is getting married on June 15th. Wedding suit must be ready by June 5th for final fitting.' }
    ]
  }
])

// Computed filtered clients
const filteredClients = computed(() => {
  let result = [...clients.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone.includes(query)
    )
  }
  
  // Apply status filter
  if (filterStatus.value) {
    result = result.filter(client => client.status === filterStatus.value)
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'recent_orders':
      result.sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime())
      break
    case 'total_spent':
      result.sort((a, b) => b.totalSpent - a.totalSpent)
      break
  }
  
  return result
})

// Client details state
const clientDetailsVisible = ref(false)
const selectedClient = ref(null)
const newNote = ref('')

// Message dialog state
const messageDialogVisible = ref(false)
const messageForm = ref({
  subject: '',
  content: '',
  methods: ['email']
})

// Methods
const handleSizeChange = (size: number) => {
  pageSize.value = size
  // In a real app, you would fetch data from the server here
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  // In a real app, you would fetch data from the server here
}

const getStatusType = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'info'
    case 'new':
      return 'primary'
    case 'in progress':
      return 'primary'
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'delayed':
      return 'danger'
    default:
      return 'info'
  }
}

const viewClientDetails = (client) => {
  selectedClient.value = client
  clientDetailsVisible.value = true
}

const editClient = (client) => {
  // In a real app, you would open an edit form
  console.log('Edit client:', client)
}

const openMessageDialog = (client) => {
  selectedClient.value = client
  messageDialogVisible.value = true
}

const sendMessage = () => {
  // In a real app, you would send the message to the client
  console.log('Sending message to client:', selectedClient.value?.name)
  console.log('Message:', messageForm.value)
  
  // Reset form and close dialog
  messageForm.value = {
    subject: '',
    content: '',
    methods: ['email']
  }
  messageDialogVisible.value = false
}

const addNote = () => {
  if (!newNote.value.trim() || !selectedClient.value) return
  
  selectedClient.value.notes.unshift({
    author: 'Kelly Kevin', // In a real app, this would be the current user
    date: new Date().toISOString().split('T')[0],
    content: newNote.value
  })
  
  newNote.value = ''
}

// Responsive window width detection
const windowWidth = ref(window.innerWidth)

// Update window width on resize
function handleResize() {
  windowWidth.value = window.innerWidth
}

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.el-main {
  padding: 20px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .el-main {
    padding: 12px;
  }
  
  .el-table {
    font-size: 0.875rem;
  }
  
  .el-pagination {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .client-details-dialog .el-tabs__item {
    padding: 0 10px;
    font-size: 0.875rem;
  }
  
  /* Improve touch targets */
  .el-button {
    min-height: 36px;
    min-width: 36px;
  }
  
  /* Ensure buttons in groups are easier to tap */
  .el-button-group .el-button {
    margin-right: 2px;
  }
}
</style>
