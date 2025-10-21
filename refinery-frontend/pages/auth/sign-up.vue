<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <h2 class="text-center text-3xl font-bold">Sign Up</h2>
      <SignUp />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SignUp } from '@clerk/vue'

definePageMeta({
  layout: false
})
</script>