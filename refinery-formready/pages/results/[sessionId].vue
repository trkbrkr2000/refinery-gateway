<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Minimal header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="text-xl font-bold text-blue-800">
            ClaimReady
          </NuxtLink>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/analyze" class="text-sm text-blue-600">
              Analyze Another
            </NuxtLink>
            <NuxtLink to="/auth/signup" class="text-sm text-blue-600">
              Sign Up Free
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Expiration Notice -->
    <div class="bg-amber-50 border-b border-amber-200 py-3">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <Icon name="heroicons:clock" class="w-4 h-4 inline mr-2" />
        <span class="text-sm text-amber-800">
          Results available for 24 hours. 
          <NuxtLink to="/auth/signup" class="underline font-medium">
            Sign up free to save permanently
          </NuxtLink>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-12 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-slate-600">Loading your analysis...</p>
    </div>

    <!-- Results -->
    <div v-else-if="results" class="max-w-7xl mx-auto px-4 py-8">
      <!-- Decision Summary -->
      <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Decision Summary</h2>
        <div class="prose max-w-none">
          <p class="text-slate-700">{{ results.summary || 'No summary available' }}</p>
        </div>
      </div>

      <!-- Conditions -->
      <div v-if="results.conditions && results.conditions.length > 0" class="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Conditions & Ratings</h2>
        <div class="space-y-4">
          <div 
            v-for="condition in results.conditions" 
            :key="condition.condition"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
          >
            <div>
              <h3 class="font-semibold text-slate-900">{{ condition.condition }}</h3>
              <p class="text-sm text-slate-600">{{ condition.status }}</p>
            </div>
            <div v-if="condition.rating" class="text-right">
              <span class="text-lg font-bold text-blue-600">{{ condition.rating }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Denial Analysis -->
      <div v-if="results.denialReasons && results.denialReasons.length > 0" class="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Denial Analysis</h2>
        <div class="space-y-6">
          <div 
            v-for="denial in results.denialReasons" 
            :key="denial.condition"
            class="border-l-4 border-red-200 pl-6"
          >
            <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ denial.condition }}</h3>
            <p class="text-slate-700">{{ denial.reason || 'No reason provided' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="mt-8 flex flex-col sm:flex-row gap-4">
        <Button @click="downloadSummary" variant="primary">
          <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
          Download Summary PDF
        </Button>
        
        <Button @click="navigateTo('/auth/signup')" variant="secondary">
          <Icon name="heroicons:bookmark" class="w-4 h-4 mr-2" />
          Save Full Results (Sign Up Free)
        </Button>
        
        <Button @click="navigateTo('/analyze')" variant="secondary">
          <Icon name="heroicons:document-plus" class="w-4 h-4 mr-2" />
          Analyze Another Document
        </Button>
      </div>
      
      <!-- Sign Up CTA -->
      <div class="mt-12 bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-8 text-center">
        <h3 class="text-2xl font-bold text-slate-900 mb-4">
          Want to save your analysis?
        </h3>
        <p class="text-slate-600 mb-6">
          Create a free account to save all your analyses, track progress, and access premium features.
        </p>
        <Button @click="navigateTo('/auth/signup')" variant="primary" class="px-8">
          Create Free Account
        </Button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="max-w-7xl mx-auto px-4 py-12 text-center">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Results Not Found</h2>
      <p class="text-slate-600 mb-6">
        This analysis may have expired or the link is invalid.
      </p>
      <Button @click="navigateTo('/analyze')" variant="primary">
        Analyze a New Document
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "~/components/atoms/Button.vue";

const route = useRoute()
const sessionId = route.params.sessionId as string

const loading = ref(true)
const results = ref<any>(null)

onMounted(async () => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/analyze/results/${sessionId}`
    )
    
    if (response.ok) {
      results.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load results:', error)
  } finally {
    loading.value = false
  }
})

const downloadSummary = async () => {
  window.open(
    `http://localhost:3001/api/analyze/results/${sessionId}/summary-pdf`,
    '_blank'
  )
}

useHead({
  title: 'Analysis Results - ClaimReady',
  meta: [
    { name: 'description', content: 'View your VA decision letter analysis results.' }
  ]
})
</script>
