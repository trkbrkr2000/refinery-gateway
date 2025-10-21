import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  // Firebase configuration from runtime config
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)

  // Initialize Firebase Authentication
  const auth = getAuth(app)

  // Initialize providers
  const googleProvider = new GoogleAuthProvider()
  const githubProvider = new GithubAuthProvider()

  // Initialize Analytics (only in browser and if supported)
  let analytics = null
  if (process.client && await isSupported()) {
    analytics = getAnalytics(app)
  }

  return {
    provide: {
      firebase: {
        app,
        auth,
        googleProvider,
        githubProvider,
        analytics
      }
    }
  }
})