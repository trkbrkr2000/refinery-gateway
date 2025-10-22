<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          VA Decision Letter Analysis
        </h1>
        <p class="text-xl text-gray-600">
          Upload your VA decision letter to get instant analysis and understand your claim decision
        </p>
      </div>

      <!-- Upload Section -->
      <div v-if="!analyzing && !results" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">Upload Your Decision Letter</h2>
          <p class="text-gray-600">Upload your VA decision letter PDF (typically starts with "We made a decision on your VA benefits")</p>
        </div>

        <!-- File Upload Area -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50': dragover }"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".pdf"
            @change="handleFileSelect"
            class="hidden"
          />

          <div v-if="!selectedFile">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-lg text-gray-700 mb-2">Drop your decision letter here or click to browse</p>
            <p class="text-sm text-gray-500">PDF files only</p>
          </div>

          <div v-else class="flex items-center justify-center">
            <svg class="w-12 h-12 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-left">
              <p class="text-lg font-semibold text-gray-900">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
        </div>

        <!-- Analyze Button -->
        <button
          v-if="selectedFile"
          @click="analyzeDecision"
          :disabled="uploading"
          class="w-full mt-6 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ uploading ? 'Uploading...' : 'Analyze Decision Letter' }}
        </button>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Analyzing State -->
      <div v-if="analyzing" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your Decision Letter</h3>
        <p class="text-gray-600">This may take 30-60 seconds...</p>
      </div>

      <!-- Results Section -->
      <div v-if="results" class="space-y-6">
        <!-- Veteran Info -->
        <div v-if="results.veteranInfo" class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Veteran Information</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-if="results.veteranInfo.firstName || results.veteranInfo.lastName">
              <p class="text-sm text-gray-500">Name</p>
              <p class="text-lg font-semibold">{{ results.veteranInfo.firstName }} {{ results.veteranInfo.lastName }}</p>
            </div>
            <div v-if="results.veteranInfo.ssn">
              <p class="text-sm text-gray-500">SSN</p>
              <p class="text-lg font-semibold">{{ results.veteranInfo.ssn }}</p>
            </div>
          </div>
        </div>

        <!-- Ratings -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Rating Decisions</h2>
          <div class="space-y-4">
            <div
              v-for="(rating, index) in results.ratings"
              :key="index"
              class="p-4 rounded-lg border-2"
              :class="decisionClass(rating.decision)"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-900">{{ rating.condition }}</h3>
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="decisionClass(rating.decision)"
                >
                  {{ rating.decision.toUpperCase() }}
                </span>
              </div>
              <p class="text-2xl font-bold" :class="decisionClass(rating.decision)">
                {{ rating.ratingPercentage }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Denial Reasons -->
        <div v-if="results.denialReasons?.length > 0" class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Denial Reasons</h2>
          <div class="space-y-4">
            <div
              v-for="(denial, index) in results.denialReasons"
              :key="index"
              class="p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <h3 class="font-semibold text-gray-900 mb-2">{{ denial.condition }}</h3>
              <p class="text-gray-700">{{ denial.reason }}</p>
              <p class="text-sm text-gray-500 mt-2">Category: {{ denial.category }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            @click="reset"
            class="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Analyze Another Letter
          </button>
          <button
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Get Help with Appeal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const selectedFile = ref(null);
const dragover = ref(false);
const uploading = ref(false);
const analyzing = ref(false);
const results = ref(null);
const error = ref('');

useHead({
  title: 'VA Decision Letter Analysis - FormReady',
  meta: [
    { name: 'description', content: 'Upload and analyze your VA decision letter to understand your claim decision' }
  ]
});

function handleDrop(e) {
  dragover.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type === 'application/pdf') {
    selectedFile.value = files[0];
    error.value = '';
  } else {
    error.value = 'Please upload a PDF file';
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
    error.value = '';
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function decisionClass(decision) {
  switch (decision) {
    case 'granted':
      return 'border-green-200 bg-green-50';
    case 'deferred':
      return 'border-orange-200 bg-orange-50';
    case 'denied':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-gray-200 bg-white';
  }
}

async function analyzeDecision() {
  if (!selectedFile.value) return;

  uploading.value = true;
  error.value = '';

  try {
    // 1. Get presigned upload URL
    const presignedResponse = await fetch(`${apiUrl}/v1/storage/upload/presigned`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: selectedFile.value.name,
        contentType: selectedFile.value.type,
        path: 'decisions'
      })
    });

    if (!presignedResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, s3Key, fileId } = await presignedResponse.json();

    // 2. Upload directly to S3 using presigned URL
    const s3Response = await fetch(uploadUrl, {
      method: 'PUT',
      body: selectedFile.value,
      headers: {
        'Content-Type': selectedFile.value.type
      }
    });

    if (!s3Response.ok) {
      throw new Error('Upload to S3 failed');
    }

    uploading.value = false;
    analyzing.value = true;

    // 3. Trigger Python extraction service via API proxy
    const documentId = `decision-${Date.now()}`;
    const extractResponse = await fetch(`${apiUrl}/v1/va-knowledge/extract-from-s3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: documentId,
        storageUrl: s3Key,
        skipCache: true  // Always force re-extraction to get latest improvements
      })
    });

    if (!extractResponse.ok) {
      throw new Error('Analysis failed');
    }

    const extractData = await extractResponse.json();
    analyzing.value = false;

    // Display results
    results.value = extractData;

  } catch (err) {
    console.error('Analysis error:', err);
    error.value = err.message || 'Failed to analyze decision letter. Please try again.';
    uploading.value = false;
    analyzing.value = false;
  }
}

function reset() {
  selectedFile.value = null;
  uploading.value = false;
  analyzing.value = false;
  results.value = null;
  error.value = '';
}
</script>
