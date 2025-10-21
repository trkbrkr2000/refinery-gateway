<template>
  <textarea
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :rows="rows"
    :class="textareaClasses"
    @input="handleInput"
    @blur="$emit('blur')"
    @focus="$emit('focus')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  id?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  hasError?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  required: false,
  hasError: false,
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
  'focus': []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const textareaClasses = computed(() => ({
  'textarea': true,
  'textarea--error': props.hasError,
  'textarea--disabled': props.disabled
}))
</script>

<style scoped>
.textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.textarea--error {
  border-color: #ef4444;
}

.textarea--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea--disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.textarea::placeholder {
  color: #9ca3af;
}
</style>