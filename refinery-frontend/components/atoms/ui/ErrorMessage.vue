<template>
  <span v-if="error" class="error-message">
    {{ error }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  error?: string
}

defineProps<Props>()
</script>

<style scoped>
.error-message {
  display: block;
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
}
</style>