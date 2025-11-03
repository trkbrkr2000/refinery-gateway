import { Violation } from '../../services/validator.service'

export class NavigationPresentValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Only check authenticated page files
    if (!filePath.includes('/pages/') || !filePath.endsWith('.vue')) {
      return { violations }
    }

    // Skip public pages
    const publicPages = ['index.vue', 'login.vue', 'signup.vue', 'pricing.vue']
    const isPublicPage = publicPages.some(page => filePath.endsWith(page))

    if (isPublicPage) {
      return { violations }
    }

    const standard = this.standards.standards.frontend.navigationRequired

    // Check if Navigation component is used
    const hasNavigationComponent = content.includes('<Navigation')

    if (!hasNavigationComponent) {
      violations.push({
        standardId: standard.id,
        severity: standard.severity,
        file: filePath,
        message: `Authenticated page missing Navigation component. ${standard.rationale}`,
        fix: `Add Navigation component at the top of your template:\n\n<template>\n  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">\n    <!-- Navigation -->\n    <Navigation\n      :show-new-analysis="true"\n      :show-dashboard="true"\n      :show-user-menu="true"\n    />\n    ...\n  </div>\n</template>\n\nAnd import it in the script:\n<script setup lang="ts">\nimport Navigation from '~/components/organisms/Navigation.vue'\n</script>`
      })
    }

    // Check if Navigation is imported
    if (hasNavigationComponent) {
      const hasNavigationImport = content.match(/import\s+Navigation\s+from\s+['"]~\/components\/organisms\/Navigation\.vue['"]/)

      if (!hasNavigationImport) {
        violations.push({
          standardId: 'frontend-explicit-imports',
          severity: 'error',
          file: filePath,
          message: 'Navigation component used but not explicitly imported',
          fix: `Add import in script section:\nimport Navigation from '~/components/organisms/Navigation.vue'`
        })
      }
    }

    return { violations }
  }
}
