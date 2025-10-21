<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :class="inputClasses"
    @input="handleInput"
    @blur="$emit('blur')"
    @focus="$emit('focus')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  hasError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  hasError: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const inputClasses = computed(() => ({
  'base-input': true,
  'base-input--error': props.hasError,
  'base-input--disabled': props.disabled
}))
</script>

<style scoped>
.base-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: all 0.2s ease;
}

.base-input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.base-input--error {
  border-color: #ef4444;
}

.base-input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.base-input::placeholder {
  color: #9ca3af;
}
</style>