import { Violation } from '../../services/validator.service'

export class HeroHeaderValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Only check page files in pages/ directory
    if (!filePath.includes('/pages/') || !filePath.endsWith('.vue')) {
      return { violations }
    }

    // Skip public pages (index, login, signup, analyze-decision without auth)
    const publicPages = ['index.vue', 'login.vue', 'signup.vue']
    const isPublicPage = publicPages.some(page => filePath.endsWith(page))

    if (isPublicPage) {
      return { violations }
    }

    const standard = this.standards.standards.frontend.pageStructure

    // Check for hero header pattern
    const hasHeroHeader = content.includes('bg-gradient-to-r from-blue-800 to-blue-900')

    if (!hasHeroHeader) {
      violations.push({
        standardId: standard.id,
        severity: standard.severity,
        file: filePath,
        message: `Authenticated page missing hero header. ${standard.rationale}`,
        fix: `Add a hero header section after Navigation:\n\n<!-- Hero Section -->\n<div class="bg-gradient-to-r from-blue-800 to-blue-900 text-white">\n  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\n    <h1 class="text-4xl font-bold mb-2">Page Title</h1>\n    <p class="text-xl text-blue-100">Page description</p>\n  </div>\n</div>`
      })
    }

    // Check for correct background pattern
    const hasCorrectBackground = content.includes('from-slate-50 to-blue-50')
    const hasIncorrectBackground = content.includes('from-gray-50')

    if (!hasCorrectBackground || hasIncorrectBackground) {
      violations.push({
        standardId: 'frontend-ui-consistency',
        severity: 'warning',
        file: filePath,
        message: 'Page background should use "from-slate-50 to-blue-50" not "from-gray-50"',
        fix: 'Update background class:\n<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">'
      })
    }

    // Check for correct container pattern
    const hasCorrectContainer = content.includes('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8')

    if (!hasCorrectContainer) {
      violations.push({
        standardId: 'frontend-ui-consistency',
        severity: 'warning',
        file: filePath,
        message: 'Page should use standard container pattern',
        fix: 'Use standard container:\n<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n  <!-- content -->\n</div>'
      })
    }

    return { violations }
  }
}
