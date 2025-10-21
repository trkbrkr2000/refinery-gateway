<template>
  <div class="forms-dashboard">
    <div class="container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">My Forms</h1>
          <p class="page-subtitle">
            Manage your PDF forms and track submissions
          </p>
        </div>
        <div class="header-actions">
          <NuxtLink to="/forms/new" class="btn btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Create New Form
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-number">{{ forms.length }}</div>
            <div class="stat-label">Total Forms</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalSubmissions }}</div>
            <div class="stat-label">Total Submissions</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-number">{{ activeForms }}</div>
            <div class="stat-label">Active Forms</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-number">{{ completionRate }}%</div>
            <div class="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <!-- Forms List -->
      <div class="forms-section">
        <div class="section-header">
          <h2 class="section-title">Recent Forms</h2>
          <div class="section-filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your forms...</p>
        </div>

        <div v-else-if="filteredForms.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>No forms found</h3>
          <p>Get started by creating your first form from a PDF template.</p>
          <NuxtLink to="/forms/new" class="btn btn-primary">
            Create Your First Form
          </NuxtLink>
        </div>

        <div v-else class="forms-grid">
          <div
            v-for="form in filteredForms"
            :key="form.id"
            class="form-card"
            @click="navigateToForm(form.id)"
          >
            <div class="form-header">
              <div class="form-status" :class="form.status">
                {{ form.status }}
              </div>
              <div class="form-menu">
                <button class="menu-button" @click.stop="toggleFormMenu(form.id)">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-content">
              <h3 class="form-title">{{ form.title }}</h3>
              <p class="form-description">{{ form.description }}</p>

              <div class="form-stats">
                <div class="stat-item">
                  <svg class="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ form.submissionCount }} submissions</span>
                </div>
                <div class="stat-item">
                  <svg class="stat-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ formatDate(form.updatedAt) }}</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <NuxtLink :to="`/forms/${form.id}`" class="action-link">
                View Details
              </NuxtLink>
              <NuxtLink :to="`/forms/${form.id}/submissions`" class="action-link">
                Submissions
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'My Forms - FormReady',
  description: 'Manage your PDF forms and track submissions'
})

// Reactive data
const loading = ref(true)
const statusFilter = ref('')
const forms = ref([])

// List of known available form schemas
const knownFormIds = [
  'va-form-10-10ez-simple',
  'test-form',
  'va-21-526ez-minimal'
]

// Computed properties
const totalSubmissions = computed(() =>
  forms.value.reduce((total, form) => total + form.submissionCount, 0)
)

const activeForms = computed(() =>
  forms.value.filter(form => form.status === 'active').length
)

const completionRate = computed(() => {
  const totalForms = forms.value.length
  if (totalForms === 0) return 0
  return Math.round((activeForms.value / totalForms) * 100)
})

const filteredForms = computed(() => {
  if (!statusFilter.value) return forms.value
  return forms.value.filter(form => form.status === statusFilter.value)
})

// Methods
const navigateToForm = (formId: string) => {
  navigateTo(`/forms/${formId}`)
}

const toggleFormMenu = (formId: string) => {
  // TODO: Implement form menu functionality
  console.log('Toggle menu for form:', formId)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Lifecycle
onMounted(async () => {
  await loadForms()
})

// Load forms from API
const loadForms = async () => {
  try {
    loading.value = true
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    // Load each form schema individually
    const loadedForms = await Promise.all(
      knownFormIds.map(async (formId) => {
        try {
          const response = await fetch(
            `${apiUrl}/forms/${formId}/schema`,
            {
              headers: {
                'X-API-Key': 'test-api-key-dev-123'
              }
            }
          )

          if (!response.ok) return null

          const schema = await response.json()

          // Count fields
          let fieldsCount = 0
          if (schema.sections) {
            schema.sections.forEach(section => {
              if (section.fields) {
                fieldsCount += section.fields.length
              }
            })
          }

          return {
            id: schema.id || formId,
            title: schema.name || schema.title || 'Unnamed Form',
            description: schema.description || 'No description available',
            status: 'active',
            submissionCount: Math.floor(Math.random() * 100), // Mock data for now
            updatedAt: new Date(),
            pdfUrl: schema.pdfUrl,
            fieldsCount: fieldsCount,
            version: schema.version || '1.0.0'
          }
        } catch (error) {
          console.error(`Failed to load form ${formId}:`, error)
          return null
        }
      })
    )

    // Filter out failed loads and set forms
    forms.value = loadedForms.filter(form => form !== null)

  } catch (error) {
    console.error('Failed to load forms:', error)
    // Fallback to sample data
    forms.value = [
      {
        id: 'va-form-10-10ez-simple',
        title: 'VA Health Benefits Application',
        description: 'Apply for VA health benefits online',
        status: 'active',
        submissionCount: 42,
        updatedAt: new Date(),
        pdfUrl: '/templates/va-form-10-10ez.pdf'
      }
    ]
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forms-dashboard {
  min-height: 100vh;
  background: #f8faff;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Forms Section */
.forms-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Forms Grid */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.form-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.form-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.form-status.active {
  background: #d1fae5;
  color: #065f46;
}

.form-status.draft {
  background: #fef3c7;
  color: #92400e;
}

.form-status.archived {
  background: #f3f4f6;
  color: #374151;
}

.menu-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.form-content {
  padding: 1.5rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.form-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.action-link {
  font-size: 0.875rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.action-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .forms-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>