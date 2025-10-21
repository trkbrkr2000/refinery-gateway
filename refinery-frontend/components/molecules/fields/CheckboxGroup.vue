<template>
  <div class="checkbox-group">
    <Label :required="required">
      {{ label }}
    </Label>
    
    <div class="checkbox-items">
      <div
        v-for="option in options"
        :key="option.value"
        class="checkbox-item"
      >
        <Checkbox
          :id="`${id}-${option.value}`"
          v-model="value"
          :value="option.value"
          :disabled="disabled || option.disabled"
        />
        <label
          :for="`${id}-${option.value}`"
          class="checkbox-label"
        >
          {{ option.label }}
        </label>
      </div>
    </div>

    <HelpText :text="helpText" />
    <ErrorMessage :error="error" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Label from '~/components/atoms/ui/Label.vue'
import Checkbox from '~/components/atoms/inputs/Checkbox.vue'
import HelpText from '~/components/atoms/ui/HelpText.vue'
import ErrorMessage from '~/components/atoms/ui/ErrorMessage.vue'

interface CheckboxOption {
  label: string
  value: string
  disabled?: boolean
}

interface Props {
  modelValue: string[]
  id: string
  label: string
  options: CheckboxOption[]
  helpText?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const value = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.checkbox-label:hover {
  color: #111827;
}
</style>