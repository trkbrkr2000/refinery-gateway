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
        <h2 class="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p class="text-slate-600">Sign in to your ClaimReady account</p>
        <div class="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="heroicons:star" class="w-4 h-4" color="blue-600" />
          <span class="text-sm font-medium text-blue-800">Made for Veterans by Veterans</span>
        </div>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <form @submit.prevent="handleLogin" class="space-y-6">
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-slate-700">
                Remember me
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="exclamation-triangle" class="w-4 h-4" color="red-600" />
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
            <Spinner v-if="loading" class="w-4 h-4" color="white"/>
            <Icon v-else name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="mt-8 pt-6 border-t border-slate-200">
          <div class="text-center">
            <p class="text-sm text-slate-500">
              Don't have an account? 
              <a href="/auth/signup" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up here
              </a>
            </p>
            <div class="mt-4">
              <a href="/" class="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                ← Back to ClaimReady
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex">
          <Icon name="heroicons:shield-exclamation" class="w-4 h-4" color="amber-600" />
          <div class="text-sm text-amber-800">
            <strong>Secure Login:</strong> Your data is encrypted and protected. We never share your information.
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
  title: 'Sign In - ClaimReady',
  meta: [
    { name: 'description', content: 'Sign in to your ClaimReady account for VA claim tracking and analysis' }
  ]
})

const router = useRouter()

// Form state
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// Login handler
const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    // Use API composable for consistent URL handling
    const { apiCall } = useApi()
    const response = await apiCall('/auth/login', {
      method: 'POST',
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
        firstName: result.firstName,
        lastName: result.lastName,
        serviceBranch: result.serviceBranch,
        isPremium: result.isPremium || false
      }))

      // Redirect to dashboard
      await router.push('/dashboard')
    } else {
      error.value = result.error || 'Invalid email or password'
    }
  } catch (err: any) {
    error.value = 'Login failed. Please try again.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// Check if already logged in
onMounted(() => {
  const session = localStorage.getItem('user_session')
  if (session) {
    const sessionData = JSON.parse(session)
    const loginTime = new Date(sessionData.loginTime)
    const now = new Date()
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
    
    // Session expires after 24 hours
    if (hoursSinceLogin < 24) {
      router.push('/dashboard')
    } else {
      localStorage.removeItem('user_session')
    }
  }
})
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
