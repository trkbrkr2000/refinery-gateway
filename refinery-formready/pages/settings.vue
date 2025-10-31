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
            <h1 class="text-4xl font-bold mb-2">Settings</h1>
            <p class="text-xl text-blue-100">Manage your account preferences and settings</p>
          </div>
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Icon name="heroicons:cog-6-tooth" class="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-slate-600">Loading settings...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- Account Settings -->
        <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Account Settings</h2>

          <div class="space-y-6">
            <!-- Email -->
            <div class="flex items-center justify-between py-4 border-b border-slate-200">
              <div>
                <div class="font-medium text-slate-900">Email Address</div>
                <div class="text-sm text-slate-600">{{ user.email }}</div>
              </div>
              <Badge text="Verified" variant="success" />
            </div>

            <!-- Password -->
            <div class="flex items-center justify-between py-4 border-b border-slate-200">
              <div>
                <div class="font-medium text-slate-900">Password</div>
                <div class="text-sm text-slate-600">Last changed {{ getPasswordAge() }}</div>
              </div>
              <Button @click="showPasswordModal = true" variant="secondary">
                Change Password
              </Button>
            </div>

            <!-- Account Type -->
            <div class="flex items-center justify-between py-4">
              <div>
                <div class="font-medium text-slate-900">Account Type</div>
                <div class="text-sm text-slate-600">
                  {{ user.isPremium ? 'Premium Member' : 'Free Member' }}
                </div>
              </div>
              <Badge
                :text="user.isPremium ? 'Premium' : 'Free'"
                :variant="user.isPremium ? 'success' : 'neutral'"
              />
            </div>
          </div>
        </div>

        <!-- Email Preferences -->
        <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Email Preferences</h2>

          <div class="space-y-4">
            <!-- Analysis Complete -->
            <div class="flex items-center justify-between py-3">
              <div>
                <div class="font-medium text-slate-900">Analysis Complete</div>
                <div class="text-sm text-slate-600">Receive email when document analysis is complete</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="emailPreferences.analysisComplete"
                  @change="saveEmailPreferences"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Marketing Emails -->
            <div class="flex items-center justify-between py-3">
              <div>
                <div class="font-medium text-slate-900">Marketing Emails</div>
                <div class="text-sm text-slate-600">Receive updates about new features and tips</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="emailPreferences.marketing"
                  @change="saveEmailPreferences"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Weekly Summary -->
            <div class="flex items-center justify-between py-3">
              <div>
                <div class="font-medium text-slate-900">Weekly Summary</div>
                <div class="text-sm text-slate-600">Receive weekly summary of your analyses</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="emailPreferences.weeklySummary"
                  @change="saveEmailPreferences"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="preferencesSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 mr-2" />
              <span class="text-green-800">Email preferences updated successfully!</span>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Privacy Settings</h2>

          <div class="space-y-4">
            <!-- Data Retention -->
            <div class="flex items-center justify-between py-3">
              <div>
                <div class="font-medium text-slate-900">Data Retention</div>
                <div class="text-sm text-slate-600">Keep my analysis data for future reference</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="privacySettings.dataRetention"
                  @change="savePrivacySettings"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Analytics -->
            <div class="flex items-center justify-between py-3">
              <div>
                <div class="font-medium text-slate-900">Usage Analytics</div>
                <div class="text-sm text-slate-600">Help improve ClaimReady by sharing anonymous usage data</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="privacySettings.analytics"
                  @change="savePrivacySettings"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="privacySuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 mr-2" />
              <span class="text-green-800">Privacy settings updated successfully!</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200">
          <h2 class="text-2xl font-bold text-red-600 mb-6">Danger Zone</h2>

          <div class="space-y-4">
            <!-- Delete All Documents -->
            <div class="p-4 border border-red-200 rounded-lg bg-red-50">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-slate-900 mb-1">Delete All Documents</div>
                  <div class="text-sm text-slate-600">
                    Permanently delete all uploaded documents and analyses. This action cannot be undone.
                  </div>
                </div>
                <Button
                  @click="showDeleteDocumentsModal = true"
                  variant="danger"
                  class="ml-4 whitespace-nowrap"
                >
                  Delete Documents
                </Button>
              </div>
            </div>

            <!-- Delete Account -->
            <div class="p-4 border-2 border-red-300 rounded-lg bg-red-100">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-red-900 mb-1">Delete Account</div>
                  <div class="text-sm text-red-800">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </div>
                </div>
                <Button
                  @click="showDeleteAccountModal = true"
                  variant="danger"
                  class="ml-4 whitespace-nowrap bg-red-600 hover:bg-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-6">Change Password</h3>

        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div v-if="passwordError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-600 mr-2" />
              <span class="text-red-800 text-sm">{{ passwordError }}</span>
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-6">
            <Button type="button" @click="closePasswordModal" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" :disabled="changingPassword">
              <span v-if="!changingPassword">Change Password</span>
              <span v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing...
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Documents Modal -->
    <div v-if="showDeleteDocumentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div class="text-center mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Delete All Documents?</h3>
          <p class="text-slate-600">This will permanently delete all your uploaded documents and analyses. This action cannot be undone.</p>
        </div>

        <div class="flex justify-end space-x-4">
          <Button @click="showDeleteDocumentsModal = false" variant="secondary">
            Cancel
          </Button>
          <Button @click="deleteAllDocuments" variant="danger" class="bg-red-600 hover:bg-red-700">
            Delete All Documents
          </Button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteAccountModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div class="text-center mb-6">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Delete Your Account?</h3>
          <p class="text-slate-600 mb-4">This will permanently delete your account and all associated data. This action cannot be undone.</p>

          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-red-800 mb-2">Type <strong>DELETE</strong> to confirm:</p>
            <input
              v-model="deleteConfirmation"
              type="text"
              class="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="DELETE"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <Button @click="closeDeleteAccountModal" variant="secondary">
            Cancel
          </Button>
          <Button
            @click="deleteAccount"
            variant="danger"
            class="bg-red-600 hover:bg-red-700"
            :disabled="deleteConfirmation !== 'DELETE'"
          >
            Delete Account
          </Button>
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
  title: 'Settings - ClaimReady',
  meta: [
    { name: 'description', content: 'Manage your ClaimReady account settings and preferences' }
  ]
})

