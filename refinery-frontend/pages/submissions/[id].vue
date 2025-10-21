<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900">FormReady</h1>
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/submissions" class="text-gray-600 hover:text-gray-900">
              Submissions
            </NuxtLink>
            <button
              @click="authStore.logout()"
              class="text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Breadcrumb -->
        <nav class="flex mb-6" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <NuxtLink to="/submissions" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <svg class="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Submissions
              </NuxtLink>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">Submission Details</span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Loading submission details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Submission Details -->
        <div v-else-if="submission" class="space-y-6">
          <!-- Header -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ formName || submission.formId }}</h1>
                <p class="mt-1 text-sm text-gray-500">
                  Submitted {{ formatDate(submission.submittedAt) }}
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium" :class="getStatusBadgeColor(submission.status)">
                  {{ submission.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Submission Metadata -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Submission Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ submission.status }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Submitted At</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(submission.submittedAt) }}</dd>
              </div>
              <div v-if="submission.processingTime">
                <dt class="text-sm font-medium text-gray-500">Processing Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ submission.processingTime }}ms</dd>
              </div>
              <div v-if="submission.pdfSize">
                <dt class="text-sm font-medium text-gray-500">PDF Size</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatFileSize(submission.pdfSize) }}</dd>
              </div>
              <div v-if="submission.metadata?.submissionMethod">
                <dt class="text-sm font-medium text-gray-500">Submission Method</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ submission.metadata.submissionMethod }}</dd>
              </div>
              <div v-if="submission.metadata?.userAgent">
                <dt class="text-sm font-medium text-gray-500">Browser</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getBrowserInfo(submission.metadata.userAgent) }}</dd>
              </div>
            </div>
            <div v-if="submission.errorMessage" class="mt-6">
              <dt class="text-sm font-medium text-gray-500">Error Message</dt>
              <dd class="mt-1 text-sm text-red-600 bg-red-50 p-3 rounded">{{ submission.errorMessage }}</dd>
            </div>
          </div>

          <!-- Form Data -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Form Data</h2>
            <div class="space-y-4">
              <div v-for="(value, key) in submission.data" :key="key" class="border-b border-gray-200 pb-3">
                <dt class="text-sm font-medium text-gray-500 capitalize">{{ formatFieldName(key) }}</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span v-if="typeof value === 'boolean'">{{ value ? 'Yes' : 'No' }}</span>
                  <span v-else-if="value === null || value === undefined || value === ''">Not provided</span>
                  <span v-else>{{ value }}</span>
                </dd>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Actions</h2>
            <div class="flex space-x-4">
              <button
                v-if="submission.status === 'completed' && submission.pdfUrl"
                @click="downloadPDF"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Download PDF
              </button>
              <NuxtLink
                :to="`/forms/${submission.formId}`"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Fill Form Again
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Submission Details - FormReady',
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const submissionId = computed(() => route.params.id as string)
const submission = ref(null)
const formName = ref('')
const loading = ref(true)
const error = ref('')

async function loadSubmissionDetails() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`${config.public.apiUrl}/api/v1/forms/submissions/${submissionId.value}`, {
      headers: authStore.getAuthHeaders()
    })

    submission.value = response

    // Load form name
    try {
      const schema = await $fetch(`${config.public.apiUrl}/api/v1/forms/${response.formId}/schema`, {
        headers: authStore.getAuthHeaders()
      })
      formName.value = schema.name
    } catch (error) {
      formName.value = response.formId
    }
  } catch (err) {
    console.error('Failed to load submission details:', err)
    error.value = 'Failed to load submission details. Please try again.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getBrowserInfo(userAgent: string): string {
  // Simple browser detection
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
}

function downloadPDF() {
  if (submission.value?.pdfUrl) {
    window.open(submission.value.pdfUrl, '_blank')
  }
}

onMounted(() => {
  loadSubmissionDetails()
})
</script>