<template>
  <input
    :id="id"
    type="checkbox"
    :checked="modelValue"
    :disabled="disabled"
    :required="required"
    :value="value"
    class="checkbox"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean | string[]
  id?: string
  value?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      newValue.push(props.value!)
    } else {
      const index = newValue.indexOf(props.value!)
      if (index > -1) newValue.splice(index, 1)
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', target.checked)
  }
}
</script>

<style scoped>
.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox:checked {
  background: #374151;
  border-color: #374151;
}

.checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>