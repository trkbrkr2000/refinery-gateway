<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <Icon name="chart-bar-square" class="w-6 h-6 mr-3" color="blue-600" />
        <h2 class="text-2xl font-bold text-slate-900">Condition Comparison</h2>
      </div>
      <div class="text-sm text-slate-500">
        Compare your denied conditions to prioritize appeals
      </div>
    </div>
    
    <!-- Comparison table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="text-left py-4 px-6 font-semibold text-slate-900">Condition</th>
            <th class="text-center py-4 px-6 font-semibold text-slate-900">Difficulty</th>
            <th class="text-center py-4 px-6 font-semibold text-slate-900">Success Rate</th>
            <th class="text-center py-4 px-6 font-semibold text-slate-900">Evidence Strength</th>
            <th class="text-center py-4 px-6 font-semibold text-slate-900">Timeline</th>
            <th class="text-center py-4 px-6 font-semibold text-slate-900">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="condition in conditions" 
            :key="condition.id"
            class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <!-- Condition name and status -->
            <td class="py-4 px-6">
              <div class="flex items-center">
                <Icon :name="condition.icon" class="w-5 h-5 mr-3" :color="condition.color" />
                <div>
                  <div class="font-medium text-slate-900">{{ condition.name }}</div>
                  <div class="text-sm text-slate-500">{{ condition.category }}</div>
                </div>
              </div>
            </td>
            
            <!-- Difficulty rating -->
            <td class="py-4 px-6 text-center">
              <div class="flex items-center justify-center">
                <div class="flex space-x-1">
                  <Icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= condition.difficulty ? 'star-solid' : 'star'"
                    class="w-4 h-4"
                    :color="i <= condition.difficulty ? getDifficultyColor(condition.difficulty) : 'slate-300'"
                  />
                </div>
                <span class="ml-2 text-sm font-medium" :class="getDifficultyTextColor(condition.difficulty)">
                  {{ getDifficultyText(condition.difficulty) }}
                </span>
              </div>
            </td>
            
            <!-- Success rate -->
            <td class="py-4 px-6 text-center">
              <div class="flex items-center justify-center">
                <div class="w-16 bg-slate-200 rounded-full h-2 mr-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :class="getSuccessRateColor(condition.successRate)"
                    :style="{ width: `${condition.successRate}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-slate-700">{{ condition.successRate }}%</span>
              </div>
            </td>
            
            <!-- Evidence strength -->
            <td class="py-4 px-6 text-center">
              <div class="flex items-center justify-center">
                <div class="flex space-x-1">
                  <Icon 
                    v-for="i in 3" 
                    :key="i"
                    :name="i <= condition.evidenceStrength ? 'shield-check' : 'shield'"
                    class="w-4 h-4"
                    :color="i <= condition.evidenceStrength ? 'green-500' : 'slate-300'"
                  />
                </div>
                <span class="ml-2 text-sm font-medium" :class="getEvidenceStrengthColor(condition.evidenceStrength)">
                  {{ getEvidenceStrengthText(condition.evidenceStrength) }}
                </span>
              </div>
            </td>
            
            <!-- Timeline -->
            <td class="py-4 px-6 text-center">
              <div class="flex items-center justify-center">
                <Icon name="clock" class="w-4 h-4 mr-1" color="slate-500" />
                <span class="text-sm font-medium text-slate-700">{{ condition.timeline }}</span>
              </div>
            </td>
            
            <!-- Priority -->
            <td class="py-4 px-6 text-center">
              <Badge 
                :variant="getPriorityVariant(condition.priority)"
                class="w-4 h-4"
              >
                {{ getPriorityText(condition.priority) }}
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Recommendations -->
    <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg border border-blue-200">
      <div class="flex items-start">
        <Icon name="light-bulb" class="w-5 h-5 mr-3 mt-1" color="amber-600" />
        <div>
          <h4 class="text-lg font-semibold text-slate-900 mb-3">Strategic Recommendations</h4>
          <div class="space-y-3">
            <div v-for="recommendation in strategicRecommendations" :key="recommendation.type" class="flex items-start">
              <Icon :name="recommendation.icon" class="w-4 h-4 mr-2 mt-1" :color="recommendation.color" />
              <div>
                <div class="font-medium text-slate-900">{{ recommendation.title }}</div>
                <div class="text-sm text-slate-700">{{ recommendation.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '~/components/atoms/Badge.vue'

interface Condition {
  id: string
  name: string
  category: string
  icon: string
  color: string
  difficulty: number // 1-5 stars
  successRate: number // percentage
  evidenceStrength: number // 1-3 shields
  timeline: string
  priority: 'high' | 'medium' | 'low'
  denialReason?: string
}

interface Props {
  conditions?: Condition[]
}

const props = withDefaults(defineProps<Props>(), {
  conditions: () => [
    {
      id: 'ptsd',
      name: 'PTSD',
      category: 'Mental Health',
      icon: 'heart',
      color: 'red-600',
      difficulty: 3,
      successRate: 75,
      evidenceStrength: 2,
      timeline: '6-12 months',
      priority: 'high',
      denialReason: 'Lack of nexus'
    },
    {
      id: 'tinnitus',
      name: 'Tinnitus',
      category: 'Auditory',
      icon: 'speaker-wave',
      color: 'blue-600',
      difficulty: 2,
      successRate: 85,
      evidenceStrength: 3,
      timeline: '3-6 months',
      priority: 'high',
      denialReason: 'No current diagnosis'
    },
    {
      id: 'back-pain',
      name: 'Back Pain',
      category: 'Musculoskeletal',
      icon: 'user',
      color: 'green-600',
      difficulty: 4,
      successRate: 60,
      evidenceStrength: 1,
      timeline: '12-18 months',
      priority: 'medium',
      denialReason: 'Insufficient evidence'
    }
  ]
})

const strategicRecommendations = computed(() => [
  {
    type: 'quick-win',
    title: 'Quick Win: Tinnitus',
    description: 'High success rate (85%) with strong evidence. File this appeal first.',
    icon: 'rocket-launch',
    color: 'green-600'
  },
  {
    type: 'strategic',
    title: 'Strategic: PTSD',
    description: 'Medium difficulty but high impact. Get nexus letter and buddy statements.',
    icon: 'target',
    color: 'blue-600'
  },
  {
    type: 'long-term',
    title: 'Long-term: Back Pain',
    description: 'Most challenging. Consider gathering more evidence before appealing.',
    icon: 'clock',
    color: 'amber-600'
  }
])

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

function getSuccessRateColor(rate: number): string {
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getEvidenceStrengthColor(strength: number): string {
  if (strength >= 3) return 'text-green-600'
  if (strength >= 2) return 'text-amber-600'
  return 'text-red-600'
}

function getEvidenceStrengthText(strength: number): string {
  if (strength >= 3) return 'Strong'
  if (strength >= 2) return 'Moderate'
  return 'Weak'
}

function getPriorityVariant(priority: string): string {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function getPriorityText(priority: string): string {
  switch (priority) {
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'Unknown'
  }
}
</script>
