<template>
  <div class="upload-section">
    <h2>Upload PDF Template</h2>
    <p class="section-description">
      Start by uploading a fillable PDF form. We support VA forms, government documents,
      and any PDF with form fields.
    </p>

    <FileUpload
      :api-key="apiKey"
      :api-base-url="apiBaseUrl"
      :max-file-size="maxFileSize"
      @upload-success="$emit('upload-success', $event)"
      @upload-error="$emit('upload-error', $event)"
      @file-selected="$emit('file-selected', $event)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  apiKey: string
  apiBaseUrl: string
  maxFileSize: number
}

defineProps<Props>()

defineEmits<{
  'upload-success': [data: { formId: string; result: any; file: File }]
  'upload-error': [data: { error: Error; file: File; formId: string }]
  'file-selected': [data: { file: File; formId: string }]
}>()
</script>

<style scoped>
.upload-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.upload-section h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .upload-section {
    padding: 1.5rem;
  }
}
</style>