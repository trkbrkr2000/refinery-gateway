export default defineNuxtPlugin(() => {
  // This plugin ensures tsconfig.app.json exists
  if (process.client) {
    // Only run on client side to avoid SSR issues
    return
  }
})

