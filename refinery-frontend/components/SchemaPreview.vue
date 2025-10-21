<template>
  <div class="schema-section">
    <h3>📋 Generated Form Schema</h3>
    <div class="schema-preview">
      <div class="schema-header">
        <h4>{{ formSchema.title }}</h4>
        <p>{{ formSchema.description }}</p>
        <span class="version-badge">v{{ formSchema.version }}</span>
      </div>

      <div class="sections-preview">
        <div
          v-for="section in formSchema.sections"
          :key="section.id"
          class="section-card"
        >
          <h5>{{ section.title }}</h5>
          <p class="field-count">{{ section.fields.length }} fields</p>
          <div class="field-types">
            <span
              v-for="fieldType in getUniqueFieldTypes(section.fields)"
              :key="fieldType"
              class="field-type-badge"
            >
              {{ fieldType }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Field {
  type: string
}

interface Section {
  id: string
  title: string
  fields: Field[]
}

interface Props {
  formSchema: {
    title: string
    description: string
    version: string
    sections: Section[]
  }
}

defineProps<Props>()

const getUniqueFieldTypes = (fields: Field[]): string[] => {
  const types = fields.map(field => field.type)
  return [...new Set(types)]
}
</script>

<style scoped>
.schema-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.schema-section h3 {
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.schema-preview {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.schema-header {
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.schema-header h4 {
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.schema-header p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.version-badge {
  background: #374151;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.sections-preview {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.section-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.section-card h5 {
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.field-count {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.field-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.field-type-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
}

@media (max-width: 768px) {
  .schema-section {
    padding: 1.5rem;
  }

  .sections-preview {
    grid-template-columns: 1fr;
  }
}
</style>