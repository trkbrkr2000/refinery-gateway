import { Violation } from '../../services/validator.service'

export class BooleanChecksValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Only check Python files
    if (!filePath.endsWith('.py')) {
      return { violations }
    }

    const standard = this.standards.standards.python.booleanChecks

    // Check for improper boolean checks on database objects
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Look for patterns like "if not self.db:" or "if self.db:"
      const dbBooleanCheck = line.match(/if\s+(not\s+)?self\.db\s*:/)
      const clientBooleanCheck = line.match(/if\s+(not\s+)?self\.client\s*:/)

      if (dbBooleanCheck || clientBooleanCheck) {
        const variable = dbBooleanCheck ? 'self.db' : 'self.client'
        const hasNot = line.includes('not')

        violations.push({
          standardId: standard.id,
          severity: standard.severity,
          file: filePath,
          line: lineNumber,
          message: `Improper boolean check on MongoDB object '${variable}'. ${standard.rationale}`,
          fix: hasNot
            ? `Replace with explicit None check:\nif ${variable} is None:`
            : `Replace with explicit None check:\nif ${variable} is not None:`,
          code: line.trim()
        })
      }
    }

    return { violations }
  }
}
