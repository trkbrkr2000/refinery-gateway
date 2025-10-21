<template>
  <div class="text-field">
    <Label
      :html-for="id"
      :required="required"
      :disabled="disabled"
    >
      {{ label }}
    </Label>

    <BaseInput
      :id="id"
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :has-error="!!error"
      @blur="handleBlur"
      @focus="$emit('focus')"
    />

    <HelpText :text="helpText" />
    <ErrorMessage :error="error" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Label from '~/components/atoms/ui/Label.vue'
import BaseInput from '~/components/atoms/inputs/BaseInput.vue'
import HelpText from '~/components/atoms/ui/HelpText.vue'
import ErrorMessage from '~/components/atoms/ui/ErrorMessage.vue'

interface Props {
  modelValue: string | number
  id: string
  label: string
  type?: string
  placeholder?: string
  helpText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  validation?: (value: string | number) => string | undefined
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
  'validate': [error: string | undefined]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleBlur = () => {
  if (props.validation) {
    const validationError = props.validation(value.value)
    emit('validate', validationError)
  }
  emit('blur')
}
</script>

<style scoped>
.text-field {
  margin-bottom: 1.5rem;
}
</style>