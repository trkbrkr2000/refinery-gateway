<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Navigation -->
    <Navigation
      :show-new-analysis="true"
      :show-dashboard="true"
      :show-user-menu="true"
    />

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">Welcome back, {{ user.firstName }}</h1>
            <p class="text-xl text-blue-100 mb-4">{{ user.serviceBranch }} Veteran</p>
            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <Icon name="heroicons:document-text" class="w-5 h-5 mr-2" />
                <span class="text-sm">{{ analytics.totalDocuments }} Documents</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 mr-2" />
                <span class="text-sm">{{ analytics.totalAnalyses }} Analyses</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check-circle" class="w-5 h-5 mr-2" />
                <span class="text-sm">{{ analytics.successRate }}% Success Rate</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div v-if="!user.isPremium" class="mb-4">
              <Button 
                @click="navigateTo('/pricing')"
                variant="primary"
                class="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
            <div v-else class="flex items-center justify-end px-4 py-2 bg-white bg-opacity-20 rounded-lg mb-4">
              <Icon name="heroicons:star" class="w-5 h-5 mr-2" />
              <span class="font-medium">Premium Member</span>
            </div>
            <Button @click="handleLogout" variant="secondary" class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white">
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-slate-600">Loading your dashboard...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            @click="navigateTo('/analyze-decision')"
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-blue-200"
          >
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Icon name="heroicons:document-plus" class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-2">Analyze New Document</h3>
              <p class="text-slate-600">Upload and analyze your VA decision letter</p>
            </div>
          </div>
          
          <div 
            @click="navigateTo('/documents')"
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-green-200"
          >
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Icon name="heroicons:folder" class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-2">View Documents</h3>
              <p class="text-slate-600">Browse your uploaded documents and analyses</p>
            </div>
          </div>
          
          <div 
            v-if="user.isPremium"
            @click="navigateTo('/forms')"
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-purple-200"
          >
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Icon name="heroicons:clipboard-document-list" class="w-8 h-8 text-purple-600" />
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-2">Generate Forms</h3>
              <p class="text-slate-600">Create appeals and supplemental claims</p>
            </div>
          </div>
          
          <div 
            v-else
            @click="navigateTo('/pricing')"
            class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-amber-200"
          >
            <div class="p-8 text-center">
              <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                <Icon name="heroicons:star" class="w-8 h-8 text-amber-600" />
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-2">Upgrade to Premium</h3>
              <p class="text-slate-600">Unlock advanced features and form generation</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Analysis -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Recent Analysis</h2>
          <Button 
            v-if="recentAnalysis.length > 0"
            @click="navigateTo('/documents')"
            variant="secondary"
            class="text-sm"
          >
            View All
            <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div v-if="recentAnalysis.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:document-text" class="w-10 h-10 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">No analysis yet</h3>
          <p class="text-slate-600 mb-6">Upload your first VA decision letter to get started</p>
          <Button 
            @click="navigateTo('/analyze-decision')"
            variant="primary"
            class="px-8 py-3"
          >
            <Icon name="heroicons:document-plus" class="w-5 h-5 mr-2" />
            Analyze Your First Decision Letter
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="analysis in recentAnalysis" 
            :key="analysis.documentId"
            class="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all duration-200 cursor-pointer group border border-slate-200 hover:border-blue-300"
            @click="navigateTo(`/analysis/${analysis.documentId}`)"
          >
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <Icon name="heroicons:document-text" class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p class="font-semibold text-slate-900 mb-1">{{ analysis.fileName }}</p>
                <p class="text-sm text-slate-600">{{ formatDate(analysis.analyzedAt) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <Badge :variant="getAnalysisVariant(analysis.status)" :text="analysis.status" />
              <Icon name="heroicons:chevron-right" class="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- Premium Features (if not premium) -->
      <div v-if="!user.isPremium" class="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Unlock Premium Features</h3>
            <p class="text-slate-600 mb-4">Get advanced claim tracking, analytics, and Chrome extension access</p>
            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <Icon name="heroicons:chart-line" class="w-4 h-4 mr-2" color="red-600" />
                <span class="text-sm text-slate-700">Claim Tracking</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:puzzle-piece" class="w-4 h-4 mr-2" color="red-600" />
                <span class="text-sm text-slate-700">Chrome Extension</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:shield-check" class="w-4 h-4 mr-2" color="red-600" />
                <span class="text-sm text-slate-700">Advanced Analytics</span>
              </div>
            </div>
          </div>
          <Button 
            @click="navigateTo('/pricing')"
            variant="primary"
          >
            <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>

      <!-- Analytics Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Document Statistics -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Your Documents</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ analytics.totalDocuments }}</div>
              <div class="text-sm text-slate-500">Total Documents</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ analytics.totalAnalyses }}</div>
              <div class="text-sm text-slate-500">Completed</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-600">{{ analytics.successRate }}%</div>
              <div class="text-sm text-slate-500">Success Rate</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ analytics.denials }}</div>
              <div class="text-sm text-slate-500">Denials</div>
            </div>
          </div>
        </div>

        <!-- Analysis Status -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Analysis Status</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-700">Approved</span>
              <div class="flex items-center">
                <div class="w-16 bg-slate-200 rounded-full h-2 mr-2">
                  <div class="bg-green-600 h-2 rounded-full" :style="{ width: `${getPercentage(analytics.approvals, analytics.totalAnalyses)}%` }"></div>
                </div>
                <span class="text-sm font-medium text-slate-900">{{ analytics.approvals }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-700">Pending</span>
              <div class="flex items-center">
                <div class="w-16 bg-slate-200 rounded-full h-2 mr-2">
                  <div class="bg-amber-600 h-2 rounded-full" :style="{ width: `${getPercentage(analytics.pending, analytics.totalAnalyses)}%` }"></div>
                </div>
                <span class="text-sm font-medium text-slate-900">{{ analytics.pending }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-700">Denied</span>
              <div class="flex items-center">
                <div class="w-16 bg-slate-200 rounded-full h-2 mr-2">
                  <div class="bg-red-600 h-2 rounded-full" :style="{ width: `${getPercentage(analytics.denials, analytics.totalAnalyses)}%` }"></div>
                </div>
                <span class="text-sm font-medium text-slate-900">{{ analytics.denials }}</span>
              </div>
            </div>
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
  title: 'Dashboard - ClaimReady',
  meta: [
    { name: 'description', content: 'Your ClaimReady dashboard for VA claim tracking and analysis' }
  ]
})