const router = useRouter()

// State
const loading = ref(true)
const showPasswordModal = ref(false)
const showDeleteDocumentsModal = ref(false)
const showDeleteAccountModal = ref(false)
const changingPassword = ref(false)
const passwordError = ref<string | null>(null)
const preferencesSuccess = ref(false)
const privacySuccess = ref(false)
const deleteConfirmation = ref('')

const user = reactive({
  email: '',
  isPremium: false,
  passwordChangedAt: new Date().toISOString()
})

const emailPreferences = reactive({
  analysisComplete: true,
  marketing: true,
  weeklySummary: false
})

const privacySettings = reactive({
  dataRetention: true,
  analytics: true
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Load settings on mount
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/auth/login')
    return
  }

  try {
    await loadSettings()
  } catch (err) {
    console.error('Failed to load settings:', err)
    localStorage.removeItem('auth_token')
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
})

// Load settings from API
const loadSettings = async () => {
  try {
    const { apiCall } = useApi()

    // Load user profile
    const profileResponse = await apiCall('/api/auth/profile')
    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      Object.assign(user, profileData.user)
    }

    // Load email preferences
    const preferencesResponse = await apiCall('/api/auth/preferences')
    if (preferencesResponse.ok) {
      const preferencesData = await preferencesResponse.json()
      Object.assign(emailPreferences, preferencesData.emailPreferences || {})
      Object.assign(privacySettings, preferencesData.privacySettings || {})
    }
  } catch (err: any) {
    console.error('Load settings error:', err)
    throw err
  }
}

// Save email preferences
const saveEmailPreferences = async () => {
  try {
    const { apiCall } = useApi()
    await apiCall('/api/auth/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailPreferences })
    })

    preferencesSuccess.value = true
    setTimeout(() => { preferencesSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Save email preferences error:', err)
  }
}

// Save privacy settings
const savePrivacySettings = async () => {
  try {
    const { apiCall } = useApi()
    await apiCall('/api/auth/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ privacySettings })
    })

    privacySuccess.value = true
    setTimeout(() => { privacySuccess.value = false }, 3000)
  } catch (err) {
    console.error('Save privacy settings error:', err)
  }
}

// Change password
const changePassword = async () => {
  passwordError.value = null

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  if (passwordForm.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }

  changingPassword.value = true

  try {
    const { apiCall } = useApi()
    const response = await apiCall('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to change password')
    }

    closePasswordModal()
  } catch (err: any) {
    passwordError.value = err.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

// Close password modal
const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordError.value = null
}

// Delete all documents
const deleteAllDocuments = async () => {
  try {
    const { apiCall } = useApi()
    await apiCall('/api/documents', {
      method: 'DELETE'
    })

    showDeleteDocumentsModal.value = false
    router.push('/dashboard')
  } catch (err) {
    console.error('Delete documents error:', err)
  }
}

// Delete account
const deleteAccount = async () => {
  if (deleteConfirmation.value !== 'DELETE') return

  try {
    const { apiCall } = useApi()
    await apiCall('/api/auth/account', {
      method: 'DELETE'
    })

    localStorage.removeItem('auth_token')
    router.push('/')
  } catch (err) {
    console.error('Delete account error:', err)
  }
}

// Close delete account modal
const closeDeleteAccountModal = () => {
  showDeleteAccountModal.value = false
  deleteConfirmation.value = ''
}

// Get password age
const getPasswordAge = () => {
  const changedAt = new Date(user.passwordChangedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - changedAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `over a year ago`
}
</script>
