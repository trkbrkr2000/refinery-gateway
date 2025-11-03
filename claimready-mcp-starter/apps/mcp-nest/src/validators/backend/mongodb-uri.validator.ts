import { Violation } from '../../services/validator.service'

export class MongodbUriValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Check TypeScript/JavaScript files and .env files
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js') && !filePath.endsWith('.env') && !filePath.includes('.env.')) {
      return { violations }
    }

    const standard = this.standards.standards.backend.mongodbUri

    // Find MongoDB URI patterns
    const uriPatterns = [
      /mongodb:\/\/[^'">\s]+/g,  // mongodb://...
      /MONGODB_URI\s*[=:]\s*['"]([^'"]+)['"]/g,  // MONGODB_URI=...
      /process\.env\.MONGODB_URI/g  // Reference to env var
    ]

    let foundUri = false
    for (const pattern of uriPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        foundUri = true

        for (const match of matches) {
          // Skip if it's just a reference (process.env.MONGODB_URI)
          if (match.includes('process.env')) {
            continue
          }

          // Extract the actual URI
          let uri = match
          if (match.includes('=')) {
            const parts = match.split(/[=:]/)
            uri = parts[parts.length - 1].replace(/['"]/g, '').trim()
          }

          // Check if URI has database name
          const hasDatabaseName = /mongodb:\/\/[^\/]+\/\w+/.test(uri)
          if (!hasDatabaseName) {
            violations.push({
              standardId: standard.id,
              severity: standard.severity,
              file: filePath,
              message: `MongoDB URI missing database name. ${standard.rationale}`,
              fix: `Add database name to URI:\n${uri}/refinery?authSource=admin\n\nExample: ${standard.examples.correct}`,
              code: match
            })
          }

          // Check if URI has authSource parameter
          const hasAuthSource = uri.includes('authSource=')
          if (!hasAuthSource && uri.startsWith('mongodb://')) {
            violations.push({
              standardId: standard.id,
              severity: standard.severity,
              file: filePath,
              message: `MongoDB URI missing authSource parameter. ${standard.rationale}`,
              fix: `Add authSource parameter to URI:\n${uri}${uri.includes('?') ? '&' : '?'}authSource=admin\n\nExample: ${standard.examples.correct}`,
              code: match
            })
          }
        }
      }
    }

    return { violations }
  }
}
