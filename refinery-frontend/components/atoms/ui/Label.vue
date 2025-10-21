<template>
  <label
    :for="htmlFor"
    :class="labelClasses"
  >
    <slot />
    <span v-if="required" class="required">*</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  htmlFor?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false
})

const labelClasses = computed(() => ({
  'label': true,
  'label--disabled': props.disabled
}))
</script>

<style scoped>
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.label--disabled {
  color: #9ca3af;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}
</style>