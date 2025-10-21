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
            <NuxtLink to="/profile" class="text-gray-600 hover:text-gray-900">
              Profile
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
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Submission History</h1>
          <p class="text-gray-600">Track all your form submissions and download PDFs</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Loading submissions...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="submissions.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
          <p class="mt-1 text-sm text-gray-500">You haven't submitted any forms yet.</p>
          <div class="mt-6">
            <NuxtLink
              to="/forms"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Forms
            </NuxtLink>
          </div>
        </div>

        <!-- Submissions List -->
        <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li v-for="submission in submissions" :key="submission.id" class="px-6 py-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center" :class="getStatusColor(submission.status)">
                      <svg v-if="submission.status === 'completed'" class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <svg v-else-if="submission.status === 'failed'" class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      <svg v-else class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-gray-900">{{ getFormName(submission.formId) }}</p>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeColor(submission.status)">
                        {{ submission.status }}
                      </span>
                    </div>
                    <div class="mt-1">
                      <p class="text-sm text-gray-500">
                        Submitted {{ formatDate(submission.submittedAt) }}
                      </p>
                      <p v-if="submission.processingTime" class="text-xs text-gray-400">
                        Processing time: {{ submission.processingTime }}ms
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <div v-if="submission.pdfSize" class="text-right">
                    <p class="text-xs text-gray-500">PDF Size</p>
                    <p class="text-sm font-medium text-gray-900">{{ formatFileSize(submission.pdfSize) }}</p>
                  </div>
                  <button
                    @click="viewSubmission(submission.id)"
                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="mt-6 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="loadPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="loadPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                of
                <span class="font-medium">{{ pagination.total }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="loadPage(pagination.page - 1)"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  v-for="page in getPageNumbers()"
                  :key="page"
                  @click="loadPage(page)"
                  :class="[
                    page === pagination.page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="loadPage(pagination.page + 1)"
                  :disabled="pagination.page === pagination.pages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Submissions - FormReady',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

const submissions = ref([])
const pagination = ref(null)
const loading = ref(true)

const formNames = ref({})

async function loadSubmissions(page = 1) {
  loading.value = true

  try {
    const response = await $fetch(`${config.public.apiUrl}/api/v1/forms/submissions/history`, {
      headers: authStore.getAuthHeaders(),
      query: { page, limit: 10 }
    })

    submissions.value = response.submissions
    pagination.value = response.pagination

    // Load form names for display
    const formIds = [...new Set(submissions.value.map(s => s.formId))]
    for (const formId of formIds) {
      if (!formNames.value[formId]) {
        try {
          const schema = await $fetch(`${config.public.apiUrl}/api/v1/forms/${formId}/schema`, {
            headers: authStore.getAuthHeaders()
          })
          formNames.value[formId] = schema.name
        } catch (error) {
          formNames.value[formId] = formId
        }
      }
    }
  } catch (error) {
    console.error('Failed to load submissions:', error)
  } finally {
    loading.value = false
  }
}

function loadPage(page: number) {
  if (page >= 1 && page <= pagination.value.pages) {
    loadSubmissions(page)
  }
}

function getFormName(formId: string): string {
  return formNames.value[formId] || formId
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-600'
    case 'failed':
      return 'bg-red-100 text-red-600'
    case 'processing':
      return 'bg-yellow-100 text-yellow-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
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

function getPageNumbers(): number[] {
  if (!pagination.value) return []

  const current = pagination.value.page
  const total = pagination.value.pages
  const pages = []

  // Show up to 5 page numbers
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)

  // Adjust if we're near the beginning or end
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

function viewSubmission(submissionId: string) {
  router.push(`/submissions/${submissionId}`)
}

onMounted(() => {
  loadSubmissions()
})
</script>