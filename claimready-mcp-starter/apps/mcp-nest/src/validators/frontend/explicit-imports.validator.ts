import { Violation } from '../../services/validator.service'

export class ExplicitImportsValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Only check .vue files
    if (!filePath.endsWith('.vue')) {
      return { violations }
    }

    const standard = this.standards.standards.frontend.componentImports

    // Extract component usage from template
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
    if (!templateMatch) {
      return { violations }
    }

    const template = templateMatch[1]

    // Find all component usages (PascalCase tags)
    const componentUsages = template.match(/<([A-Z][a-zA-Z0-9]*)/g)
    if (!componentUsages) {
      return { violations }
    }

    const usedComponents = [...new Set(componentUsages.map(c => c.substring(1)))]

    // Extract script section
    const scriptMatch = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/)
    if (!scriptMatch) {
      // No script section but components are used
      if (usedComponents.length > 0) {
        violations.push({
          standardId: standard.id,
          severity: standard.severity,
          file: filePath,
          message: `Components used (${usedComponents.join(', ')}) but no script section found. Components must be explicitly imported.`,
          fix: `Add a <script setup> section with explicit imports:\n\n<script setup lang="ts">\nimport ${usedComponents[0]} from '~/components/.../$ {usedComponents[0]}.vue'\n</script>`
        })
      }
      return { violations }
    }

    const script = scriptMatch[1]

    // Remove comments from script before checking imports
    const scriptWithoutComments = script
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments

    // Check each used component has an import
    for (const component of usedComponents) {
      // Skip built-in Nuxt components
      if (['NuxtLink', 'NuxtPage', 'ClientOnly', 'Head', 'Icon'].includes(component)) {
        continue
      }

      // Check if component is imported (ignoring comments)
      const importRegex = new RegExp(`import\\s+${component}\\s+from\\s+['"]`)
      if (!importRegex.test(scriptWithoutComments)) {
        const line = this.findComponentLine(template, component)

        violations.push({
          standardId: standard.id,
          severity: standard.severity,
          file: filePath,
          line,
          message: `Component '${component}' is used but not explicitly imported. ${standard.rationale}`,
          fix: `Add explicit import:\nimport ${component} from '~/components/[path]/${component}.vue'\n\nCommon paths:\n- Atoms: ~/components/atoms/${component}.vue\n- Molecules: ~/components/molecules/${component}.vue\n- Organisms: ~/components/organisms/${component}.vue`,
          code: `<${component}`
        })
      }
    }

    return { violations }
  }

  private findComponentLine(template: string, component: string): number {
    const lines = template.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`<${component}`)) {
        return i + 1
      }
    }
    return 0
  }
}
