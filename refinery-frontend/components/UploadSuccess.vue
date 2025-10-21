<template>
  <div class="success-card">
    <div class="success-header">
      <div class="success-icon">✅</div>
      <h3>PDF Template Uploaded Successfully!</h3>
    </div>

    <div class="result-details">
      <div class="detail-item">
        <strong>Form ID:</strong> {{ uploadResult.formId }}
      </div>
      <div class="detail-item">
        <strong>Fields Discovered:</strong> {{ uploadResult.fieldsDiscovered }}
      </div>
      <div class="detail-item">
        <strong>File Size:</strong> {{ formatFileSize(uploadResult.fileSize) }}
      </div>
    </div>

    <div class="next-steps">
      <h4>🚀 Next Steps</h4>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">2</div>
          <h5>Generate Schema</h5>
          <p>AI will analyze your PDF and create an intelligent form schema</p>
          <button
            @click="$emit('generate-schema')"
            :disabled="isGeneratingSchema"
            class="btn btn-primary"
          >
            {{ isGeneratingSchema ? 'Generating...' : 'Generate Schema' }}
          </button>
        </div>

        <div v-if="hasSchema" class="step-card">
          <div class="step-number">3</div>
          <h5>View Form</h5>
          <p>See your dynamic web form in action</p>
          <button @click="$emit('view-form')" class="btn btn-secondary">
            View Form
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  uploadResult: {
    formId: string
    fieldsDiscovered: number
    fileSize: number
  }
  isGeneratingSchema: boolean
  hasSchema: boolean
}

defineProps<Props>()

defineEmits<{
  'generate-schema': []
  'view-form': []
}>()

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.success-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #10b981;
  margin-top: 2rem;
}

.success-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 2rem;
}

.success-header h3 {
  color: #10b981;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-item {
  font-size: 0.9rem;
  color: #374151;
}

.detail-item strong {
  color: #111827;
  font-weight: 600;
}

.next-steps h4 {
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.step-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.step-card:hover {
  border-color: #374151;
  transform: translateY(-2px);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #374151;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0 auto 1rem auto;
}

.step-card h5 {
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.step-card p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #111827;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #374151;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #5b6471;
}

@media (max-width: 768px) {
  .success-card {
    padding: 1.5rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style>