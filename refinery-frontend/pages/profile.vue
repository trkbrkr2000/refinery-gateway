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
    <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>

            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    name="firstName"
                    type="text"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    name="lastName"
                    type="text"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  :value="authStore.user?.email"
                  name="email"
                  type="email"
                  disabled
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Email address cannot be changed
                </p>
              </div>

              <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{{ authStore.error }}</p>
                  </div>
                </div>
              </div>

              <div v-if="updateSuccess" class="bg-green-50 border border-green-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-green-800">Profile updated successfully!</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="authStore.isLoading"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="authStore.isLoading" class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                  <span v-else>
                    Update Profile
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Profile - FormReady',
  middleware: 'auth'
})

const authStore = useAuthStore()
const updateSuccess = ref(false)

const form = reactive({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || ''
})

// Watch for user changes to update form
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    form.firstName = newUser.firstName || ''
    form.lastName = newUser.lastName || ''
  }
}, { immediate: true })

async function handleUpdateProfile() {
  authStore.clearError()
  updateSuccess.value = false

  const result = await authStore.updateProfile({
    firstName: form.firstName || undefined,
    lastName: form.lastName || undefined
  })

  if (result.success) {
    updateSuccess.value = true
    // Hide success message after 3 seconds
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  }
}
</script>