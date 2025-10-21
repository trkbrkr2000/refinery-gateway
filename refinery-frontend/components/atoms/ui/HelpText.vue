<template>
  <span v-if="text" class="help-text">
    {{ text }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

defineProps<Props>()
</script>

<style scoped>
.help-text {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>