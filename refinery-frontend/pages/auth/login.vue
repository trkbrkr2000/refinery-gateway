<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; padding: 20px;">
    <!-- Login Card -->
    <div style="background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); width: 100%; max-width: 420px; padding: 40px;">

      <!-- Logo & Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0;">Welcome Back</h1>
        <p style="color: #718096; font-size: 16px; margin: 0;">Sign in to continue to FormReady</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" style="margin-bottom: 24px;">
        <!-- Email Field -->
        <div style="margin-bottom: 20px;">
          <label for="email" style="display: block; font-size: 14px; font-weight: 600; color: #4a5568; margin-bottom: 8px;">
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px; transition: all 0.3s; outline: none; box-sizing: border-box;"
            :style="{ borderColor: emailFocused ? '#667eea' : '#e2e8f0' }"
            @focus="emailFocused = true"
            @blur="emailFocused = false"
          />
        </div>

        <!-- Password Field -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <label for="password" style="font-size: 14px; font-weight: 600; color: #4a5568;">
              Password
            </label>
            <a href="#" style="font-size: 14px; color: #667eea; text-decoration: none; font-weight: 500;">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px; transition: all 0.3s; outline: none; box-sizing: border-box;"
            :style="{ borderColor: passwordFocused ? '#667eea' : '#e2e8f0' }"
            @focus="passwordFocused = true"
            @blur="passwordFocused = false"
          />
        </div>

        <!-- Remember Me -->
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <input
            id="remember"
            type="checkbox"
            style="width: 20px; height: 20px; border: 2px solid #e2e8f0; border-radius: 4px; margin-right: 10px; cursor: pointer;"
          />
          <label for="remember" style="color: #4a5568; font-size: 14px; cursor: pointer; user-select: none;">
            Remember me for 30 days
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="authStore?.error" style="background: #fee; border: 1px solid #fcc; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
          <p style="color: #c53030; font-size: 14px; margin: 0; display: flex; align-items: center;">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ authStore.error }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore?.isLoading || !form.email || !form.password"
          style="width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;"
          :style="{
            opacity: (authStore?.isLoading || !form.email || !form.password) ? 0.5 : 1,
            cursor: (authStore?.isLoading || !form.email || !form.password) ? 'not-allowed' : 'pointer',
            transform: buttonHovered && !authStore?.isLoading && form.email && form.password ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: buttonHovered && !authStore?.isLoading && form.email && form.password ? '0 10px 20px rgba(102, 126, 234, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }"
          @mouseenter="buttonHovered = true"
          @mouseleave="buttonHovered = false"
        >
          <span v-if="authStore?.isLoading" style="display: flex; align-items: center; justify-content: center;">
            <svg style="width: 20px; height: 20px; margin-right: 8px; animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
              <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Divider -->
      <div style="display: flex; align-items: center; margin: 30px 0;">
        <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
        <span style="padding: 0 16px; color: #a0aec0; font-size: 14px;">OR</span>
        <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
      </div>

      <!-- Social Login Buttons -->
      <div style="display: grid; gap: 12px; margin-bottom: 30px;">
        <button
          @click="handleGoogleSignIn"
          :disabled="firebaseAuth.isLoading.value"
          style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-size: 14px; font-weight: 600; color: #4a5568; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;"
          onmouseover="this.style.borderColor='#667eea'; this.style.background='#f7fafc'"
          onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='white'">
          <svg style="width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ firebaseAuth.isLoading.value ? 'Signing in...' : 'Continue with Google' }}
        </button>

        <button
          @click="handleGithubSignIn"
          :disabled="firebaseAuth.isLoading.value"
          style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: white; font-size: 14px; font-weight: 600; color: #4a5568; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;"
          onmouseover="this.style.borderColor='#667eea'; this.style.background='#f7fafc'"
          onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='white'">
          <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {{ firebaseAuth.isLoading.value ? 'Signing in...' : 'Continue with GitHub' }}
        </button>
      </div>

      <!-- Sign Up Link -->
      <p style="text-align: center; color: #718096; font-size: 14px; margin: 0;">
        Don't have an account?
        <NuxtLink to="/auth/register" style="color: #667eea; font-weight: 600; text-decoration: none; transition: color 0.3s;"
                  onmouseover="this.style.color='#764ba2'"
                  onmouseout="this.style.color='#667eea'">
          Sign up for free
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<style>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<script setup lang="ts">
definePageMeta({
  title: 'Sign In - FormReady',
  layout: false,
  middleware: 'guest'
})

const authStore = useAuthStore()
const router = useRouter()
const firebaseAuth = useFirebaseAuth()

const form = reactive({
  email: '',
  password: ''
})

const emailFocused = ref(false)
const passwordFocused = ref(false)
const buttonHovered = ref(false)

// Clear any previous errors when component mounts
onMounted(() => {
  authStore.clearError()
})

// Redirect if already authenticated
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    router.push('/dashboard')
  }
}, { immediate: true })

async function handleLogin() {
  authStore.clearError()

  const result = await authStore.login(form.email, form.password)

  if (result.success) {
    // Redirect to dashboard or intended page
    const redirect = useRoute().query.redirect as string
    await router.push(redirect || '/dashboard')
  }
  // Error is handled by the store and displayed in template
}

async function handleGoogleSignIn() {
  authStore.clearError()

  const result = await firebaseAuth.signInWithGoogle()

  if (result.success) {
    // Redirect to dashboard or intended page
    const redirect = useRoute().query.redirect as string
    await router.push(redirect || '/dashboard')
  } else if (result.error) {
    authStore.error = result.error
  }
}

async function handleGithubSignIn() {
  authStore.clearError()

  const result = await firebaseAuth.signInWithGithub()

  if (result.success) {
    // Redirect to dashboard or intended page
    const redirect = useRoute().query.redirect as string
    await router.push(redirect || '/dashboard')
  } else if (result.error) {
    authStore.error = result.error
  }
}
</script>