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
            <h1 class="text-4xl font-bold mb-2">Profile</h1>
            <p class="text-xl text-blue-100">Manage your account information</p>
          </div>
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user" class="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-slate-600">Loading profile...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  v-model="profileForm.firstName"
                  type="text"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  v-model="profileForm.lastName"
                  type="text"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  placeholder="your.email@example.com"
                  disabled
                />
                <p class="mt-1 text-sm text-slate-500">Email cannot be changed</p>
              </div>

              <!-- Service Branch -->
              <div>
                <label for="serviceBranch" class="block text-sm font-medium text-slate-700 mb-2">
                  Service Branch
                </label>
                <select
                  id="serviceBranch"
                  v-model="profileForm.serviceBranch"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your service branch</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marine Corps">Marine Corps</option>
                  <option value="Coast Guard">Coast Guard</option>
                  <option value="Space Force">Space Force</option>
                </select>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                  <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-600 mr-2" />
                  <span class="text-red-800">{{ error }}</span>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 mr-2" />
                  <span class="text-green-800">Profile updated successfully!</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-4">
                <Button
                  type="button"
                  @click="resetForm"
                  variant="secondary"
                  :disabled="saving"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  :disabled="saving"
                >
                  <span v-if="!saving">Save Changes</span>
                  <span v-else class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        <!-- Profile Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200 sticky top-24">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Account Summary</h3>

            <div class="space-y-4">
              <div>
                <div class="text-sm text-slate-500 mb-1">Member Since</div>
                <div class="font-medium text-slate-900">{{ formatDate(profile.createdAt) }}</div>
              </div>

              <div class="pt-4 border-t border-slate-200">
                <div class="text-sm text-slate-500 mb-1">Account Status</div>
                <Badge
                  :text="profile.isPremium ? 'Premium' : 'Free'"
                  :variant="profile.isPremium ? 'success' : 'neutral'"
                />
              </div>

              <div class="pt-4 border-t border-slate-200">
                <div class="text-sm text-slate-500 mb-1">Documents Analyzed</div>
                <div class="font-medium text-slate-900">{{ profile.totalDocuments || 0 }}</div>
              </div>

              <!-- Premium Upsell -->
              <div v-if="!profile.isPremium" class="pt-4 border-t border-slate-200">
                <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                  <div class="text-center mb-3">
                    <Icon name="heroicons:star" class="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <div class="font-bold text-amber-900 text-sm mb-1">COMING SOON</div>
                    <div class="text-xs text-amber-800">Premium Features</div>
                  </div>
                  <p class="text-xs text-slate-700 text-center">
                    Advanced analysis and form generation launching soon
                  </p>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'
import Badge from '~/components/atoms/Badge.vue'
import Navigation from '~/components/organisms/Navigation.vue'

// Head
useHead({
  title: 'Profile - ClaimReady',
  meta: [
    { name: 'description', content: 'Manage your ClaimReady profile and account information' }
  ]
})

const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const profile = reactive({
  userId: '',
  email: '',
  firstName: '',
  lastName: '',
  serviceBranch: '',
  isPremium: false,
  createdAt: new Date().toISOString(),
  totalDocuments: 0
})

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  serviceBranch: ''
})

// Load profile on mount
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    await loadProfile()
  } catch (err) {
    console.error('Failed to load profile:', err)
    localStorage.removeItem('auth_token')
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
})

// Load profile from API
const loadProfile = async () => {
  try {
    const { apiCall } = useApi()
    const response = await apiCall('/api/auth/profile')

    if (!response.ok) {
      throw new Error('Failed to load profile')
    }

    const data = await response.json()
    Object.assign(profile, data.user)

    // Initialize form with current values
    profileForm.firstName = profile.firstName
    profileForm.lastName = profile.lastName
    profileForm.email = profile.email
    profileForm.serviceBranch = profile.serviceBranch
  } catch (err: any) {
    console.error('Load profile error:', err)
    throw err
  }
}

// Save profile changes
const saveProfile = async () => {
  saving.value = true
  error.value = null
  success.value = false

  try {
    const { apiCall } = useApi()
    const response = await apiCall('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        serviceBranch: profileForm.serviceBranch
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update profile')
    }

    const data = await response.json()
    Object.assign(profile, data.user)

    success.value = true

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (err: any) {
    console.error('Save profile error:', err)
    error.value = err.message || 'Failed to update profile. Please try again.'
  } finally {
    saving.value = false
  }
}

// Reset form to current profile values
const resetForm = () => {
  profileForm.firstName = profile.firstName
  profileForm.lastName = profile.lastName
  profileForm.serviceBranch = profile.serviceBranch
  error.value = null
  success.value = false
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>
