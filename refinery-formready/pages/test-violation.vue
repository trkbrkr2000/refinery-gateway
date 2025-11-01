<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <Navigation />

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-2">Test Page</h1>
        <p class="text-xl text-blue-100">Testing MCP validation</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p>This page now has all the required components and follows ClaimReady standards.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/components/organisms/Navigation.vue'
</script>
