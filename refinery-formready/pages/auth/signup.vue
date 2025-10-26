<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- Patriotic Background Pattern -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute top-40 left-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="bg-white p-4 rounded-full shadow-lg">
            <Icon name="heroicons:shield-check" class="w-8 h-8" color="blue-600" />
          </div>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-2">Join ClaimReady</h2>
        <p class="text-slate-600">Made for veterans by veterans</p>
        <div class="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="heroicons:star" class="w-4 h-4 mr-2" color="red-600" />
          <span class="text-sm font-medium text-blue-800">Free Analysis + Premium Features</span>
        </div>
      </div>

      <!-- Signup Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <form @submit.prevent="handleSignup" class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-slate-700 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-slate-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:envelope" class="w-4 h-4" color="slate-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:lock-closed" class="w-4 h-4" color="slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Create a secure password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showPassword ? 'eye-slash' : 'eye'" 
                  class="w-4 h-4" 
                  color="slate-400" 
                />
              </button>
            </div>
          </div>

          <!-- Service Branch -->
          <div>
            <label for="serviceBranch" class="block text-sm font-medium text-slate-700 mb-2">
              Service Branch
            </label>
            <select
              id="serviceBranch"
              v-model="form.serviceBranch"
              class="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your branch</option>
              <option value="army">Army</option>
              <option value="navy">Navy</option>
              <option value="air-force">Air Force</option>
              <option value="marines">Marines</option>
              <option value="coast-guard">Coast Guard</option>
              <option value="space-force">Space Force</option>
            </select>
          </div>

          <!-- Terms and Privacy -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-1"
            />
            <label for="terms" class="ml-2 block text-sm text-slate-700">
              I agree to the 
              <a href="/terms" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
              and 
              <a href="/privacy" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="exclamation-triangle" class="w-4 h-4 mr-2 mt-0.5" color="red-600" />
              <div class="text-sm text-red-800">{{ error }}</div>
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :disabled="loading"
            class="w-full"
          >
            <Spinner v-if="loading" class="w-4 h-4 mr-2" color="red-600" />
            <Icon v-else name="user-plus" class="w-4 h-4 mr-2" />
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </Button>
        </form>

        <!-- Login Link -->
        <div class="mt-8 pt-6 border-t border-slate-200">
          <div class="text-center">
            <p class="text-sm text-slate-500">
              Already have an account? 
              <a href="/auth/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Premium Features Preview -->
      <div class="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-4 text-center">Premium Features</h3>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex items-center">
            <Icon name="chart-line" class="w-4 h-4 mr-3" color="blue-600" />
            <span class="text-sm text-slate-700">Claim tracking over time</span>
          </div>
          <div class="flex items-center">
            <Icon name="heroicons:shield-check" class="w-4 h-4 mr-3" color="blue-600" />
            <span class="text-sm text-slate-700">Advanced analytics & predictions</span>
          </div>
          <div class="flex items-center">
            <Icon name="puzzle-piece" class="w-4 h-4 mr-3" color="blue-600" />
            <span class="text-sm text-slate-700">Chrome extension for VA.gov sync</span>
          </div>
          <div class="flex items-center">
            <Icon name="users" class="w-4 h-4 mr-3" color="blue-600" />
            <span class="text-sm text-slate-700">Personalized VSO recommendations</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'
import Spinner from '~/components/atoms/Spinner.vue'

// Head
useHead({
  title: 'Sign Up - ClaimReady',
  meta: [
    { name: 'description', content: 'Join ClaimReady for free VA decision letter analysis and premium claim tracking' }
  ]
})

const router = useRouter()

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  serviceBranch: '',
  acceptTerms: false
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// Signup handler
const handleSignup = async () => {
  loading.value = true
  error.value = null

  try {
    // Create user account
    const response = await fetch('http://localhost:3001/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const result = await response.json()

    if (result.success) {
      // Store JWT token for API authentication
      localStorage.setItem('auth_token', result.accessToken)
      
      // Store user data for display
      localStorage.setItem('user_data', JSON.stringify({
        userId: result.userId,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        serviceBranch: form.serviceBranch,
        isPremium: result.isPremium || false
      }))

      // Redirect to dashboard
      await router.push('/dashboard')
    } else {
      error.value = result.error || 'Signup failed'
    }
  } catch (err: any) {
    error.value = 'Signup failed. Please try again.'
    console.error('Signup error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
