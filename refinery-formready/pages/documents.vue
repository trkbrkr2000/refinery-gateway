<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Navigation -->
    <Navigation
      :show-new-analysis="true"
      :show-dashboard="true"
      :show-user-menu="true"
    />

    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-2">Your Documents</h1>
        <p class="text-xl text-blue-100">View and manage all your VA decision letter analyses</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-slate-600">Loading your documents...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Empty State -->
      <div v-if="documents.length === 0" class="text-center py-16">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="heroicons:document-text" class="w-12 h-12 text-slate-400" />
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">No documents yet</h2>
        <p class="text-slate-600 mb-8">Upload your first VA decision letter to get started</p>
        <Button
          @click="navigateTo('/analyze-decision')"
          variant="primary"
          class="px-8 py-4 text-lg"
        >
          <Icon name="heroicons:document-plus" class="w-6 h-6 mr-2" />
          Analyze Your First Document
        </Button>
      </div>

      <!-- Documents Grid -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-900">
            All Documents ({{ documents.length }})
          </h2>
          <Button
            @click="navigateTo('/analyze-decision')"
            variant="primary"
          >
            <Icon name="heroicons:document-plus" class="w-5 h-5 mr-2" />
            Analyze New Document
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="doc in documents"
            :key="doc.documentId"
            @click="navigateTo(`/analysis/${doc.documentId}`)"
            class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-blue-300 overflow-hidden"
          >
            <!-- Document Header -->
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name="heroicons:document-text" class="w-6 h-6 text-white" />
                </div>
                <Badge :variant="getStatusVariant(doc.status)" :text="doc.status" />
              </div>
              <h3 class="font-semibold text-slate-900 mb-1 truncate">
                {{ doc.fileName }}
              </h3>
              <p class="text-sm text-slate-600">
                {{ formatDate(doc.analyzedAt) }}
              </p>
            </div>

            <!-- Document Stats -->
            <div class="p-6">
              <div v-if="doc.combinedRating !== null || doc.monthlyPayment !== null" class="grid grid-cols-2 gap-4 mb-4">
                <div v-if="doc.combinedRating !== null" class="text-center p-3 bg-blue-50 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{{ doc.combinedRating }}%</div>
                  <div class="text-xs text-slate-600">Combined Rating</div>
                </div>
                <div v-if="doc.monthlyPayment !== null" class="text-center p-3 bg-green-50 rounded-lg">
                  <div class="text-xl font-bold text-green-600">${{ Math.round(doc.monthlyPayment) }}</div>
                  <div class="text-xs text-slate-600">Monthly</div>
                </div>
              </div>

              <!-- Condition Summary -->
              <div v-if="doc.conditionsCount" class="flex items-center justify-between text-sm mb-4">
                <div class="flex items-center text-green-600">
                  <Icon name="heroicons:check-circle" class="w-4 h-4 mr-1" />
                  <span>{{ doc.grantedCount || 0 }} Granted</span>
                </div>
                <div class="flex items-center text-red-600">
                  <Icon name="heroicons:x-circle" class="w-4 h-4 mr-1" />
                  <span>{{ doc.deniedCount || 0 }} Denied</span>
                </div>
                <div v-if="doc.deferredCount > 0" class="flex items-center text-amber-600">
                  <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                  <span>{{ doc.deferredCount || 0 }} Deferred</span>
                </div>
              </div>

              <!-- View Button -->
              <div class="flex items-center justify-between pt-4 border-t border-slate-200">
                <span class="text-sm text-slate-600">Click to view details</span>
                <Icon name="heroicons:arrow-right" class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/atoms/Button.vue'
import Badge from '~/components/atoms/Badge.vue'
import Navigation from '~/components/organisms/Navigation.vue'

useHead({
  title: 'Your Documents - ClaimReady',
  meta: [
    { name: 'description', content: 'View all your VA decision letter analyses' }
  ]
})

const router = useRouter()
const loading = ref(true)
const documents = ref<any[]>([])

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    await loadDocuments()
  } catch (error) {
    console.error('Failed to load documents:', error)
    localStorage.removeItem('auth_token')
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
})

const loadDocuments = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/api/documents/analyses')

    if (response.ok) {
      const data = await response.json()
      documents.value = data.analyses.map((doc: any) => ({
        documentId: doc.documentId,
        fileName: doc.fileName,
        status: doc.status || 'analyzed',
        analyzedAt: doc.analyzedAt,
        combinedRating: doc.combinedRating,
        monthlyPayment: doc.monthlyPayment,
        conditionsCount: doc.conditions.length || 0,
        grantedCount: doc.conditions.filter((condition) => condition.status === 'approved').length || 0,
        deniedCount: doc.conditions.filter((condition) => condition.status === 'denied').length || 0,
        deferredCount: doc.conditions.filter((condition) => condition.status === 'deferred').lengthå || 0
      }))
    }
  } catch (error) {
    console.error('Failed to load documents:', error)
    throw error
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

const getStatusVariant = (status: string): string => {
  switch (status) {
    case 'approved': return 'success'
    case 'denied': return 'danger'
    case 'pending': return 'warning'
    default: return 'neutral'
  }
}
</script>
