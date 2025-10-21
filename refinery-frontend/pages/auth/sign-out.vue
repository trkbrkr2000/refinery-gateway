<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4">Signed out</h2>
      <p class="text-gray-600">You have been signed out successfully</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

onMounted(async () => {
  if (process.client) {
    // Clear all storage
    try {
      localStorage.clear()
      sessionStorage.clear()

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      })
    } catch (error) {
      console.warn('Error clearing storage:', error)
    }

    // Force a full page reload to clear all state
    window.location.href = '/auth/sign-in'
  }
})
</script>