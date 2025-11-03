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

    <!-- Analyzing State with Progress -->
    <div v-if="analyzing" class="max-w-3xl mx-auto px-4 py-12">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center">
          <div class="mb-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          </div>

          <h2 class="text-2xl font-semibold text-slate-900 mb-4">
            Analyzing Your Decision Letter
          </h2>

          <!-- Progress Steps -->
          <div class="space-y-4 max-w-md mx-auto text-left mt-8">
            <div class="flex items-center space-x-3">
              <div :class="stepClasses(1)">
                <Icon v-if="currentStep > 1" name="heroicons:check" class="w-4 h-4" />
                <span v-else class="text-sm font-medium">1</span>
              </div>
              <span :class="currentStep >= 1 ? 'text-slate-900 font-medium' : 'text-slate-400'">
                Uploading document
              </span>
            </div>

            <div class="flex items-center space-x-3">
              <div :class="stepClasses(2)">
                <Icon v-if="currentStep > 2" name="heroicons:check" class="w-4 h-4" />
                <span v-else class="text-sm font-medium">2</span>
              </div>
              <span :class="currentStep >= 2 ? 'text-slate-900 font-medium' : 'text-slate-400'">
                Extracting text from PDF
              </span>
            </div>

            <div class="flex items-center space-x-3">
              <div :class="stepClasses(3)">
                <Icon v-if="currentStep > 3" name="heroicons:check" class="w-4 h-4" />
                <span v-else class="text-sm font-medium">3</span>
              </div>
              <span :class="currentStep >= 3 ? 'text-slate-900 font-medium' : 'text-slate-400'">
                Analyzing decision details
              </span>
            </div>
          </div>

          <p class="text-sm text-slate-500 mt-8">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>

    <!-- Redirect to results -->
    <div v-if="sessionId">
      <!-- Auto-redirect handled in script -->
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUploadZone from "~/components/organisms/FileUploadZone.vue";
import Logo from "~/components/atoms/Logo.vue";
import { useToast } from "~/composables/useToast";
import { useAnalysisErrors } from "~/composables/useAnalysisErrors";

const toast = useToast()
const { handleError } = useAnalysisErrors()

const analyzing = ref(false)
const sessionId = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const currentStep = ref(0) // Track progress: 0=idle, 1=uploading, 2=extracting, 3=analyzing

const handleFileSelect = (file: File) => {
  selectedFile.value = file
}

const stepClasses = (step: number) => {
  const isActive = currentStep.value === step
  const isComplete = currentStep.value > step

  if (isComplete) {
    return 'flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white'
  }
  if (isActive) {
    return 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white animate-pulse'
  }
  return 'flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500'
}

const analyzeDocument = async () => {
  if (!selectedFile.value) return

  analyzing.value = true
  currentStep.value = 1

  try {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl || 'http://localhost:3001'

    console.log('Starting analysis for file:', selectedFile.value.name)

    // Step 1: Upload to S3
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
      const errorData = await presignedResponse.json().catch(() => ({}))
      throw { response: presignedResponse, message: errorData.message || 'Presigned URL failed' }
    }

    const { uploadUrl, s3Key } = await presignedResponse.json()
    console.log('Step 1 complete: Got presigned URL')

    // Step 2: Upload to S3
    console.log('Step 2: Uploading to S3...')
    currentStep.value = 2
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: { 'Content-Type': selectedFile.value.type }
    })

    if (!uploadResponse.ok) {
      throw { response: uploadResponse, message: 'S3 upload failed' }
    }
    console.log('Step 2 complete: File uploaded to S3')

    // Step 3: Analyze
    console.log('Step 3: Starting analysis...')
    currentStep.value = 3
    const analyzeResponse = await fetch(
      `${apiUrl}/api/analyze/anonymous`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageUrl: s3Key })
      }
    )

    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json().catch(() => ({}))
      throw { response: analyzeResponse, message: errorData.message || 'Analysis failed' }
    }

    const { sessionId: newSessionId } = await analyzeResponse.json()
    console.log('Step 3 complete: Got session ID', newSessionId)
    sessionId.value = newSessionId

    // Show success toast
    toast.success('Analysis Complete!', 'Redirecting to your results...')

    // Redirect to results
    setTimeout(() => {
      navigateTo(`/results/${newSessionId}`)
    }, 500)

  } catch (error: any) {
    console.error('Analysis failed:', error)

    // Determine which stage failed based on currentStep
    let stage: 'upload' | 'extraction' | 'analysis' = 'upload'
    if (currentStep.value >= 2) stage = 'extraction'
    if (currentStep.value >= 3) stage = 'analysis'

    // Use our error handler with retry capability
    handleError(error, stage, () => {
      // Reset and retry
      analyzing.value = false
      currentStep.value = 0
      setTimeout(() => analyzeDocument(), 100)
    })
  } finally {
    if (!sessionId.value) {
      // Only reset if we didn't succeed
      analyzing.value = false
      currentStep.value = 0
    }
  }
}

useHead({
  title: 'Analyze VA Decision Letter - ClaimReady',
  meta: [
    { name: 'description', content: 'Upload your VA decision letter for instant analysis. No account required.' }
  ]
})
</script>
