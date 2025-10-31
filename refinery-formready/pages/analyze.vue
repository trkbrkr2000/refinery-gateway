<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Minimal header - no auth -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <Logo size="md" to="/" />
          <NuxtLink to="/auth/login" class="text-sm text-slate-600 hover:text-blue-800 transition-colors">
            Sign In
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Upload Section -->
    <div v-if="!analyzing && !sessionId" class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-center mb-8">
        Analyze Your VA Decision Letter
      </h1>
      
      <FileUploadZone
        @file-select="handleFileSelect"
        @analyze="analyzeDocument"
      />
    </div>

    <!-- Analyzing State -->
    <AnalysisLoadingState v-if="analyzing" />

    <!-- Redirect to results -->
    <div v-if="sessionId">
      <!-- Auto-redirect handled in script -->
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUploadZone from "~/components/organisms/FileUploadZone.vue";
import AnalysisLoadingState from "~/components/organisms/AnalysisLoadingState.vue";
import Logo from "~/components/atoms/Logo.vue";

const analyzing = ref(false)
const sessionId = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const handleFileSelect = (file: File) => {
  selectedFile.value = file
}

const analyzeDocument = async () => {
  if (!selectedFile.value) return

  analyzing.value = true

  try {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl || 'http://localhost:3001'

    console.log('Starting analysis for file:', selectedFile.value.name)

    // 1. Upload to S3 (NEW anonymous presigned URL endpoint)
    console.log('Step 1: Getting presigned URL...')
    const presignedResponse = await fetch(
      `${apiUrl}/api/storage/upload/presigned/anonymous`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.value.name,
          contentType: selectedFile.value.type,
          path: 'anonymous'
        })
      }
    )
    
    if (!presignedResponse.ok) {
      throw new Error(`Presigned URL failed: ${presignedResponse.status} ${presignedResponse.statusText}`)
    }
    
    const { uploadUrl, s3Key } = await presignedResponse.json()
    console.log('Step 1 complete: Got presigned URL', { uploadUrl: uploadUrl.substring(0, 50) + '...', s3Key })
    
    // 2. Upload to S3
    console.log('Step 2: Uploading to S3...')
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type }
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }
    console.log('Step 2 complete: File uploaded to S3')
    
    // 3. Analyze (NEW anonymous endpoint)
    console.log('Step 3: Starting analysis...')
    const analyzeResponse = await fetch(
      `${apiUrl}/api/analyze/anonymous`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageUrl: s3Key })
      }
    )
    
    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.status} ${analyzeResponse.statusText}`)
    }
    
    const { sessionId: newSessionId } = await analyzeResponse.json()
    console.log('Step 3 complete: Got session ID', newSessionId)
    sessionId.value = newSessionId
    
    // Redirect to results
    console.log('Redirecting to results page...')
    navigateTo(`/results/${newSessionId}`)
    
  } catch (error) {
    console.error('Analysis failed:', error)
    alert(`Analysis failed: ${error.message}`)
  } finally {
    analyzing.value = false
  }
}

useHead({
  title: 'Analyze VA Decision Letter - ClaimReady',
  meta: [
    { name: 'description', content: 'Upload your VA decision letter for instant analysis. No account required.' }
  ]
})
</script>
