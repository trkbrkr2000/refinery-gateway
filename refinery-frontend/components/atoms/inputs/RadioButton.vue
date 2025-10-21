<template>
  <input
    :id="id"
    type="radio"
    :name="name"
    :checked="modelValue === value"
    :disabled="disabled"
    :required="required"
    :value="value"
    class="radio"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  id?: string
  name: string
  value: string | number
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const handleChange = () => {
  emit('update:modelValue', props.value)
}
</script>

<style scoped>
.radio {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio:checked {
  background: #374151;
  border-color: #374151;
}

.radio:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.radio:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>