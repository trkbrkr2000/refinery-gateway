<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Icon name="heroicons:shield-check" class="w-6 h-6 mr-3" color="blue-600" />
            <div>
              <h1 class="text-xl font-bold text-slate-900">Welcome back, {{ user.firstName }}</h1>
              <p class="text-sm text-slate-500">{{ user.serviceBranch }} Veteran</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div v-if="!user.isPremium" class="text-right">
              <Button 
                @click="navigateTo('/pricing')"
                variant="primary"
              >
                <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
            <div v-else class="flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-amber-100 rounded-full">
              <Icon name="heroicons:star" class="w-4 h-4 mr-2" color="red-600" />
              <span class="text-sm font-medium text-blue-800">Premium Member</span>
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
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Button 
          @click="navigateTo('/analyze-decision')"
          variant="primary"
          class="flex items-center justify-center p-6 h-auto"
        >
          <Icon name="document-text" class="w-6 h-6 mr-4" />
          <div class="text-left">
            <div class="text-lg font-semibold">Analyze Decision Letter</div>
            <div class="text-sm opacity-90">Upload and analyze your VA decision</div>
          </div>
        </Button>

        <Button 
          v-if="user.isPremium"
          @click="navigateTo('/claims')"
          variant="secondary"
          class="flex items-center justify-center p-6 h-auto"
        >
          <Icon name="chart-line" class="w-6 h-6 mr-4" />
          <div class="text-left">
            <div class="text-lg font-semibold">Track Claims</div>
            <div class="text-sm opacity-90">Monitor your claims over time</div>
          </div>
        </Button>

        <Button 
          v-if="user.isPremium"
          @click="navigateTo('/chrome-extension')"
          variant="secondary"
          class="flex items-center justify-center p-6 h-auto"
        >
          <Icon name="puzzle-piece" class="w-6 h-6 mr-4" />
          <div class="text-left">
            <div class="text-lg font-semibold">Chrome Extension</div>
            <div class="text-sm opacity-90">Sync with VA.gov profile</div>
          </div>
        </Button>
      </div>

      <!-- Recent Analysis -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900">Recent Analysis</h2>
          <Button 
            @click="navigateTo('/analyze-decision')"
            variant="secondary"
          >
            <Icon name="plus" class="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
        
        <div v-if="recentAnalysis.length === 0" class="text-center py-8">
          <Icon name="document-text" class="w-8 h-8 mx-auto mb-4" color="slate-400" />
          <p class="text-slate-500 mb-4">No analysis yet</p>
          <Button 
            @click="navigateTo('/analyze-decision')"
            variant="primary"
          >
            Analyze Your First Decision Letter
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="analysis in recentAnalysis" 
            :key="analysis.id"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            @click="navigateTo(`/analysis/${analysis.id}`)"
          >
            <div class="flex items-center">
              <Icon name="document-text" class="w-5 h-5 mr-3" color="slate-500" />
              <div>
                <p class="font-medium text-slate-900">{{ analysis.title }}</p>
                <p class="text-sm text-slate-500">{{ analysis.analyzedAt }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Badge :variant="getAnalysisVariant(analysis.status)" class="w-4 h-4" :text="analysis.status" />
              <Icon name="chevron-right" class="w-4 h-4" color="slate-400" />
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
                <Icon name="chart-line" class="w-4 h-4 mr-2" color="red-600" />
                <span class="text-sm text-slate-700">Claim Tracking</span>
              </div>
              <div class="flex items-center">
                <Icon name="puzzle-piece" class="w-4 h-4 mr-2" color="red-600" />
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

      <!-- Premium Dashboard (if premium) -->
      <div v-if="user.isPremium" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Claim Tracking -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Claim Tracking</h3>
          <div class="space-y-4">
            <div 
              v-for="claim in trackedClaims" 
              :key="claim.id"
              class="p-4 border border-slate-200 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-slate-900">{{ claim.condition }}</span>
                <Badge :variant="getClaimVariant(claim.status)" class="w-4 h-4" :text="claim.status" />
              </div>
              <div class="text-sm text-slate-500">
                Filed: {{ claim.filedDate }} • 
                Last Updated: {{ claim.lastUpdated }}
              </div>
              <div class="mt-2">
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${claim.progress}%` }"
                  ></div>
                </div>
                <div class="text-xs text-slate-500 mt-1">{{ claim.progress }}% Complete</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Your Analytics</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ analytics.totalClaims }}</div>
              <div class="text-sm text-slate-500">Total Claims</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ analytics.successRate }}%</div>
              <div class="text-sm text-slate-500">Success Rate</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-600">{{ analytics.avgProcessingTime }}</div>
              <div class="text-sm text-slate-500">Avg Processing</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ analytics.denials }}</div>
              <div class="text-sm text-slate-500">Denials</div>
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

// User state
const user = reactive({
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  serviceBranch: '',
  isPremium: false
})

// Recent analysis
const recentAnalysis = ref([
  {
    id: '1',
    title: 'PTSD Decision Letter - Jan 2024',
    status: 'denied',
    analyzedAt: '2 days ago'
  },
  {
    id: '2', 
    title: 'Tinnitus Rating Decision - Dec 2023',
    status: 'approved',
    analyzedAt: '1 week ago'
  }
])

// Premium features
const trackedClaims = ref([
  {
    id: '1',
    condition: 'PTSD',
    status: 'under_review',
    filedDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    progress: 65
  },
  {
    id: '2',
    condition: 'Tinnitus',
    status: 'approved',
    filedDate: '2023-12-01',
    lastUpdated: '2024-01-10',
    progress: 100
  }
])

const analytics = reactive({
  totalClaims: 3,
  successRate: 67,
  avgProcessingTime: '4.2 months',
  denials: 1
})

// Check user session and load data
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    // Fetch user profile from API
    const { apiCall } = useApi()
    const response = await apiCall('/auth/profile')

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const profileData = await response.json()
    Object.assign(user, profileData.user)

    // Load recent analysis
    await loadRecentAnalysis()
    
    // Load analytics if premium
    if (user.isPremium) {
      await loadAnalytics()
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    localStorage.removeItem('auth_token')
    router.push('/auth/login')
  }
})

// Load recent analysis from API
const loadRecentAnalysis = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/documents')

    if (response.ok) {
      const data = await response.json()
      recentAnalysis.value = data.documents.map((doc: any) => ({
        id: doc._id,
        title: doc.filename || 'Decision Letter',
        status: doc.status || 'analyzed',
        analyzedAt: new Date(doc.createdAt).toLocaleDateString()
      }))
    }
  } catch (error) {
    console.error('Failed to load recent analysis:', error)
  }
}

// Load analytics for premium users
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
const getAnalysisVariant = (status: string): string => {
  switch (status) {
    case 'approved': return 'success'
    case 'denied': return 'danger'
    case 'deferred': return 'warning'
    default: return 'neutral'
  }
}

const getClaimVariant = (status: string): string => {
  switch (status) {
    case 'approved': return 'success'
    case 'under_review': return 'warning'
    case 'denied': return 'danger'
    default: return 'neutral'
  }
}
</script>
