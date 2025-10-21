<template>
  <div class="form-renderer">
    <div class="form-header">
      <h2>{{ schema.title }}</h2>
      <p v-if="schema.description" class="form-description">
        {{ schema.description }}
      </p>
    </div>

    <div class="form-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>
      <span class="progress-text">{{ completionPercentage }}% Complete</span>
    </div>

    <form @submit.prevent="handleSubmit">
      <FormSection
        v-for="section in schema.sections"
        :key="section.id"
        :section="section"
        :form-data="formData"
        :errors="errors"
        @update:field="updateField"
        @validate:field="validateField"
      />

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="saveDraft"
        >
          Save Draft
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!isValid || isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FormSection from '~/components/organisms/FormSection.vue'

interface FormSchema {
  formId: string
  title: string
  description?: string
  version: string
  sections: Array<{
    id: string
    title: string
    description?: string
    fields: Array<{
      id: string
      type: string
      label: string
      placeholder?: string
      helpText?: string
      required?: boolean
      disabled?: boolean
      options?: any[]
      validation?: any
    }>
  }>
}

interface Props {
  schema: FormSchema
  apiKey: string
  apiBaseUrl: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: Record<string, any>]
  'save-draft': [data: Record<string, any>]
  'error': [error: Error]
}>()

const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const touched = ref<Record<string, boolean>>({})

const completionPercentage = computed(() => {
  const allFields = props.schema.sections.flatMap(s => s.fields)
  const requiredFields = allFields.filter(f => f.required)
  const filledRequired = requiredFields.filter(f => {
    const value = formData.value[f.id]
    return value !== undefined && value !== '' && value !== null
  })

  if (requiredFields.length === 0) return 100
  return Math.round((filledRequired.length / requiredFields.length) * 100)
})

const isValid = computed(() => {
  const hasErrors = Object.values(errors.value).some(error => !!error)
  return completionPercentage.value === 100 && !hasErrors
})

const updateField = (fieldId: string, value: any) => {
  formData.value[fieldId] = value
  touched.value[fieldId] = true

  // Auto-save to localStorage
  saveToLocalStorage()
}

const validateField = (fieldId: string, error: string | undefined) => {
  if (error) {
    errors.value[fieldId] = error
  } else {
    delete errors.value[fieldId]
  }
}

const saveToLocalStorage = () => {
  const draft = {
    formId: props.schema.formId,
    data: formData.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(`form-draft-${props.schema.formId}`, JSON.stringify(draft))
}

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem(`form-draft-${props.schema.formId}`)
  if (saved) {
    try {
      const draft = JSON.parse(saved)
      formData.value = draft.data || {}
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}

const saveDraft = async () => {
  try {
    const response = await $fetch(`${props.apiBaseUrl}/forms/${props.schema.formId}/drafts`, {
      method: 'PUT',
      headers: {
        'X-API-Key': props.apiKey
      },
      body: {
        data: formData.value,
        version: props.schema.version
      }
    })

    emit('save-draft', formData.value)
    saveToLocalStorage()
  } catch (error) {
    console.error('Failed to save draft:', error)
    emit('error', error as Error)
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return

  isSubmitting.value = true

  try {
    const response = await $fetch(`${props.apiBaseUrl}/forms/${props.schema.formId}/submissions`, {
      method: 'POST',
      headers: {
        'X-API-Key': props.apiKey
      },
      body: {
        data: formData.value,
        version: props.schema.version
      }
    })

    // Clear draft on successful submission
    localStorage.removeItem(`form-draft-${props.schema.formId}`)

    emit('submit', formData.value)
  } catch (error) {
    console.error('Failed to submit form:', error)
    emit('error', error as Error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
.form-renderer {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.form-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #111827;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #374151;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .form-renderer {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>