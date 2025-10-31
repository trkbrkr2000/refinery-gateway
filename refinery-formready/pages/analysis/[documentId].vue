<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Navigation -->
    <Navigation
      :show-new-analysis="true"
      :show-dashboard="true"
      :show-user-menu="true"
    />

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-12 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-slate-600">Loading your analysis...</p>
    </div>

    <!-- Results -->
    <div v-else-if="document" class="max-w-7xl mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 mb-2">
              {{ document.fileName }}
            </h1>
            <p class="text-slate-600">
              Analyzed {{ formatDate(document.uploadedAt) }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <Button @click="navigateTo('/documents')" variant="secondary">
              <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
              Back to Documents
            </Button>
            <Button @click="downloadPDF" variant="primary">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <!-- Rating Hero Card -->
      <RatingHeroCard
        :combined-rating="document.combinedRating || 0"
        :monthly-payment="document.monthlyPayment || 0"
        :granted-count="grantedCount"
        :denied-count="deniedCount"
        :deferred-count="deferredCount"
      />

      <!-- Conditions Grid Enhanced -->
      <ConditionsGridEnhanced
        :conditions="formattedConditions"
        :denial-reasons="document.denialReasons || []"
        :deferred-reasons="document.deferredReasons || []"
        :is-authenticated="true"
      />

      <!-- Premium Features Coming Soon -->
      <div class="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-12 text-center text-white">
        <div class="inline-block bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-full mb-6">
          COMING SOON
        </div>
        <h3 class="text-3xl font-bold mb-4">
          Premium Features On The Way
        </h3>
        <p class="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          We're building personalized action plans, evidence checklists, form generation, and more. Sign up for our waitlist to be notified when they launch.
        </p>
        <div class="flex items-center justify-center space-x-4">
          <Icon name="heroicons:clock" class="w-6 h-6 text-blue-200" />
          <span class="text-blue-100">Premium features launching soon</span>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="max-w-7xl mx-auto px-4 py-12 text-center">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Document Not Found</h2>
      <p class="text-slate-600 mb-6">
        This document may have been deleted or you don't have access to it.
      </p>
      <Button @click="navigateTo('/documents')" variant="primary">
        Back to Documents
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "~/components/atoms/Button.vue";
import Navigation from "~/components/organisms/Navigation.vue";
import RatingHeroCard from "~/components/organisms/RatingHeroCard.vue";
import ConditionsGridEnhanced from "~/components/organisms/ConditionsGridEnhanced.vue";

const route = useRoute()
const router = useRouter()
const documentId = route.params.documentId as string

const loading = ref(true)
const document = ref<any>(null)

// Computed properties for condition counts and formatting
const formattedConditions = computed(() => {
  if (!document.value?.ratings) return []

  return document.value.ratings.map((rating: any) => ({
    condition: rating.condition,
    decision: rating.decision || 'unknown',
    ratingPercentage: rating.ratingPercentage,
    effectiveDate: rating.effectiveDate,
    reason: rating.reason
  }))
})

const grantedCount = computed(() => {
  return formattedConditions.value.filter((c: any) => c.decision === 'granted').length
})

const deniedCount = computed(() => {
  return formattedConditions.value.filter((c: any) => c.decision === 'denied').length
})

const deferredCount = computed(() => {
  return formattedConditions.value.filter((c: any) => c.decision === 'deferred').length
})

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    await loadDocument()
  } catch (error) {
    console.error('Failed to load document:', error)
  } finally {
    loading.value = false
  }
})

const loadDocument = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall(`/api/documents/${documentId}`)

    if (response.ok) {
      document.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load document:', error)
    throw error
  }
}

const downloadPDF = async () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  const token = localStorage.getItem('auth_token')

  try {
    // Fetch the presigned download URL from the API
    const response = await fetch(`${apiUrl}/api/documents/${documentId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error('Failed to get PDF download URL:', await response.text())
      return
    }

    const data = await response.json()

    // Open the presigned S3 URL in a new tab
    window.open(data.downloadUrl, '_blank')
  } catch (error) {
    console.error('Error downloading PDF:', error)
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

useHead({
  title: 'Analysis Details - ClaimReady',
  meta: [
    { name: 'description', content: 'View your VA decision letter analysis details' }
  ]
})
</script>
