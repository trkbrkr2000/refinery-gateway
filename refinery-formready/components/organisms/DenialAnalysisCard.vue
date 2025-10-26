<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <Icon name="exclamation" class="w-6 h-6 mr-3" color="slate-600" />
        <h2 class="text-2xl font-bold text-slate-900">Denial Analysis</h2>
      </div>
      <Badge variant="denied" :text="`${denialReasons.length} Denied`" />
    </div>
    
    <div class="space-y-6">
      <div
        v-for="(denial, index) in denialReasons"
        :key="index"
        class="border border-slate-200 rounded-lg p-6"
      >
        <!-- Always Visible: Condition and Layman Explanation -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ denial.condition }}
            </h3>
            <div class="flex items-center space-x-3">
              <!-- Difficulty Rating -->
              <div class="flex items-center">
                <span class="text-sm text-slate-500 mr-2">Difficulty:</span>
                <div class="flex space-x-1">
                  <Icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= (denial.difficulty || 3) ? 'star-solid' : 'star'"
                    class="w-4 h-4"
                    :color="i <= (denial.difficulty || 3) ? getDifficultyColor(denial.difficulty || 3) : 'slate-300'"
                  />
                </div>
                <span class="ml-2 text-sm font-medium" :class="getDifficultyTextColor(denial.difficulty || 3)">
                  {{ getDifficultyText(denial.difficulty || 3) }}
                </span>
              </div>
              
              <!-- Quick Win Indicator -->
              <Badge 
                v-if="denial.isQuickWin"
                variant="success"
                class="w-4 h-4"
              >
                Quick Win
              </Badge>
            </div>
          </div>
          
          <LaymanExplanation 
            :layman-reason="denial.laymanReason"
            :next-steps="denial.nextSteps"
          />
        </div>
        
        <!-- Progressive Disclosure: Technical Details -->
        <div class="space-y-4">
          <!-- Technical Reason (Expandable) -->
          <div v-if="denial.reason">
            <button
              @click="toggleTechnicalReason(index)"
              class="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <div class="flex items-center">
                <Icon name="document" class="w-4 h-4 mr-2" color="red-600" />
                <span class="font-medium text-slate-700">Technical Denial Reason</span>
              </div>
              <Icon 
                :name="expandedTechnical[index] ? 'chevron-down' : 'chevron-right'" 
                class="w-4 h-4" 
                color="slate-500"
                :class="{ 'rotate-180': expandedTechnical[index] }"
              />
            </button>
            
            <div v-if="expandedTechnical[index]" class="mt-3 p-4 bg-slate-50 rounded-lg">
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {{ denial.reason }}
              </p>
            </div>
          </div>
          
          <!-- MCP Analysis (Expandable) -->
          <div v-if="denial.mcpAnalysis">
            <button
              @click="toggleMcpAnalysis(index)"
              class="flex items-center justify-between w-full p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
            >
              <div class="flex items-center">
                <Icon name="heroicons:shield-check" class="w-4 h-4 mr-2" color="red-600" />
                <span class="font-medium text-indigo-700">VA Knowledge Analysis</span>
                <Badge 
                  v-if="denial.mcpAnalysis.denialCategory"
                  variant="primary"
                  :text="denial.mcpAnalysis.denialCategory"
                  class="w-4 h-4"
                />
              </div>
              <Icon 
                :name="expandedMcp[index] ? 'chevron-down' : 'chevron-right'" 
                class="w-4 h-4" 
                color="indigo-500"
                :class="{ 'rotate-180': expandedMcp[index] }"
              />
            </button>
            
            <div v-if="expandedMcp[index]" class="mt-3 space-y-4">
              <!-- Category Explanation -->
              <div v-if="denial.mcpAnalysis.categoryExplanation" class="p-4 bg-indigo-50 rounded-lg">
                <h5 class="font-medium text-indigo-900 mb-2">Why This Denial Happened</h5>
                <p class="text-sm text-indigo-800 leading-relaxed">
                  {{ denial.mcpAnalysis.categoryExplanation }}
                </p>
              </div>
              
              <!-- Evidence Needed -->
              <div v-if="denial.mcpAnalysis.evidenceNeeded?.length > 0" class="p-4 bg-amber-50 rounded-lg">
                <h5 class="font-medium text-amber-900 mb-3">Evidence You Need</h5>
                <div class="space-y-2">
                  <div
                    v-for="(evidence, evidenceIndex) in denial.mcpAnalysis.evidenceNeeded"
                    :key="evidenceIndex"
                    class="flex items-start"
                  >
                    <Icon name="heroicons:star" class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" color="amber-600" />
                    <span class="text-sm text-amber-800">{{ evidence }}</span>
                  </div>
                </div>
              </div>
              
              <!-- CFR Regulations -->
              <div v-if="denial.mcpAnalysis.relevantRegulations?.length > 0" class="space-y-3">
                <h5 class="font-medium text-slate-900">Relevant VA Regulations</h5>
                <RegulationSnippet
                  v-for="(regulation, regIndex) in denial.mcpAnalysis.relevantRegulations"
                  :key="regIndex"
                  :citation="regulation.citation"
                  :title="regulation.title"
                  :snippet="regulation.snippet"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'
import LaymanExplanation from '../molecules/LaymanExplanation.vue'
import RegulationSnippet from '../molecules/RegulationSnippet.vue'

interface DenialReason {
  condition: string
  reason?: string
  laymanReason?: string
  nextSteps?: string
  difficulty?: number // 1-5 stars
  isQuickWin?: boolean
  mcpAnalysis?: {
    denialCategory?: string
    categoryExplanation?: string
    evidenceNeeded?: string[]
    relevantRegulations?: Array<{
      citation: string
      title: string
      snippet: string
    }>
  }
}

interface Props {
  denialReasons: DenialReason[]
}

const props = defineProps<Props>()

const expandedTechnical = ref<boolean[]>([])
const expandedMcp = ref<boolean[]>([])

// Initialize expanded state arrays
watch(() => props.denialReasons.length, (newLength) => {
  expandedTechnical.value = new Array(newLength).fill(false)
  expandedMcp.value = new Array(newLength).fill(false)
}, { immediate: true })

const toggleTechnicalReason = (index: number) => {
  expandedTechnical.value[index] = !expandedTechnical.value[index]
}

const toggleMcpAnalysis = (index: number) => {
  expandedMcp.value[index] = !expandedMcp.value[index]
}

// Difficulty rating functions
function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return 'green-500'
  if (difficulty <= 3) return 'amber-500'
  return 'red-500'
}

function getDifficultyTextColor(difficulty: number): string {
  if (difficulty <= 2) return 'text-green-600'
  if (difficulty <= 3) return 'text-amber-600'
  return 'text-red-600'
}

function getDifficultyText(difficulty: number): string {
  if (difficulty <= 2) return 'Easy'
  if (difficulty <= 3) return 'Medium'
  if (difficulty <= 4) return 'Hard'
  return 'Very Hard'
}
</script>
