<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center mb-6">
      <Icon name="user" class="w-6 h-6 mr-3" color="indigo-600" />
      <h2 class="text-2xl font-bold text-slate-900">Veteran Information</h2>
    </div>
    
    <div class="grid md:grid-cols-2 gap-6">
      <div v-if="veteranInfo.firstName || veteranInfo.lastName" class="space-y-2">
        <p class="text-sm text-slate-500">Name</p>
        <p class="text-lg font-semibold text-slate-900">
          {{ veteranInfo.firstName }} {{ veteranInfo.lastName }}
        </p>
      </div>
      
      <div v-if="veteranInfo.ssn" class="space-y-2">
        <p class="text-sm text-slate-500">SSN</p>
        <p class="text-lg font-semibold text-slate-900">
          {{ veteranInfo.ssn }}
        </p>
      </div>
    </div>
    
    <div v-if="!hasVeteranInfo" class="text-center py-8">
      <Icon name="info" class="w-6 h-6 mx-auto mb-2" color="slate-400" />
      <p class="text-slate-500">Veteran information not found in decision letter</p>
    </div>
  </div>
</template>

<script setup lang="ts">

interface VeteranInfo {
  firstName?: string
  lastName?: string
  ssn?: string
}

interface Props {
  veteranInfo: VeteranInfo
}

const props = defineProps<Props>()

const hasVeteranInfo = computed(() => {
  return props.veteranInfo.firstName || 
         props.veteranInfo.lastName || 
         props.veteranInfo.ssn
})
</script>
