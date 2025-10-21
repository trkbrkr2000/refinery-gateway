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
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-indigo-600">
                    {{ userInitials }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-700">{{ authStore.fullName }}</span>
              </div>

              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <div
                  v-if="showUserMenu"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div class="py-1">
                    <NuxtLink
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      Your Profile
                    </NuxtLink>
                    <NuxtLink
                      to="/api-tokens"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      API Tokens
                    </NuxtLink>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Welcome Section -->
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {{ authStore.user?.firstName || 'User' }}! 👋
            </h2>
            <p class="text-gray-600 mb-6">
              Manage your forms, drafts, and submissions from your personal dashboard.
            </p>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NuxtLink
                to="/forms"
                class="block p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Browse Forms</h3>
                    <p class="text-sm text-gray-600">Find and fill out available forms</p>
                  </div>
                </div>
              </NuxtLink>

              <div class="block p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">My Drafts</h3>
                    <p class="text-sm text-gray-600">Continue saved form drafts</p>
                    <p class="text-xs text-gray-500 mt-1">Coming soon</p>
                  </div>
                </div>
              </div>

              <NuxtLink
                to="/submissions"
                class="block p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">Submissions</h3>
                    <p class="text-sm text-gray-600">View completed submissions</p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="px-4 sm:px-0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Forms Available</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ availableFormsCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Saved Drafts</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ draftsCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ submissionsCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="px-4 sm:px-0 mt-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Drafts Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Drafts
              </h3>
              <div v-if="drafts.length === 0" class="text-center py-6">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No drafts</h3>
                <p class="mt-1 text-sm text-gray-500">Start filling out a form to save your progress.</p>
                <div class="mt-6">
                  <NuxtLink
                    to="/forms"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Forms
                  </NuxtLink>
                </div>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="draft in drafts"
                  :key="draft.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ draft.formName || 'Form Draft' }}</p>
                      <p class="text-xs text-gray-500">Last saved {{ formatDate(draft.updatedAt) }}</p>
                    </div>
                  </div>
                  <NuxtLink
                    :to="`/forms/${draft.formId}`"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Continue
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Submissions Section -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Submissions
              </h3>
              <div v-if="submissions.length === 0" class="text-center py-6">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
                <p class="mt-1 text-sm text-gray-500">Complete a form to see your submissions here.</p>
                <div class="mt-6">
                  <NuxtLink
                    to="/forms"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Forms
                  </NuxtLink>
                </div>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="submission in submissions"
                  :key="submission.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ submission.formName || 'Form Submission' }}</p>
                      <p class="text-xs text-gray-500">Completed {{ formatDate(submission.submittedAt) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ submission.status }}
                    </span>
                    <NuxtLink
                      :to="`/submissions/${submission.id}`"
                      class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Dashboard - FormReady',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const showUserMenu = ref(false)
const availableFormsCount = ref(0)
const draftsCount = ref(0)
const submissionsCount = ref(0)
const drafts = ref([])
const submissions = ref([])
const isLoading = ref(true)

// Close user menu when clicking outside
onMounted(async () => {
  document.addEventListener('click', (e) => {
    if (!e.target?.closest('.relative')) {
      showUserMenu.value = false
    }
  })

  // Load all dashboard data
  await Promise.all([
    loadFormsCount(),
    loadDrafts(),
    loadSubmissions()
  ])
  
  isLoading.value = false
})

const userInitials = computed(() => {
  if (!authStore.user) return 'U'

  const first = authStore.user.firstName?.[0] || ''
  const last = authStore.user.lastName?.[0] || ''

  if (first && last) return `${first}${last}`
  if (first) return first
  if (authStore.user.email) return authStore.user.email[0].toUpperCase()

  return 'U'
})

async function loadFormsCount() {
  try {
    const forms = await $fetch(`${config.public.apiUrl}/api/v1/forms`, {
      headers: authStore.getAuthHeaders()
    })
    availableFormsCount.value = forms.length
  } catch (error) {
    console.error('Failed to load forms count:', error)
  }
}

async function loadDrafts() {
  try {
    // Get all available forms to check for drafts
    const forms = await $fetch(`${config.public.apiUrl}/api/v1/forms`, {
      headers: authStore.getAuthHeaders()
    })
    
    const draftPromises = forms.map(async (form) => {
      try {
        const draft = await $fetch(`${config.public.apiUrl}/api/v1/forms/${form.id}/drafts`, {
          headers: authStore.getAuthHeaders()
        })
        return {
          id: draft.id,
          formId: form.id,
          formName: form.name,
          updatedAt: draft.updatedAt,
          data: draft.data
        }
      } catch (error) {
        // No draft found for this form
        return null
      }
    })
    
    const draftResults = await Promise.all(draftPromises)
    drafts.value = draftResults.filter(Boolean)
    draftsCount.value = drafts.value.length
  } catch (error) {
    console.error('Failed to load drafts:', error)
  }
}

async function loadSubmissions() {
  try {
    const response = await $fetch(`${config.public.apiUrl}/api/v1/forms/submissions/history`, {
      headers: authStore.getAuthHeaders()
    })
    
    submissions.value = response.submissions.slice(0, 5) // Show only recent 5
    submissionsCount.value = response.pagination.total
  } catch (error) {
    console.error('Failed to load submissions:', error)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'just now'
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else if (diffInHours < 48) {
    return 'yesterday'
  } else {
    return date.toLocaleDateString()
  }
}

function handleLogout() {
  showUserMenu.value = false
  authStore.logout()
}
</script>