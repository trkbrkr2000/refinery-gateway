<template>
  <div class="form-section">
    <div class="section-header" @click="toggleCollapse">
      <h3>{{ section.title }}</h3>
      <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
    </div>

    <p v-if="section.description" class="section-description">
      {{ section.description }}
    </p>

    <div v-show="!isCollapsed" class="section-fields">
      <component
        v-for="field in section.fields"
        :key="field.id"
        :is="getFieldComponent(field.type)"
        :id="field.id"
        :model-value="formData[field.id]"
        :label="field.label"
        :placeholder="field.placeholder"
        :help-text="field.helpText"
        :required="field.required"
        :disabled="field.disabled"
        :options="field.options"
        :error="errors[field.id]"
        @update:model-value="updateField(field.id, $event)"
        @validate="handleValidation(field.id, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextField from '~/components/molecules/fields/TextField.vue'
import CheckboxGroup from '~/components/molecules/fields/CheckboxGroup.vue'

interface Field {
  id: string
  type: string
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  options?: any[]
}

interface Section {
  id: string
  title: string
  description?: string
  fields: Field[]
}

interface Props {
  section: Section
  formData: Record<string, any>
  errors: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:field': [fieldId: string, value: any]
  'validate:field': [fieldId: string, error: string | undefined]
}>()

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const getFieldComponent = (type: string) => {
  const componentMap: Record<string, any> = {
    text: TextField,
    email: TextField,
    tel: TextField,
    number: TextField,
    checkbox: CheckboxGroup,
    checkboxGroup: CheckboxGroup
  }
  return componentMap[type] || TextField
}

const updateField = (fieldId: string, value: any) => {
  emit('update:field', fieldId, value)
}

const handleValidation = (fieldId: string, error: string | undefined) => {
  emit('validate:field', fieldId, error)
}
</script>

<style scoped>
.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.collapse-icon {
  color: #6b7280;
  font-size: 0.875rem;
}

.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.section-fields {
  display: flex;
  flex-direction: column;
}
</style>