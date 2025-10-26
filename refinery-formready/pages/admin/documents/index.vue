<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Button 
              @click="navigateTo('/admin/dashboard')"
              variant="secondary"
              class="w-4 h-4"
            >
              <Icon name="arrow-left" class="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Icon name="folder-open" class="w-6 h-6 mr-3" color="blue-600" />
            <div>
              <h1 class="text-xl font-bold text-slate-900">Manage Documents</h1>
              <p class="text-sm text-slate-500">View and manage the VA knowledge base</p>
            </div>
          </div>
          
          <Button 
            @click="navigateTo('/admin/documents/upload')"
            variant="primary"
            class="w-4 h-4"
          >
            <Icon name="cloud-arrow-up" class="w-4 h-4 mr-2" />
            Upload New
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters and Search -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="magnifying-glass" class="w-4 h-4" color="slate-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search documents..."
              />
            </div>
          </div>

          <!-- Document Type Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              v-model="selectedType"
              class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option v-for="type in documentTypes" :key="type.value" :value="type.value">
                {{ type.name }}
              </option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              v-model="dateRange"
              class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-end space-x-2">
            <Button 
              @click="applyFilters"
              variant="primary"
              class="w-4 h-4"
            >
              <Icon name="funnel" class="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              @click="clearFilters"
              variant="secondary"
              class="w-4 h-4"
            >
              <Icon name="x-mark" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">
              Documents ({{ filteredDocuments.length }})
            </h2>
            <div class="flex items-center space-x-2">
              <Button 
                @click="refreshDocuments"
                variant="secondary"
                class="w-4 h-4"
                :disabled="loading"
              >
                <Spinner v-if="loading" class="w-4 h-4 mr-2" color="white" />
                <Icon v-else name="arrow-path" class="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Citation
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Chunks
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr 
                v-for="document in paginatedDocuments" 
                :key="document.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <Icon name="document-text" class="w-5 h-5 mr-3" color="slate-500" />
                    <div>
                      <div class="text-sm font-medium text-slate-900">{{ document.title }}</div>
                      <div class="text-sm text-slate-500">{{ document.source }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="getTypeVariant(document.source)" class="w-4 h-4">
                    {{ getTypeName(document.source) }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-900">{{ document.citation || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-900">{{ document.chunks || 0 }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-900">{{ formatDate(document.date) }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <Button 
                      @click="viewDocument(document)"
                      variant="secondary"
                      class="w-3 h-3"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      @click="editDocument(document)"
                      variant="secondary"
                      class="w-3 h-3"
                    >
                      <Icon name="pencil" class="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      @click="deleteDocument(document)"
                      variant="danger"
                      class="w-3 h-3"
                    >
                      <Icon name="trash" class="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-slate-500">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredDocuments.length) }} of {{ filteredDocuments.length }} documents
            </div>
            <div class="flex items-center space-x-2">
              <Button 
                @click="previousPage"
                variant="secondary"
                class="w-4 h-4"
                :disabled="currentPage === 1"
              >
                <Icon name="chevron-left" class="w-4 h-4" />
              </Button>
              <span class="text-sm text-slate-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <Button 
                @click="nextPage"
                variant="secondary"
                class="w-4 h-4"
                :disabled="currentPage === totalPages"
              >
                <Icon name="chevron-right" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'
import Badge from '~/components/atoms/Badge.vue'
import Spinner from '~/components/atoms/Spinner.vue'

// Head
useHead({
  title: 'Manage Documents - Admin - FormReady',
  meta: [
    { name: 'description', content: 'Manage VA knowledge base documents' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()

// State
const loading = ref(false)
const documents = ref<any[]>([])
const searchQuery = ref('')
const selectedType = ref('')
const dateRange = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Document types
const documentTypes = [
  { value: 'CFR38', name: 'CFR 38' },
  { value: 'DSM5', name: 'DSM-5' },
  { value: 'BVA', name: 'BVA Cases' },
  { value: 'CAVC', name: 'CAVC Cases' },
  { value: 'VHA', name: 'VHA Handbooks' },
  { value: 'USC38', name: 'USC 38' }
]

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.title?.toLowerCase().includes(query) ||
      doc.citation?.toLowerCase().includes(query) ||
      doc.source?.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (selectedType.value) {
    filtered = filtered.filter(doc => doc.source === selectedType.value)
  }

  // Date filter
  if (dateRange.value) {
    const now = new Date()
    const docDate = new Date()
    
    switch (dateRange.value) {
      case 'today':
        filtered = filtered.filter(doc => {
          docDate.setTime(doc.date)
          return docDate.toDateString() === now.toDateString()
        })
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(doc => new Date(doc.date) >= weekAgo)
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(doc => new Date(doc.date) >= monthAgo)
        break
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(doc => new Date(doc.date) >= yearAgo)
        break
    }
  }

  return filtered
})

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDocuments.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredDocuments.value.length / itemsPerPage)
)

// Check admin session
onMounted(async () => {
  const session = localStorage.getItem('admin_session')
  if (!session) {
    router.push('/admin/login')
    return
  }

  await loadDocuments()
})

// Load documents
const loadDocuments = async () => {
  loading.value = true
  try {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    documents.value = [
      {
        id: '1',
        title: 'PTSD Service Connection Requirements',
        source: 'CFR38',
        citation: '38 CFR 3.304(f)',
        chunks: 15,
        date: '2024-01-15',
        url: 'https://example.com'
      },
      {
        id: '2',
        title: 'DSM-5 PTSD Criteria',
        source: 'DSM5',
        citation: 'DSM-5 309.81',
        chunks: 8,
        date: '2024-01-14',
        url: 'https://dsm.psychiatryonline.org'
      },
      {
        id: '3',
        title: 'BVA Case 2023-12345',
        source: 'BVA',
        citation: 'BVA 2023-12345',
        chunks: 12,
        date: '2024-01-13',
        url: 'https://example.com'
      }
    ]
  } catch (error) {
    console.error('Failed to load documents:', error)
  } finally {
    loading.value = false
  }
}

// Actions
const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  dateRange.value = ''
  currentPage.value = 1
}

const refreshDocuments = async () => {
  await loadDocuments()
}

const viewDocument = (document: any) => {
  // Navigate to document detail page
  router.push(`/admin/documents/${document.id}`)
}

const editDocument = (document: any) => {
  // Navigate to document edit page
  router.push(`/admin/documents/${document.id}/edit`)
}

const deleteDocument = async (document: any) => {
  if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
    try {
      // Delete document via API
      console.log('Deleting document:', document.id)
      await loadDocuments()
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Helper functions
const getTypeVariant = (source: string): string => {
  const variants: Record<string, string> = {
    'CFR38': 'primary',
    'DSM5': 'danger',
    'BVA': 'success',
    'CAVC': 'secondary',
    'VHA': 'warning',
    'USC38': 'info'
  }
  return variants[source] || 'neutral'
}

const getTypeName = (source: string): string => {
  const type = documentTypes.find(t => t.value === source)
  return type?.name || source
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
