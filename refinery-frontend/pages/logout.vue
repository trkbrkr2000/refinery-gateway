<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; padding: 20px;">
    <div style="background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); width: 100%; max-width: 420px; padding: 40px; text-align: center;">

      <!-- Icon -->
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg v-if="isLoggingOut" style="width: 40px; height: 40px; color: white; animation: spin 1s linear infinite;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <!-- Message -->
      <h1 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0;">
        {{ isLoggingOut ? 'Signing out...' : 'Signed out successfully' }}
      </h1>
      <p style="color: #718096; font-size: 16px; margin: 0 0 24px 0;">
        {{ isLoggingOut ? 'Please wait while we sign you out' : 'You have been signed out of your account' }}
      </p>

      <!-- Actions -->
      <div v-if="!isLoggingOut" style="display: flex; flex-direction: column; gap: 12px;">
        <NuxtLink
          to="/auth/login"
          style="width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: block;"
        >
          Sign in again
        </NuxtLink>
        <NuxtLink
          to="/"
          style="width: 100%; padding: 14px 24px; background: white; color: #667eea; font-size: 16px; font-weight: 600; border: 2px solid #667eea; border-radius: 10px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: block;"
        >
          Go to home
        </NuxtLink>
      </div>
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
  title: 'Signing out - FormReady',
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(true)

onMounted(async () => {
  // Perform logout
  await authStore.logout()

  // Wait a moment for better UX
  await new Promise(resolve => setTimeout(resolve, 1000))

  isLoggingOut.value = false
})
</script>
