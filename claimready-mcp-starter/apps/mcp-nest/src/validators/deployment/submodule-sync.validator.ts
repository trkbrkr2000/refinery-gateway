import { Violation } from '../../services/validator.service'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export class SubmoduleSyncValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    const standard = this.standards.standards.deployment.submoduleSync

    try {
      // Get the repository root
      const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()

      // Check if this is a git repository with submodules
      const gitmodulesPath = path.join(repoRoot, '.gitmodules')
      if (!fs.existsSync(gitmodulesPath)) {
        // No submodules, validation passes
        return { violations }
      }

      // Get submodule status
      const submoduleStatus = execSync('git submodule status', { encoding: 'utf8', cwd: repoRoot })
      const submodules = submoduleStatus.trim().split('\n')

      for (const submodule of submodules) {
        const parts = submodule.trim().split(/\s+/)
        if (parts.length < 2) continue

        const status = parts[0].charAt(0)
        const commit = parts[0].substring(1)
        const submodulePath = parts[1]

        // Status indicators:
        // - : submodule not initialized
        // + : submodule commit doesn't match what's in the index (uncommitted)
        // U : submodule has conflicts

        if (status === '+') {
          violations.push({
            standardId: standard.id,
            severity: standard.severity,
            file: submodulePath,
            message: `Submodule '${submodulePath}' has uncommitted changes. ${standard.rationale}`,
            fix: `Commit and push changes in submodule first:\ncd ${submodulePath}\ngit add .\ngit commit -m "Your commit message"\ngit push\ncd ${repoRoot}\ngit add ${submodulePath}\ngit commit -m "Update ${submodulePath} submodule"`
          })
        }

        // Check if submodule has unpushed commits
        try {
          const submoduleRepoPath = path.join(repoRoot, submodulePath)
          if (fs.existsSync(submoduleRepoPath)) {
            const unpushed = execSync('git log @{u}.. --oneline', {
              encoding: 'utf8',
              cwd: submoduleRepoPath
            }).trim()

            if (unpushed) {
              const unpushedCount = unpushed.split('\n').length
              violations.push({
                standardId: standard.id,
                severity: standard.severity,
                file: submodulePath,
                message: `Submodule '${submodulePath}' has ${unpushedCount} unpushed commit(s). ${standard.rationale}`,
                fix: `Push submodule commits first:\ncd ${submodulePath}\ngit push\ncd ${repoRoot}`
              })
            }
          }
        } catch (error) {
          // Submodule might not have remote tracking - skip check
        }
      }
    } catch (error) {
      // If git commands fail, skip validation
      console.error('Submodule validation error:', error)
    }

    return { violations }
  }
}
