<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Icon name="heroicons:shield-check" class="w-6 h-6 mr-3" color="blue-600" />
            <div>
              <h1 class="text-xl font-bold text-slate-900">VA Knowledge Base Admin</h1>
              <p class="text-sm text-slate-500">Manage documents and analytics</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-slate-900">{{ adminUser.username }}</p>
              <p class="text-xs text-slate-500">Administrator</p>
            </div>
            <Button @click="handleLogout" variant="secondary">
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <Icon name="document-text" class="w-6 h-6" color="blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Total Documents</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.documents || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <Icon name="chart-bar" class="w-6 h-6" color="green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Knowledge Chunks</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.chunks || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-amber-100 rounded-lg">
              <Icon name="magnifying-glass" class="w-6 h-6" color="amber-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Searches Today</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.searchesToday || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <Icon name="users" class="w-6 h-6" color="red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Active Users</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.activeUsers || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            @click="navigateTo('/admin/documents/upload')"
            variant="primary"
            class="flex items-center justify-center p-4 h-auto"
          >
            <Icon name="cloud-arrow-up" class="w-5 h-5 mr-3" />
            <div class="text-left">
              <div class="font-medium">Upload Documents</div>
              <div class="text-sm opacity-90">Add new VA references</div>
            </div>
          </Button>

          <Button 
            @click="navigateTo('/admin/documents')"
            variant="secondary"
            class="flex items-center justify-center p-4 h-auto"
          >
            <Icon name="folder-open" class="w-5 h-5 mr-3" />
            <div class="text-left">
              <div class="font-medium">Manage Documents</div>
              <div class="text-sm opacity-90">View and edit knowledge base</div>
            </div>
          </Button>

          <Button 
            @click="navigateTo('/admin/analytics')"
            variant="secondary"
            class="flex items-center justify-center p-4 h-auto"
          >
            <Icon name="chart-pie" class="w-5 h-5 mr-3" />
            <div class="text-left">
              <div class="font-medium">View Analytics</div>
              <div class="text-sm opacity-90">Usage and performance data</div>
            </div>
          </Button>
        </div>
      </div>

      <!-- Document Types Overview -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Knowledge Base Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(type, key) in documentTypes" 
            :key="key"
            class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <Icon :name="type.icon" class="w-5 h-5 mr-3" :color="type.color" />
                <span class="font-medium text-slate-900">{{ type.name }}</span>
              </div>
              <Badge :variant="getBadgeVariant(type.count)" class="w-4 h-4">
                {{ type.count }}
              </Badge>
            </div>
            <p class="text-sm text-slate-500">{{ type.description }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div class="space-y-3">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="flex items-center p-3 bg-slate-50 rounded-lg"
          >
            <Icon :name="activity.icon" class="w-4 h-4 mr-3" :color="activity.color" />
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-900">{{ activity.action }}</p>
              <p class="text-xs text-slate-500">{{ activity.timestamp }}</p>
            </div>
            <Badge :variant="activity.status" class="w-3 h-3">
              {{ activity.status }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'
import Badge from '~/components/atoms/Badge.vue'

// Head
useHead({
  title: 'Admin Dashboard - FormReady',
  meta: [
    { name: 'description', content: 'VA Knowledge Base administration dashboard' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()

// Admin user state
const adminUser = reactive({
  username: '',
  loginTime: ''
})

// Stats
const stats = reactive({
  documents: 0,
  chunks: 0,
  searchesToday: 0,
  activeUsers: 0
})

// Document types
const documentTypes = reactive({
  CFR38: {
    name: 'CFR 38',
    description: 'Code of Federal Regulations',
    icon: 'document-text',
    color: 'blue-600',
    count: 0
  },
  DSM5: {
    name: 'DSM-5',
    description: 'Diagnostic criteria',
    icon: 'heart',
    color: 'red-600',
    count: 0
  },
  BVA: {
    name: 'BVA Cases',
    description: 'Board of Veterans Appeals',
    icon: 'scale',
    color: 'green-600',
    count: 0
  },
  CAVC: {
    name: 'CAVC Cases',
    description: 'Court of Appeals',
    icon: 'building-library',
    color: 'amber-600',
    count: 0
  },
  VHA: {
    name: 'VHA Handbooks',
    description: 'Treatment guidelines',
    icon: 'medical-symbol',
    color: 'purple-600',
    count: 0
  },
  USC38: {
    name: 'USC 38',
    description: 'United States Code',
    icon: 'book-open',
    color: 'indigo-600',
    count: 0
  }
})

// Recent activity
const recentActivity = ref([
  {
    id: 1,
    action: 'New DSM-5 document uploaded',
    timestamp: '2 hours ago',
    icon: 'cloud-arrow-up',
    color: 'green-600',
    status: 'success'
  },
  {
    id: 2,
    action: 'BVA case law indexed',
    timestamp: '4 hours ago',
    icon: 'document-check',
    color: 'blue-600',
    status: 'success'
  },
  {
    id: 3,
    action: 'Search performance optimized',
    timestamp: '6 hours ago',
    icon: 'bolt',
    color: 'amber-600',
    status: 'info'
  }
])

// Check admin session
onMounted(async () => {
  const session = localStorage.getItem('admin_session')
  if (!session) {
    router.push('/admin/login')
    return
  }

  const sessionData = JSON.parse(session)
  const loginTime = new Date(sessionData.loginTime)
  const now = new Date()
  const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
  
  // Session expires after 8 hours
  if (hoursSinceLogin >= 8) {
    localStorage.removeItem('admin_session')
    router.push('/admin/login')
    return
  }

  adminUser.username = sessionData.username
  adminUser.loginTime = sessionData.loginTime

  // Load stats
  await loadStats()
})

// Load statistics
const loadStats = async () => {
  try {
    const response = await fetch('/api/va-law/ingest/stats')
    const data = await response.json()
    
    if (data.success) {
      stats.documents = data.documents
      stats.chunks = data.chunks
      
      // Update document type counts
      if (data.bySource) {
        Object.keys(documentTypes).forEach(key => {
          documentTypes[key].count = data.bySource[key] || 0
        })
      }
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// Logout handler
const handleLogout = () => {
  localStorage.removeItem('admin_session')
  router.push('/admin/login')
}

// Helper functions
function getBadgeVariant(count: number): string {
  if (count === 0) return 'neutral'
  if (count < 10) return 'secondary'
  if (count < 50) return 'primary'
  return 'success'
}
</script>
