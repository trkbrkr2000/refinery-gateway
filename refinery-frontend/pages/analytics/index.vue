<template>
  <div class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Analytics Dashboard</h1>
        <p class="page-description">Monitor your form performance and submission metrics</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedTimeRange" class="time-range-select" @change="refreshData">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load analytics</h3>
      <p>{{ error }}</p>
      <button @click="refreshData" class="retry-button">Try Again</button>
    </div>

    <!-- Analytics Content -->
    <div v-else class="analytics-content">
      <!-- Overview Metrics -->
      <section class="metrics-section">
        <h2 class="section-title">Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">{{ overview?.overview?.totalForms || 0 }}</div>
              <div class="metric-label">Total Forms</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📄</div>
            <div class="metric-content">
              <div class="metric-value">{{ overview?.overview?.totalSubmissions || 0 }}</div>
              <div class="metric-label">Total Submissions</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
              <div class="metric-value">{{ overview?.recent?.submissionsToday || 0 }}</div>
              <div class="metric-label">Today's Submissions</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">✏️</div>
            <div class="metric-content">
              <div class="metric-value">{{ overview?.overview?.totalDrafts || 0 }}</div>
              <div class="metric-label">Draft Forms</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section">
        <div class="charts-grid">
          <!-- Weekly Trends -->
          <div class="chart-card">
            <h3 class="chart-title">Weekly Trends</h3>
            <div class="chart-placeholder">
              <div class="chart-data" v-if="dashboard?.weeklyTrends?.length">
                <div class="trend-chart">
                  <div
                    v-for="(point, index) in dashboard.weeklyTrends"
                    :key="index"
                    class="trend-bar"
                    :style="{ height: `${(point.count / maxSubmissions) * 100}%` }"
                    :title="`${point.date}: ${point.count} submissions`"
                  ></div>
                </div>
                <div class="chart-labels">
                  <span v-for="(point, index) in dashboard.weeklyTrends.slice(0, 7)" :key="index">
                    {{ formatDate(point.date) }}
                  </span>
                </div>
              </div>
              <div v-else class="chart-empty">
                📊 No weekly trend data available
              </div>
            </div>
          </div>

          <!-- Form Performance -->
          <div class="chart-card">
            <h3 class="chart-title">Top Performing Forms</h3>
            <div class="performance-list">
              <div
                v-for="form in dashboard?.topPerformingForms?.slice(0, 5)"
                :key="form._id"
                class="performance-item"
              >
                <div class="form-info">
                  <div class="form-name">{{ form.fileName || 'Untitled Form' }}</div>
                  <div class="form-submissions">{{ form.submissionCount }} submissions</div>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${(form.submissionCount / maxFormSubmissions) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div v-if="!dashboard?.topPerformingForms?.length" class="performance-empty">
                📋 No form data available
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-list">
          <div
            v-for="activity in dashboard?.recentActivity?.slice(0, 10)"
            :key="activity._id"
            class="activity-item"
          >
            <div class="activity-icon">
              {{ activity.status === 'submitted' ? '✅' : '📝' }}
            </div>
            <div class="activity-content">
              <div class="activity-title">
                {{ activity.status === 'submitted' ? 'Form Submitted' : 'Draft Saved' }}
              </div>
              <div class="activity-details">
                Form: {{ activity.formFileName || 'Untitled' }} •
                {{ formatRelativeTime(activity.date) }}
              </div>
            </div>
          </div>
          <div v-if="!dashboard?.recentActivity?.length" class="activity-empty">
            📝 No recent activity
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AnalyticsOverview {
  overview: {
    totalForms: number
    totalSubmissions: number
    totalDrafts: number
    completionRate: number
    avgSubmissionsPerForm: number
  }
  recent: {
    submissionsToday: number
    submissionsThisWeek: number
    draftsToday: number
  }
}

interface TopForm {
  _id: string
  fileName: string
  submissionCount: number
}

interface RecentActivity {
  _id: string
  formFileName: string
  status: 'submitted' | 'draft'
  date: string
}

interface DashboardData {
  recentActivity: RecentActivity[]
  topPerformingForms: TopForm[]
  weeklyTrends: any[]
}

// Page metadata
definePageMeta({
  title: 'Analytics',
  description: 'View form analytics and performance metrics'
})

// Reactive state
const loading = ref(true)
const error = ref<string | null>(null)
const selectedTimeRange = ref('30d')
const overview = ref<AnalyticsOverview | null>(null)
const dashboard = ref<DashboardData | null>(null)

// Computed values
const maxSubmissions = computed(() => {
  if (!dashboard.value?.weeklyTrends?.length) return 1
  return Math.max(...dashboard.value.weeklyTrends.map(p => p.count || 1))
})

const maxFormSubmissions = computed(() => {
  if (!dashboard.value?.topPerformingForms?.length) return 1
  return Math.max(...dashboard.value.topPerformingForms.map(f => f.submissionCount))
})

// API client and config
const config = useRuntimeConfig()
const authStore = useAuthStore()
const api = useApi()

// Data fetching
const fetchAnalyticsData = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔍 Fetching analytics data...')
    console.log('📡 API Base URL:', config.public.apiUrl)

    const [overviewResponse, dashboardResponse] = await Promise.all([
      api.get<AnalyticsOverview>('/api/v1/forms/analytics/overview', {
        timeRange: selectedTimeRange.value
      }),
      api.get<DashboardData>('/api/v1/forms/analytics/dashboard', {
        timeRange: selectedTimeRange.value
      })
    ])

    console.log('✅ Overview Response:', overviewResponse)
    console.log('✅ Dashboard Response:', dashboardResponse)

    overview.value = overviewResponse
    dashboard.value = dashboardResponse
  } catch (err: any) {
    console.error('❌ Failed to fetch analytics:', err)
    console.error('❌ Error details:', {
      message: err.message,
      status: err.status,
      stack: err.stack
    })
    error.value = err.message || 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const refreshData = () => {
  fetchAnalyticsData()
}

// Lifecycle
onMounted(() => {
  fetchAnalyticsData()
})
</script>

<style scoped>
.analytics-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-content h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-description {
  margin: 0.5rem 0 0 0;
  color: #6b7280;
  font-size: 1rem;
}

.time-range-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Loading and Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  color: #dc2626;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #5a6fd8;
}

/* Metrics Section */
.metrics-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 8px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Charts Section */
.charts-section {
  margin-bottom: 3rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  padding: 0 0.5rem;
  gap: 4px;
}

.trend-bar {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  min-height: 2px;
  flex: 1;
  cursor: pointer;
  transition: opacity 0.2s;
}

.trend-bar:hover {
  opacity: 0.8;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Performance List */
.performance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-info {
  flex: 1;
}

.form-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.form-submissions {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.performance-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 2rem;
}

/* Activity Section */
.activity-section {
  margin-bottom: 2rem;
}

.activity-list {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.25rem;
  width: 2rem;
  text-align: center;
}

.activity-title {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.activity-details {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.activity-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-labels span:nth-child(n+4) {
    display: none;
  }
}
</style>