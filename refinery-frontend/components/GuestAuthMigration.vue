<template>
  <div v-if="showPrompt" class="migration-prompt">
    <div class="prompt-overlay" @click="dismissPrompt"></div>
    <div class="prompt-content">
      <div class="prompt-header">
        <div class="prompt-icon">💾</div>
        <h3 class="prompt-title">Save Your Progress</h3>
      </div>
      
      <div class="prompt-body">
        <p class="prompt-description">
          You have {{ migrationSummary.formsWithData }} form(s) with saved progress. 
          Create an account to save your work and access it from any device.
        </p>
        
        <div class="migration-summary">
          <div class="summary-item">
            <span class="summary-label">Forms with data:</span>
            <span class="summary-value">{{ migrationSummary.formsWithData }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total fields filled:</span>
            <span class="summary-value">{{ migrationSummary.totalFields }}</span>
          </div>
        </div>
      </div>
      
      <div class="prompt-actions">
        <button 
          @click="dismissPrompt" 
          class="btn-secondary"
          :disabled="migrationInProgress"
        >
          Continue as Guest
        </button>
        
        <div class="auth-buttons">
          <button 
            @click="signInWithGoogle" 
            class="btn-primary"
            :disabled="migrationInProgress"
          >
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          
          <button 
            @click="signInWithEmail" 
            class="btn-primary"
            :disabled="migrationInProgress"
          >
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Sign in with Email
          </button>
        </div>
      </div>
      
      <div v-if="migrationInProgress" class="migration-progress">
        <div class="progress-spinner"></div>
        <p>Migrating your data...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuestAuthMigration } from '~/composables/useGuestAuthMigration'
import { useFirebaseAuth } from '~/composables/useFirebaseAuth'

const guestAuth = useGuestAuthMigration()
const firebaseAuth = useFirebaseAuth()

const showPrompt = ref(false)
const migrationInProgress = ref(false)

// Computed properties
const migrationSummary = computed(() => guestAuth.getMigrationSummary())

// Watch for migration prompt
watch(() => guestAuth.showMigrationPrompt(), (shouldShow) => {
  showPrompt.value = shouldShow
}, { immediate: true })

// Dismiss prompt
const dismissPrompt = () => {
  showPrompt.value = false
}

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    migrationInProgress.value = true
    const result = await firebaseAuth.signInWithGoogle()
    
    if (result.success) {
      // Migrate guest data
      const migrationResult = await guestAuth.migrateGuestData(result.user.idToken)
      
      if (migrationResult.success) {
        showPrompt.value = false
        // Show success message
        console.log(migrationResult.message)
      } else {
        console.error('Migration failed:', migrationResult.error)
      }
    }
  } catch (error) {
    console.error('Google sign in failed:', error)
  } finally {
    migrationInProgress.value = false
  }
}

// Sign in with email (show email form)
const signInWithEmail = () => {
  // This would typically open an email sign-in modal
  console.log('Show email sign-in form')
}
</script>

<style scoped>
.migration-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.prompt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.prompt-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.prompt-icon {
  font-size: 2rem;
}

.prompt-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.prompt-body {
  padding: 1rem 1.5rem;
}

.prompt-description {
  margin: 0 0 1rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.migration-summary {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-value {
  font-weight: 600;
  color: #111827;
}

.prompt-actions {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.migration-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 12px;
}

.progress-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .prompt-content {
    margin: 1rem;
    max-width: none;
  }
  
  .auth-buttons {
    gap: 0.5rem;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 1rem;
  }
}
</style>

