import { Violation } from '../../services/validator.service'
import { execSync } from 'child_process'

export class BranchNamingValidator {
  private standards: any

  constructor(standards: any) {
    this.standards = standards
  }

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Get current branch
    try {
      const currentBranch = this.getCurrentBranch()

      // Check branch protection
      const protectionViolation = this.checkBranchProtection(currentBranch)
      if (protectionViolation) {
        violations.push(protectionViolation)
      }

      // Check branch naming
      const namingViolation = this.checkBranchNaming(currentBranch)
      if (namingViolation) {
        violations.push(namingViolation)
      }
    } catch (error) {
      // Not in a git repo or can't determine branch
      console.warn('Could not determine git branch:', error)
    }

    return { violations }
  }

  private getCurrentBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    } catch (error) {
      throw new Error('Not in a git repository')
    }
  }

  /**
   * Check if trying to commit directly to protected branches (main or develop)
   */
  private checkBranchProtection(branch: string): Violation | null {
    const protectionStandard = this.standards.standards.git.branchProtection
    const protectedBranches = protectionStandard.protectedBranches

    if (protectedBranches.includes(branch)) {
      const branchType = branch === 'main' ? 'PRODUCTION' : 'STAGING'

      return {
        standardId: protectionStandard.id,
        severity: protectionStandard.severity,
        file: '.git/HEAD',
        message: `❌ BLOCKED: Direct commits to '${branch}' branch are not allowed!\n\n   '${branch}' = ${branchType} environment\n   \n   You must work in a feature branch and merge via Pull Request.`,
        fix: `1. Create a feature branch:\n      git checkout -b feature/your-feature-name\n   \n   2. Make your changes and commit:\n      git add .\n      git commit -m "Your changes"\n   \n   3. Push and create a PR:\n      git push -u origin feature/your-feature-name\n      gh pr create --base ${branch}\n   \n   Protected branches:\n   • main = PRODUCTION (direct commits blocked)\n   • develop = STAGING (direct commits blocked)\n   \n   Always merge via Pull Request for code review!`,
      }
    }

    return null
  }

  /**
   * Check if branch name follows naming conventions
   */
  private checkBranchNaming(branch: string): Violation | null {
    const standard = this.standards.standards.git.branchNaming

    // Skip validation for protected branches (they have their own rules)
    const protectedBranches = ['main', 'master', 'develop']
    if (protectedBranches.includes(branch)) {
      return null
    }

    // Check against allowed patterns
    const allowedPatterns = standard.allowedPatterns
    const isValid = allowedPatterns.some((pattern: string) => {
      const regex = new RegExp(pattern)
      return regex.test(branch)
    })

    if (!isValid) {
      return {
        standardId: standard.id,
        severity: standard.severity,
        file: '.git/HEAD',
        message: `Branch name '${branch}' doesn't follow naming conventions.`,
        fix: `Use one of these formats:\n   • feature/description - for new features\n   • fix/description - for bug fixes\n   • hotfix/description - for critical production fixes\n   • release/version - for release branches\n   • chore/description - for maintenance tasks\n   \n   Examples:\n   ✅ ${standard.examples.correct.join('\n   ✅ ')}\n   \n   ❌ Avoid:\n   ${standard.examples.incorrect.join(', ')}\n   \n   To rename your branch:\n   git branch -m ${this.suggestBranchName(branch)}`,
      }
    }

    return null
  }

  /**
   * Suggest a proper branch name based on current name
   */
  private suggestBranchName(currentName: string): string {
    // Try to extract meaningful parts
    const cleaned = currentName.replace(/[^a-z0-9-]/gi, '-').toLowerCase()

    // If it looks like a fix
    if (cleaned.includes('fix') || cleaned.includes('bug')) {
      return `fix/${cleaned}`
    }

    // Default to feature
    return `feature/${cleaned}`
  }

  /**
   * Check if currently on a protected branch (for external use)
   */
  isProtectedBranch(): { protected: boolean; branch: string; type?: string } {
    try {
      const branch = this.getCurrentBranch()
      const protectionStandard = this.standards.standards.git.branchProtection

      if (protectionStandard.protectedBranches.includes(branch)) {
        return {
          protected: true,
          branch,
          type: branch === 'main' ? 'production' : 'staging',
        }
      }

      return { protected: false, branch }
    } catch (error) {
      return { protected: false, branch: 'unknown' }
    }
  }
}