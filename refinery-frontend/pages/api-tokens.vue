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
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">API Tokens</h1>
          <p class="text-gray-600">
            Create and manage API tokens for programmatic access to FormReady
          </p>
        </div>

        <!-- Create Token Section -->
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Create New Token</h2>

          <form @submit.prevent="createToken" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Token Name *
              </label>
              <input
                v-model="newToken.name"
                type="text"
                required
                placeholder="e.g., My App Integration"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="newToken.description"
                rows="2"
                placeholder="Optional description of what this token will be used for"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Permissions *
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="newToken.scopes"
                    type="checkbox"
                    value="forms:read"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Read Forms - Access form schemas and metadata</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="newToken.scopes"
                    type="checkbox"
                    value="forms:generate"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Generate PDFs - Create filled PDF documents</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Expiration (Optional)
              </label>
              <select
                v-model="newToken.expirationDays"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Never expires</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="!newToken.name || newToken.scopes.length === 0 || creating"
              class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create Token' }}
            </button>
          </form>
        </div>

        <!-- New Token Display -->
        <div v-if="createdToken" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-green-800">Token Created Successfully!</h3>
              <div class="mt-2">
                <p class="text-sm text-green-700 mb-2">
                  Copy this token now - you won't be able to see it again:
                </p>
                <div class="bg-white border border-green-300 rounded p-3 font-mono text-sm break-all">
                  {{ createdToken.token }}
                </div>
                <button
                  @click="copyToken"
                  class="mt-2 text-sm text-green-600 hover:text-green-500"
                >
                  📋 Copy to clipboard
                </button>
              </div>
            </div>
            <button
              @click="createdToken = null"
              class="flex-shrink-0 ml-3 text-green-400 hover:text-green-500"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Existing Tokens -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Your API Tokens</h2>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="p-6 text-center">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p class="mt-2 text-sm text-gray-600">Loading tokens...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="tokens.length === 0" class="p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m6 0V5a2 2 0 012-2m0 0V3a2 2 0 012-2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No API tokens</h3>
            <p class="mt-1 text-sm text-gray-500">Create your first API token to get started with programmatic access.</p>
          </div>

          <!-- Tokens List -->
          <div v-else class="divide-y divide-gray-200">
            <div v-for="token in tokens" :key="token._id" class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h3 class="text-sm font-medium text-gray-900">{{ token.name }}</h3>
                    <span v-if="token.expiresAt" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Expires {{ formatDate(token.expiresAt) }}
                    </span>
                  </div>
                  <p v-if="token.description" class="mt-1 text-sm text-gray-500">{{ token.description }}</p>
                  <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created {{ formatDate(token.createdAt) }}</span>
                    <span>•</span>
                    <span>{{ token.scopes.join(', ') }}</span>
                    <span v-if="token.lastUsedAt">•</span>
                    <span v-if="token.lastUsedAt">Last used {{ formatDate(token.lastUsedAt) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <button
                    @click="deleteToken(token._id)"
                    class="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Documentation -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-blue-900 mb-4">Using Your API Tokens</h3>
          <div class="space-y-4 text-sm text-blue-800">
            <div>
              <h4 class="font-medium mb-2">Authentication</h4>
              <p class="mb-2">Include your token in the X-API-Key header:</p>
              <pre class="bg-blue-100 p-3 rounded font-mono text-xs overflow-x-auto">curl -H "X-API-Key: your-token-here" https://api.formready.com/api/v1/forms</pre>
            </div>
            <div>
              <h4 class="font-medium mb-2">Available Endpoints</h4>
              <ul class="space-y-1">
                <li>• <code>GET /api/v1/forms</code> - List available forms</li>
                <li>• <code>GET /api/v1/forms/{id}/schema</code> - Get form schema</li>
                <li>• <code>POST /api/v1/forms/{id}/generate</code> - Generate filled PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'API Tokens - FormReady',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const tokens = ref([])
const loading = ref(true)
const creating = ref(false)
const createdToken = ref(null)

const newToken = ref({
  name: '',
  description: '',
  scopes: [],
  expirationDays: ''
})

async function loadTokens() {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiUrl}/api/v1/tokens`, {
      headers: authStore.getAuthHeaders()
    })
    tokens.value = response
  } catch (error) {
    console.error('Failed to load tokens:', error)
  } finally {
    loading.value = false
  }
}

async function createToken() {
  if (!newToken.value.name || newToken.value.scopes.length === 0) return

  creating.value = true
  try {
    const payload = {
      name: newToken.value.name,
      description: newToken.value.description || undefined,
      scopes: newToken.value.scopes,
      expiresAt: newToken.value.expirationDays
        ? new Date(Date.now() + parseInt(newToken.value.expirationDays) * 24 * 60 * 60 * 1000)
        : undefined
    }

    const response = await $fetch(`${config.public.apiUrl}/api/v1/tokens`, {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: payload
    })

    createdToken.value = response

    // Reset form
    newToken.value = {
      name: '',
      description: '',
      scopes: [],
      expirationDays: ''
    }

    // Reload tokens list
    await loadTokens()
  } catch (error) {
    console.error('Failed to create token:', error)
    alert('Failed to create token. Please try again.')
  } finally {
    creating.value = false
  }
}

async function deleteToken(tokenId: string) {
  if (!confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
    return
  }

  try {
    await $fetch(`${config.public.apiUrl}/api/v1/tokens/${tokenId}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders()
    })

    // Remove from local list
    tokens.value = tokens.value.filter(t => t._id !== tokenId)
  } catch (error) {
    console.error('Failed to delete token:', error)
    alert('Failed to delete token. Please try again.')
  }
}

function copyToken() {
  if (createdToken.value?.token) {
    navigator.clipboard.writeText(createdToken.value.token)
    alert('Token copied to clipboard!')
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadTokens()
})
</script>