const router = useRouter()

// State
const loading = ref(true)
const user = reactive({
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  serviceBranch: '',
  isPremium: false
})

const recentAnalysis = ref([])
const analytics = reactive({
  totalDocuments: 0,
  totalAnalyses: 0,
  successRate: 0,
  avgProcessingTime: '0 months',
  recentDocuments: 0,
  denials: 0,
  approvals: 0,
  pending: 0,
})

// Check user session and load data
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    // Load all dashboard data
    await Promise.all([
      loadUserProfile(),
      loadRecentAnalysis(),
      loadAnalytics()
    ])
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    localStorage.removeItem('auth_token')
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
})

// Load user profile from API
const loadUserProfile = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/auth/profile')

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const profileData = await response.json()
    Object.assign(user, profileData.user)
  } catch (error) {
    console.error('Failed to load user profile:', error)
    throw error
  }
}

// Load recent analysis from API
const loadRecentAnalysis = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/documents/analyses?limit=5')

    if (response.ok) {
      const data = await response.json()
      recentAnalysis.value = data.analyses.map((analysis: any) => ({
        documentId: analysis.documentId,
        fileName: analysis.fileName,
        status: analysis.status || 'analyzed',
        analyzedAt: analysis.analyzedAt,
      }))
    }
  } catch (error) {
    console.error('Failed to load recent analysis:', error)
  }
}

// Load analytics from API
const loadAnalytics = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/documents/analytics')

    if (response.ok) {
      const data = await response.json()
      Object.assign(analytics, data)
    }
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }
}

// Logout handler
const handleLogout = async () => {
  try {
    const { apiCall } = useApi()
    await apiCall('/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('auth_token')
    router.push('/')
  }
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const getAnalysisVariant = (status: string): string => {
  switch (status) {
    case 'approved': return 'success'
    case 'denied': return 'danger'
    case 'pending': return 'warning'
    default: return 'neutral'
  }
}

const getPercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
</script>
