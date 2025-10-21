import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth'

export const useFirebaseAuth = () => {
  const { $firebase } = useNuxtApp()
  const authStore = useAuthStore()

  const firebaseUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Listen to auth state changes
  const initAuthListener = () => {
    if (!$firebase?.auth) return

    onAuthStateChanged($firebase.auth, async (user) => {
      firebaseUser.value = user

      if (user) {
        // User is signed in
        const idToken = await user.getIdToken()

        // Exchange Firebase token for your backend token
        await authStore.exchangeFirebaseToken(idToken)
      } else {
        // User is signed out
        authStore.logout()
      }
    })
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!$firebase?.auth || !$firebase?.googleProvider) {
      error.value = 'Firebase not initialized'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await signInWithPopup($firebase.auth, $firebase.googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      // Exchange Firebase token for your backend token
      const backendResult = await authStore.exchangeFirebaseToken(idToken)

      return { success: true, user, backendResult }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in with Google'
      console.error('Google sign in error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with GitHub
  const signInWithGithub = async () => {
    if (!$firebase?.auth || !$firebase?.githubProvider) {
      error.value = 'Firebase not initialized'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await signInWithPopup($firebase.auth, $firebase.githubProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      // Exchange Firebase token for your backend token
      const backendResult = await authStore.exchangeFirebaseToken(idToken)

      return { success: true, user, backendResult }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in with GitHub'
      console.error('GitHub sign in error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    if (!$firebase?.auth) {
      error.value = 'Firebase not initialized'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await signInWithEmailAndPassword($firebase.auth, email, password)
      const user = result.user
      const idToken = await user.getIdToken()

      // Exchange Firebase token for your backend token
      const backendResult = await authStore.exchangeFirebaseToken(idToken)

      return { success: true, user, backendResult }
    } catch (err: any) {
      error.value = err.message || 'Invalid email or password'
      console.error('Email sign in error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Create account with email and password
  const createAccount = async (email: string, password: string, displayName?: string) => {
    if (!$firebase?.auth) {
      error.value = 'Firebase not initialized'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await createUserWithEmailAndPassword($firebase.auth, email, password)
      const user = result.user

      // Update display name if provided
      if (displayName && user) {
        await updateProfile(user, { displayName })
      }

      const idToken = await user.getIdToken()

      // Exchange Firebase token for your backend token
      const backendResult = await authStore.exchangeFirebaseToken(idToken)

      return { success: true, user, backendResult }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        error.value = 'An account with this email already exists'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'Password should be at least 6 characters'
      } else {
        error.value = err.message || 'Failed to create account'
      }
      console.error('Create account error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const logout = async () => {
    if (!$firebase?.auth) return

    try {
      await signOut($firebase.auth)
      authStore.logout()
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out'
      console.error('Sign out error:', err)
      return { success: false, error: error.value }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    if (!$firebase?.auth) {
      error.value = 'Firebase not initialized'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    error.value = null

    try {
      await sendPasswordResetEmail($firebase.auth, email)
      return { success: true, message: 'Password reset email sent' }
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset email'
      console.error('Password reset error:', err)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    firebaseUser: readonly(firebaseUser),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initAuthListener,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    createAccount,
    logout,
    resetPassword
  }
}