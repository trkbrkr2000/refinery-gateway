<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Button 
              @click="navigateTo('/admin/dashboard')"
              variant="secondary"
              class="w-4 h-4"
            >
              <Icon name="arrow-left" class="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Icon name="chart-pie" class="w-6 h-6 mr-3" color="blue-600" />
            <div>
              <h1 class="text-xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p class="text-sm text-slate-500">Usage and performance insights</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <select
              v-model="selectedTimeRange"
              class="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button 
              @click="refreshAnalytics"
              variant="secondary"
              class="w-4 h-4"
              :disabled="loading"
            >
              <Spinner v-if="loading" class="w-4 h-4 mr-2" color="red-600" />
              <Icon v-else name="arrow-path" class="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <Icon name="magnifying-glass" class="w-6 h-6" color="blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Total Searches</p>
              <p class="text-2xl font-bold text-slate-900">{{ metrics.totalSearches.toLocaleString() }}</p>
              <p class="text-sm text-green-600">+12% from last period</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <Icon name="users" class="w-6 h-6" color="green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Active Users</p>
              <p class="text-2xl font-bold text-slate-900">{{ metrics.activeUsers.toLocaleString() }}</p>
              <p class="text-sm text-green-600">+8% from last period</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-amber-100 rounded-lg">
              <Icon name="document-text" class="w-6 h-6" color="amber-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Documents Accessed</p>
              <p class="text-2xl font-bold text-slate-900">{{ metrics.documentsAccessed.toLocaleString() }}</p>
              <p class="text-sm text-green-600">+15% from last period</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <Icon name="clock" class="w-6 h-6" color="red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-500">Avg Response Time</p>
              <p class="text-2xl font-bold text-slate-900">{{ metrics.avgResponseTime }}ms</p>
              <p class="text-sm text-red-600">-5% from last period</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Search Trends -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Search Trends</h3>
          <div class="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <div class="text-center">
              <Icon name="chart-bar" class="w-8 h-8" color="slate-400" />
              <p class="text-slate-500 mt-2">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <!-- Document Type Usage -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Document Type Usage</h3>
          <div class="space-y-4">
            <div 
              v-for="type in documentTypeUsage" 
              :key="type.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <Icon :name="type.icon" class="w-5 h-5 mr-3" :color="type.color" />
                <span class="text-sm font-medium text-slate-900">{{ type.name }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-24 bg-slate-200 rounded-full h-2 mr-3">
                  <div 
                    class="h-2 rounded-full"
                    :class="type.colorClass"
                    :style="{ width: `${type.percentage}%` }"
                  ></div>
                </div>
                <span class="text-sm text-slate-500 w-12 text-right">{{ type.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Searches and Common Denials -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Top Searches -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Top Search Queries</h3>
          <div class="space-y-3">
            <div 
              v-for="(search, index) in topSearches" 
              :key="index"
              class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div class="flex items-center">
                <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  {{ index + 1 }}
                </div>
                <span class="text-sm font-medium text-slate-900">{{ search.query }}</span>
              </div>
              <div class="text-sm text-slate-500">{{ search.count }} searches</div>
            </div>
          </div>
        </div>

        <!-- Common Denial Reasons -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Common Denial Reasons</h3>
          <div class="space-y-3">
            <div 
              v-for="(denial, index) in commonDenials" 
              :key="index"
              class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div class="flex items-center">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  {{ index + 1 }}
                </div>
                <span class="text-sm font-medium text-slate-900">{{ denial.reason }}</span>
              </div>
              <div class="text-sm text-slate-500">{{ denial.count }} cases</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">System Performance</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ performance.uptime }}%</div>
            <div class="text-sm text-slate-500">System Uptime</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ performance.successRate }}%</div>
            <div class="text-sm text-slate-500">Success Rate</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-amber-600 mb-2">{{ performance.avgLoadTime }}ms</div>
            <div class="text-sm text-slate-500">Average Load Time</div>
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
import Spinner from '~/components/atoms/Spinner.vue'

// Head
useHead({
  title: 'Analytics Dashboard - Admin - FormReady',
  meta: [
    { name: 'description', content: 'VA Knowledge Base analytics and insights' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()

// State
const loading = ref(false)
const selectedTimeRange = ref('30d')

// Metrics
const metrics = reactive({
  totalSearches: 15420,
  activeUsers: 892,
  documentsAccessed: 3240,
  avgResponseTime: 245
})

// Document type usage
const documentTypeUsage = ref([
  {
    name: 'CFR 38',
    icon: 'document-text',
    color: 'blue-600',
    colorClass: 'bg-blue-500',
    percentage: 35
  },
  {
    name: 'BVA Cases',
    icon: 'scale',
    color: 'green-600',
    colorClass: 'bg-green-500',
    percentage: 28
  },
  {
    name: 'DSM-5',
    icon: 'heart',
    color: 'red-600',
    colorClass: 'bg-red-500',
    percentage: 18
  },
  {
    name: 'VHA Handbooks',
    icon: 'medical-symbol',
    color: 'purple-600',
    colorClass: 'bg-purple-500',
    percentage: 12
  },
  {
    name: 'CAVC Cases',
    icon: 'building-library',
    color: 'amber-600',
    colorClass: 'bg-amber-500',
    percentage: 7
  }
])

// Top searches
const topSearches = ref([
  { query: 'PTSD service connection', count: 1240 },
  { query: 'tinnitus rating criteria', count: 892 },
  { query: 'back pain secondary', count: 756 },
  { query: 'depression nexus letter', count: 634 },
  { query: 'hearing loss evidence', count: 521 }
])

// Common denials
const commonDenials = ref([
  { reason: 'Lack of nexus', count: 342 },
  { reason: 'Insufficient evidence', count: 298 },
  { reason: 'No current diagnosis', count: 234 },
  { reason: 'Pre-existing condition', count: 189 },
  { reason: 'No in-service event', count: 156 }
])

// Performance metrics
const performance = reactive({
  uptime: 99.9,
  successRate: 98.5,
  avgLoadTime: 245
})

// Check admin session
onMounted(async () => {
  const session = localStorage.getItem('admin_session')
  if (!session) {
    router.push('/admin/login')
    return
  }

  await loadAnalytics()
})

// Load analytics data
const loadAnalytics = async () => {
  loading.value = true
  try {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    console.log('Loading analytics for time range:', selectedTimeRange.value)
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

// Refresh analytics
const refreshAnalytics = async () => {
  await loadAnalytics()
}
</script>
