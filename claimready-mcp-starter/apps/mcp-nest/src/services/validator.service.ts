import * as fs from 'fs'
import * as path from 'path'
import { Injectable } from '@nestjs/common'
import { ExplicitImportsValidator } from '../validators/frontend/explicit-imports.validator'
import { HeroHeaderValidator } from '../validators/frontend/hero-header.validator'
import { NavigationPresentValidator } from '../validators/frontend/navigation-present.validator'
import { MongodbUriValidator } from '../validators/backend/mongodb-uri.validator'
import { DualSaveValidator } from '../validators/backend/dual-save.validator'
import { BooleanChecksValidator } from '../validators/python/boolean-checks.validator'
import { SubmoduleSyncValidator } from '../validators/deployment/submodule-sync.validator'
import { CommitFormatValidator } from '../validators/git/commit-format.validator'
import { BranchNamingValidator } from '../validators/git/branch-naming.validator'

export interface Standard {
  id: string
  severity: 'error' | 'warning' | 'info'
  description: string
  rationale?: string
  learnedFrom?: string
  pattern?: any
  validator: string
  autoFix?: boolean
}

export interface Violation {
  standardId: string
  severity: 'error' | 'warning' | 'info'
  file: string
  line?: number
  message: string
  fix?: string
  code?: string
}

export interface ValidationResult {
  violations: Violation[]
  checksRun: string[]
}

@Injectable()
export class ValidatorService {
  private standards: any
  private validators: Map<string, any> = new Map()

  constructor() {
    this.loadStandards()
    this.initializeValidators()
  }

  private loadStandards() {
    // Try multiple possible paths
    const possiblePaths = [
      path.resolve(process.cwd(), '../../../standards/claimready-standards.json'),
      path.resolve(process.cwd(), '../../standards/claimready-standards.json'),
      path.resolve(__dirname, '../../../standards/claimready-standards.json'),
      path.resolve(__dirname, '../../../../standards/claimready-standards.json'),
    ]

    for (const standardsPath of possiblePaths) {
      if (fs.existsSync(standardsPath)) {
        const standardsContent = fs.readFileSync(standardsPath, 'utf8')
        this.standards = JSON.parse(standardsContent)
        console.log(`✅ Loaded standards from: ${standardsPath}`)
        return
      }
    }

    throw new Error('Could not find claimready-standards.json in any expected location')
  }

  private initializeValidators() {
    this.validators = new Map()

    // Frontend validators
    this.validators.set('explicit-imports', new ExplicitImportsValidator(this.standards))
    this.validators.set('page-structure', new HeroHeaderValidator(this.standards))
    this.validators.set('navigation-present', new NavigationPresentValidator(this.standards))

    // Backend validators
    this.validators.set('mongodb-uri', new MongodbUriValidator(this.standards))
    this.validators.set('dual-save', new DualSaveValidator(this.standards))

    // Python validators
    this.validators.set('boolean-checks', new BooleanChecksValidator(this.standards))

    // Deployment validators
    this.validators.set('submodule-sync', new SubmoduleSyncValidator(this.standards))

    // Git validators
    this.validators.set('commit-format', new CommitFormatValidator(this.standards))
    this.validators.set('branch-naming', new BranchNamingValidator(this.standards))
    this.validators.set('branch-protection', new BranchNamingValidator(this.standards)) // Uses same validator
  }

  async validateChanges(files: string[], allFiles: boolean): Promise<ValidationResult> {
    const violations: Violation[] = []
    const checksRun: string[] = []

    // Always run git validators first (branch protection, etc.)
    const branchValidator = this.validators.get('branch-naming')
    if (branchValidator) {
      checksRun.push('branch-naming', 'branch-protection')
      const result = await branchValidator.validate('', '')
      if (result.violations) {
        violations.push(...result.violations)
      }
    }

    // If no files specified or allFiles=true, get changed files from git
    let filesToCheck = files
    if (allFiles || files.length === 0) {
      filesToCheck = this.getChangedFiles()
    }

    // Find git root directory
    const gitRoot = this.findGitRoot()

    for (const file of filesToCheck) {
      // Convert to absolute path if relative
      const absolutePath = path.isAbsolute(file) ? file : path.resolve(gitRoot, file)

      if (!fs.existsSync(absolutePath)) {
        console.warn(`File not found: ${absolutePath}`)
        continue
      }

      const fileViolations = await this.validateFile(absolutePath)
      violations.push(...fileViolations.violations)
      checksRun.push(...fileViolations.checksRun)
    }

    return {
      violations,
      checksRun: [...new Set(checksRun)] // Deduplicate
    }
  }

