<template>
  <div>Redirecting...</div>
</template>

<script setup>
// Redirect /login to /auth/login
await navigateTo('/auth/login', { replace: true })
</script>