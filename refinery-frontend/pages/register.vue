<template>
  <div>Redirecting...</div>
</template>

<script setup>
// Redirect /register to /auth/register
await navigateTo('/auth/register', { replace: true })
</script>