  async validateFile(filePath: string): Promise<ValidationResult> {
    const violations: Violation[] = []
    const checksRun: string[] = []

    if (!fs.existsSync(filePath)) {
      return { violations, checksRun }
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const ext = path.extname(filePath)

    // Determine which validators to run based on file type
    if (ext === '.vue') {
      // Frontend validators
      for (const [name, validator] of this.validators.entries()) {
        if (name.includes('frontend') || ['explicit-imports', 'page-structure', 'navigation-present'].includes(name)) {
          checksRun.push(name)
          const result = await validator.validate(filePath, content)
          if (result.violations) {
            violations.push(...result.violations)
          }
        }
      }
    } else if (ext === '.ts' && filePath.includes('/src/')) {
      // Backend validators
      for (const [name, validator] of this.validators.entries()) {
        if (name.includes('backend') || ['mongodb-uri', 'dual-save'].includes(name)) {
          checksRun.push(name)
          const result = await validator.validate(filePath, content)
          if (result.violations) {
            violations.push(...result.violations)
          }
        }
      }
    } else if (ext === '.py') {
      // Python validators
      for (const [name, validator] of this.validators.entries()) {
        if (name.includes('python') || ['boolean-checks'].includes(name)) {
          checksRun.push(name)
          const result = await validator.validate(filePath, content)
          if (result.violations) {
            violations.push(...result.violations)
          }
        }
      }
    }

    return { violations, checksRun }
  }

  async validateSpecificPattern(patternId: string, code?: string, filePath?: string) {
    const validatorName = this.findValidatorForPattern(patternId)

    if (!validatorName) {
      return {
        passed: false,
        message: `No validator found for pattern: ${patternId}`
      }
    }

    const validator = this.validators.get(validatorName)
    if (!validator) {
      return {
        passed: false,
        message: `Validator ${validatorName} not initialized`
      }
    }

    let content = code
    if (!content && filePath) {
      content = fs.readFileSync(filePath, 'utf8')
    }

    if (!content) {
      return {
        passed: false,
        message: 'No code or file path provided'
      }
    }

    const result = await validator.validate(filePath || 'inline', content)

    return {
      passed: result.violations.length === 0,
      message: result.violations.length > 0 ? result.violations[0].message : 'Pattern validation passed',
      fix: result.violations.length > 0 ? result.violations[0].fix : undefined
    }
  }

  async validateDeployment() {
    const checks: any[] = []

    // Run submodule sync check
    const submoduleValidator = this.validators.get('submodule-sync')
    if (submoduleValidator) {
      const result = await submoduleValidator.validate('', '')
      checks.push({
        name: 'Submodule Sync',
        passed: result.violations.length === 0,
        severity: 'error',
        message: result.violations.length > 0 ? result.violations[0].message : 'All submodules synced',
        fix: result.violations.length > 0 ? result.violations[0].fix : undefined
      })
    }

    // TODO: Add more deployment checks (env vars, tests, etc.)

    const ready = checks.filter(c => c.severity === 'error' && !c.passed).length === 0

    return {
      ready,
      checks
    }
  }

  private findValidatorForPattern(patternId: string): string | undefined {
    // Map pattern IDs to validator names
    const mapping: Record<string, string> = {
      'frontend-explicit-imports': 'explicit-imports',
      'frontend-page-hero-header': 'page-structure',
      'frontend-navigation-present': 'navigation-present',
      'backend-mongodb-uri-format': 'mongodb-uri',
      'backend-dual-collection-save': 'dual-save',
      'python-explicit-none-check': 'boolean-checks',
      'deployment-submodule-sync': 'submodule-sync'
    }

    return mapping[patternId]
  }

  private findGitRoot(): string {
    try {
      const { execSync } = require('child_process')
      const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
      return gitRoot
    } catch (error) {
      console.warn('Could not find git root, using process.cwd():', error)
      return process.cwd()
    }
  }

  private getChangedFiles(): string[] {
    try {
      const { execSync } = require('child_process')
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      return output.trim().split('\n').filter(Boolean)
    } catch (error) {
      console.error('Failed to get changed files:', error)
      return []
    }
  }

  getStandards() {
    return this.standards
  }

  getStandardById(id: string): Standard | undefined {
    // Search through all categories
    for (const category of Object.values(this.standards.standards)) {
      for (const standard of Object.values(category as any)) {
        if ((standard as any).id === id) {
          return standard as Standard
        }
      }
    }
    return undefined
  }
}
