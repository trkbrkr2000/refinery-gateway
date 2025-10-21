<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Success Animation -->
      <div class="success-animation">
        <div class="success-icon">
          <svg class="checkmark" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <div class="success-particles">
          <div v-for="i in 6" :key="i" class="particle" :style="{ '--delay': `${i * 0.1}s` }"></div>
        </div>
      </div>

      <!-- Success Content -->
      <div class="success-content">
        <h1 class="success-title">Form Submitted Successfully! 🎉</h1>
        <p class="success-description">
          Your {{ formName }} has been completed and your PDF is ready for download.
        </p>

        <!-- Submission Details -->
        <div class="submission-details">
          <div class="detail-item">
            <span class="detail-label">Form:</span>
            <span class="detail-value">{{ formName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">{{ formatDate(submissionDate) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Reference ID:</span>
            <span class="detail-value">{{ submissionId }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="success-actions">
          <button
            @click="downloadPDF"
            :disabled="isDownloading"
            class="btn-primary"
          >
            <svg v-if="!isDownloading" class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <div v-else class="btn-spinner"></div>
            {{ isDownloading ? 'Downloading...' : 'Download PDF' }}
          </button>

          <NuxtLink to="/dashboard" class="btn-secondary">
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
            </svg>
            Go to Dashboard
          </NuxtLink>

          <NuxtLink to="/forms" class="btn-outline">
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Fill Another Form
          </NuxtLink>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 class="next-steps-title">What's Next?</h3>
          <ul class="next-steps-list">
            <li>
              <svg class="step-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
              </svg>
              Save your PDF to your computer
            </li>
            <li>
              <svg class="step-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
              </svg>
              Submit the form to the appropriate agency
            </li>
            <li>
              <svg class="step-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
              </svg>
              Keep a copy for your records
            </li>
          </ul>
        </div>

        <!-- Feedback Section -->
        <div class="feedback-section">
          <h3 class="feedback-title">How was your experience?</h3>
          <p class="feedback-description">
            Your feedback helps us improve FormReady for everyone.
          </p>
          <div class="feedback-buttons">
            <button
              v-for="rating in [1, 2, 3, 4, 5]"
              :key="rating"
              @click="submitRating(rating)"
              :class="['rating-btn', { 'rating-selected': selectedRating === rating }]"
            >
              {{ rating === 5 ? '😍' : rating === 4 ? '😊' : rating === 3 ? '😐' : rating === 2 ? '😕' : '😞' }}
            </button>
          </div>
          <div v-if="selectedRating" class="feedback-thanks">
            <p>Thank you for your feedback! 🙏</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const route = useRoute()
const toast = useToast()

// Get form ID from route
const formId = route.params.id as string

// State
const formName = ref('Form')
const submissionId = ref('')
const submissionDate = ref(new Date())
const isDownloading = ref(false)
const selectedRating = ref<number | null>(null)

// Load submission details
onMounted(async () => {
  try {
    // In a real app, you'd fetch submission details from the API
    formName.value = 'VA Form 21-526EZ'
    submissionId.value = `SUB-${Date.now()}`
    submissionDate.value = new Date()
  } catch (error) {
    console.error('Failed to load submission details:', error)
  }
})

// Download PDF
const downloadPDF = async () => {
  try {
    isDownloading.value = true
    
    // Simulate PDF download
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('PDF Downloaded', 'Your form has been saved to your downloads folder.')
  } catch (error) {
    toast.error('Download Failed', 'There was an error downloading your PDF. Please try again.')
  } finally {
    isDownloading.value = false
  }
}

// Submit rating
const submitRating = (rating: number) => {
  selectedRating.value = rating
  toast.success('Thank you!', 'Your feedback has been recorded.')
}

// Format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 100%;
  overflow: hidden;
}

.success-animation {
  position: relative;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
}

.success-icon {
  position: relative;
  z-index: 2;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #10b981;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #fff;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.success-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: particle 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 20%; left: 20%; }
.particle:nth-child(2) { top: 30%; right: 20%; }
.particle:nth-child(3) { bottom: 30%; left: 30%; }
.particle:nth-child(4) { bottom: 20%; right: 30%; }
.particle:nth-child(5) { top: 50%; left: 10%; }
.particle:nth-child(6) { top: 60%; right: 10%; }

.success-content {
  padding: 2rem;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
  text-align: center;
}

.success-description {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.submission-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #374151;
}

.detail-value {
  color: #6b7280;
  font-family: monospace;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  color: #374151;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.next-steps {
  margin-bottom: 2rem;
}

.next-steps-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.next-steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.next-steps-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #6b7280;
}

.step-icon {
  width: 1rem;
  height: 1rem;
  color: #10b981;
  flex-shrink: 0;
}

.feedback-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.feedback-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.feedback-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.feedback-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rating-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.rating-btn:hover {
  background: #e5e7eb;
}

.rating-selected {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.feedback-thanks {
  color: #10b981;
  font-weight: 500;
}

/* Animations */
@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #10b981;
  }
}

@keyframes particle {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 0.5;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .success-page {
    padding: 1rem;
  }
  
  .success-animation {
    padding: 2rem 1rem;
  }
  
  .success-content {
    padding: 1.5rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
  
  .success-actions {
    gap: 0.75rem;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-outline {
    padding: 1rem;
  }
}
</style>

